/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  TrendingUp, 
  Wallet, 
  Heart, 
  Activity, 
  Globe, 
  DollarSign, 
  Target,
  ChevronRight,
  RotateCcw,
  FlaskConical,
  History,
  LayoutDashboard,
  Award,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  HelpCircle,
  XCircle,
  Paperclip,
  FileText,
  X,
  Map,
  Flag,
  Info,
  AlertCircle,
  Rocket,
  Lightbulb,
  Brain,
  StickyNote,
  Pencil,
  Search,
  ClipboardCheck,
  CheckCircle,
  Mic,
  BarChart3,
  Laptop,
  Code2,
  Database,
  Calendar,
  GitBranch,
  ShieldCheck,
  FileSignature,
  Scale,
  Building2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { LogOut } from 'lucide-react';
import Login from './Login';

import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip
} from 'recharts';

// --- Types ---

type Domain = 'EdTech' | 'Clean Water' | 'Mental Health' | 'Rural Jobs' | 'Women Safety';
type City = 'Hyderabad' | 'Bengaluru' | 'Tier-2 town' | 'Pune' | 'Rural village';

interface Metrics {
  userAdoption: number;
  investorConfidence: number;
  cashRunway: number;
  teamMorale: number;
  founderHealth: number;
  socialImpact: number;
  revenueHealth: number;
  pmf: number;
}

interface Delta {
  metric: keyof Metrics;
  value: number;
}

interface Option {
  id: string;
  title: string;
  subtext: string;
  consequence: string;
  deltas: Delta[];
}

interface Scenario {
  title: string;
  description: string;
  question: string;
  options: Option[];
}

interface DecisionHistory {
  scenarioTitle: string;
  selectedOptionId: string;
  selectedOptionTitle: string;
  consequence: string;
  deltas: Delta[];
  allOptions: Option[];
}

interface IdeaEvaluation {
  metrics: Metrics;
  summary: {
    overview: string;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
  };
  docId?: string;
}

interface SandboxPath {
  id: string;
  title: string;
  subtext: string;
  consequence: string;
  detailedAnalysis: string;
  deltas: Delta[];
}

interface SandboxResponse {
  overallSummary: string;
  pathA: SandboxPath;
  pathB: SandboxPath;
}

interface RoadmapStep {
  id: string;
  title: string;
  brief: string;
  todo: string[];
  risk: string;
  pattern: string;
}

interface RoadmapPhase {
  id: string;
  title: string;
  description: string;
  steps: RoadmapStep[];
}

// --- Constants & Data ---

const DOMAINS: Domain[] = ['EdTech', 'Clean Water', 'Mental Health', 'Rural Jobs', 'Women Safety'];
const CITIES: City[] = ['Hyderabad', 'Bengaluru', 'Tier-2 town', 'Pune', 'Rural village'];

const INITIAL_METRICS: Metrics = {
  userAdoption: 40,
  investorConfidence: 30,
  cashRunway: 80,
  teamMorale: 70,
  founderHealth: 90,
  socialImpact: 20,
  revenueHealth: 10,
  pmf: 15,
};

const THEMES = [
  {
    id: 'idea',
    name: 'Phase 1 — IDEA',
    primary: '#7F77DD',
    secondary: '#4F46E5',
    accent: '#A78BFA',
    bg: 'bg-[#0F0F1A]',
    font: 'font-indie',
    chatTone: 'Curious Mentor',
    icon: Lightbulb,
    icons: {
      main: Lightbulb,
      brain: Brain,
      note: StickyNote,
      pencil: Pencil,
      query: HelpCircle
    },
    chatStyle: 'rounded-[24px] border-2 border-[#7F77DD]/30 shadow-[0_0_15px_rgba(127,119,221,0.2)]',
    animation: 'hover:scale-105 transition-transform duration-300'
  },
  {
    id: 'validate',
    name: 'Phase 2 — VALIDATE',
    primary: '#1D9E75',
    secondary: '#0D9488',
    accent: '#4ADE80',
    bg: 'bg-[#F0FDF4]',
    font: 'font-sans',
    chatTone: 'Research Analyst',
    icon: Search,
    icons: {
      main: Search,
      clipboard: ClipboardCheck,
      check: CheckCircle,
      mic: Mic,
      chart: BarChart3
    },
    chatStyle: 'rounded-none border-l-4 border-[#1D9E75] bg-white',
    animation: 'transition-opacity duration-500'
  },
  {
    id: 'build',
    name: 'Phase 3 — BUILD',
    primary: '#3B82F6',
    secondary: '#1E3A8A',
    accent: '#22D3EE',
    bg: 'bg-[#F8FAFC]',
    font: 'font-poppins',
    chatTone: 'Startup Advisor',
    icon: Rocket,
    icons: {
      main: Rocket,
      laptop: Laptop,
      code: Code2,
      money: DollarSign,
      db: Database
    },
    chatStyle: 'rounded-lg bg-gradient-to-br from-[#3B82F6]/5 to-transparent border border-[#3B82F6]/20',
    animation: 'hover:-translate-y-1 transition-transform duration-200'
  },
  {
    id: 'grow',
    name: 'Phase 4 — GROW',
    primary: '#F59E0B',
    secondary: '#EA580C',
    accent: '#FBBF24',
    bg: 'bg-[#FFFBEB]',
    font: 'font-nunito',
    chatTone: 'Team Lead',
    icon: Users,
    icons: {
      main: Users,
      chart: TrendingUp,
      team: Users,
      calendar: Calendar,
      workflow: GitBranch
    },
    chatStyle: 'rounded-[32px] border border-[#F59E0B]/20 bg-white/80 backdrop-blur-sm',
    animation: 'hover:scale-[1.02] transition-all duration-400'
  },
  {
    id: 'scale',
    name: 'Phase 5 — SCALE',
    primary: '#E24B4A',
    secondary: '#991B1B',
    accent: '#94A3B8',
    bg: 'bg-[#1A1A1A]',
    font: 'font-playfair',
    chatTone: 'CEO Advisor',
    icon: ShieldCheck,
    icons: {
      main: ShieldCheck,
      contract: FileSignature,
      law: Scale,
      analytics: BarChart3,
      building: Building2
    },
    chatStyle: 'rounded-md border border-white/10 bg-[#262626] text-white',
    animation: 'transition-all duration-700'
  }
];

const STARTUP_ROADMAP: RoadmapPhase[] = [
  {
    id: 'phase-1',
    title: 'Phase 1 — Idea',
    description: 'Turning a problem you noticed into something worth building.',
    steps: [
      {
        id: 'p1-s1',
        title: 'Problem Discovery',
        brief: 'Find a real, painful problem — not a solution looking for a problem.',
        todo: [
          'Talk to 20+ people who have this problem',
          'Write down the exact words they use to describe it',
          'Check if they currently pay for a workaround',
          'Rank problems by frequency × pain level'
        ],
        risk: 'You build something nobody needed. 42% of startups fail for this exact reason.',
        pattern: 'Founder built a vernacular app for farmers without talking to farmers. Product had zero traction.'
      },
      {
        id: 'p1-s2',
        title: 'Idea Refinement',
        brief: 'Shape the raw problem into a viable startup concept.',
        todo: [
          'Define who specifically has this problem',
          'Write a one-sentence pitch',
          'Identify your unfair advantage',
          'Validate demand with a landing page or waitlist'
        ],
        risk: 'You waste months building in the wrong direction. Pivots cost 3–6 months of runway.',
        pattern: 'Founders who define "anyone who needs X" as their user spend months building generic features.'
      }
    ]
  },
  {
    id: 'phase-2',
    title: 'Phase 2 — Validate',
    description: 'Before writing code, prove someone will actually use and pay.',
    steps: [
      {
        id: 'p2-s1',
        title: 'User Interviews',
        brief: '10–20 conversations about past behavior, not hypotheticals.',
        todo: [
          'Ask about past behavior, not hypotheticals',
          'Never pitch during an interview',
          'Look for frequency, severity, and workaround',
          'Record or take notes'
        ],
        risk: 'You build based on assumptions. Every assumption costs money to un-build.',
        pattern: 'A health app team skipped interviews and built a tracker users didn\'t want.'
      },
      {
        id: 'p2-s2',
        title: 'Competitor Mapping',
        brief: 'Find the gap they all leave unfilled.',
        todo: [
          'List direct and indirect competitors',
          'Find the gap they all leave unfilled',
          'Know pricing, retention, and complaints',
          'Define why users would switch'
        ],
        risk: 'You launch into a crowded market without differentiation.',
        pattern: 'A founder in EdTech didn’t map WhatsApp groups as competitors.'
      },
      {
        id: 'p2-s3',
        title: 'MVP Definition',
        brief: 'Define one core hypothesis and cut 60% of features.',
        todo: [
          'Define one core hypothesis',
          'Cut 60% of features',
          'Build a mockup or prototype first',
          'Define success metric before building'
        ],
        risk: 'You over-engineer v1 and run out of runway.',
        pattern: '"We need one more feature before launch" delays learning and burns cash.'
      }
    ]
  },
  {
    id: 'phase-3',
    title: 'Phase 3 — Build & Fund',
    description: 'Building the product and raising first money.',
    steps: [
      {
        id: 'p3-s1',
        title: 'DPIIT Startup Registration',
        brief: 'Register on startupindia.gov.in for tax exemptions.',
        todo: [
          'Register on startupindia.gov.in',
          'Get recognition certificate',
          'Unlock tax exemption and grants'
        ],
        risk: 'You miss government funding and tax benefits.',
        pattern: 'A startup missed ₹25L grant eligibility because they hadn’t registered.'
      },
      {
        id: 'p3-s2',
        title: 'GST Registration',
        brief: 'Register before invoicing companies.',
        todo: [
          'Register before invoicing companies',
          'Set up accounting from day one',
          'Keep all receipts',
          'File returns regularly'
        ],
        risk: 'You cannot legally invoice companies. Penalties accumulate.',
        pattern: 'Startup had ₹3.4L GST penalties. Investor withdrew term sheet.'
      },
      {
        id: 'p3-s3',
        title: 'Building v1 with Feedback',
        brief: 'Release to 10 real users early.',
        todo: [
          'Release to 10 real users early',
          'Use analytics tool',
          'Define North Star metric',
          'Talk to a user every week'
        ],
        risk: 'You build in isolation and launch to silence.',
        pattern: 'Startup discovered a critical bug after 3 months due to slow release.'
      },
      {
        id: 'p3-s4',
        title: 'Angel / Seed Funding',
        brief: 'Raise after traction with a solid pitch deck.',
        todo: [
          'Raise after traction',
          'Prepare pitch deck',
          'Know valuation logic',
          'Target domain-expert investors'
        ],
        risk: 'You raise too early or too late.',
        pattern: 'Founder raised too early and lost majority equity.'
      }
    ]
  },
  {
    id: 'phase-4',
    title: 'Phase 4 — Grow',
    description: 'Turn early traction into repeatable growth.',
    steps: [
      {
        id: 'p4-s1',
        title: 'Hiring First 3 People',
        brief: 'Hire complementary skills with test projects.',
        todo: [
          'Hire complementary skills',
          'Give test project before hiring',
          'Define success metrics',
          'Use vesting schedule'
        ],
        risk: 'Bad hires drain runway and culture.',
        pattern: 'Startup spent ₹9.6L salary on wrong hire and failed.'
      },
      {
        id: 'p4-s2',
        title: 'Go-to-Market Strategy',
        brief: 'Focus on one channel first and calculate CAC/LTV.',
        todo: [
          'Focus on one channel first',
          'Calculate CAC and LTV',
          'Build distribution before ads'
        ],
        risk: 'Growth stops when founder stops pushing.',
        pattern: 'Startup relied only on founder network.'
      },
      {
        id: 'p4-s3',
        title: 'Founder Mental Health',
        brief: 'Monthly alignment and personal boundaries.',
        todo: [
          'Monthly alignment meeting',
          'Personal boundary time',
          'Define success expectations'
        ],
        risk: 'Co-founder conflict destroys company.',
        pattern: 'Two founders disagreed on exit strategy. Company collapsed.'
      }
    ]
  },
  {
    id: 'phase-5',
    title: 'Phase 5 — Scale',
    description: 'Scaling means repeating what works.',
    steps: [
      {
        id: 'p5-s1',
        title: 'Series A Preparation',
        brief: 'Prepare audited accounts and data room.',
        todo: [
          'Prepare audited accounts',
          'Build data room',
          'Know growth metrics'
        ],
        risk: 'Deal collapses during due diligence.',
        pattern: 'Startup lost funding due to missing IP ownership.'
      },
      {
        id: 'p5-s2',
        title: 'Compliance & IP',
        brief: 'File patents and trademark brand.',
        todo: [
          'File patents',
          'Trademark brand',
          'Sign IP agreements',
          'Maintain compliance calendar'
        ],
        risk: 'You may not legally own your product.',
        pattern: 'Startup had to rebrand after trademark conflict.'
      },
      {
        id: 'p5-s3',
        title: 'Impact Measurement',
        brief: 'Define measurable impact metrics.',
        todo: [
          'Define measurable impact metrics',
          'Use recognised frameworks',
          'Report impact to investors'
        ],
        risk: 'Impact investors will not fund you.',
        pattern: 'Grant rejected due to lack of measurable outcomes.'
      }
    ]
  }
];

// --- AI Service via Backend ---
const BACKEND_URL = 'http://localhost:5001/api';

interface StartupFile {
  name: string;
  mimeType: string;
  data: string; // base64
}

const generateScenario = async (domain: string, city: string, idea: string, files: StartupFile[], metrics: Metrics, history: DecisionHistory[]): Promise<Scenario> => {
  // BYPASS BACKEND - HARDCODE FIXED SCENARIO
  return {
    title: 'Strategic Dilemma',
    description: 'You need to choose your first marketing channel. Do you go with content or direct sales?',
    question: 'How will you acquire your first 50 users?',
    options: [
      { 
        id: 'opt1', 
        title: 'Content Marketing', 
        subtext: 'Build a community through educational blog posts about property management.', 
        consequence: 'Slow but steady organic growth with high trust.',
        deltas: [{ metric: 'userAdoption', value: 10 }, { metric: 'cashRunway', value: -5 }]
      },
      { 
        id: 'opt2', 
        title: 'Direct Sales', 
        subtext: 'Cold call property owners in the city to get immediate bookings.', 
        consequence: 'Rapid growth but high burn rate on commission.',
        deltas: [{ metric: 'userAdoption', value: 25 }, { metric: 'cashRunway', value: -15 }]
      }
    ]
  };
};

const evaluateIdea = async (domain: string, city: string, idea: string, files: StartupFile[]): Promise<IdeaEvaluation> => {
  // BYPASS BACKEND - HARDCODE FIXED EVALUATION FOR HOSTMATE
  return {
    summary: {
      overview: "HostMate is a streamlined property management companion specifically designed for rural and first-time homestay hosts who find professional tools too complex.",
      strengths: [
        "Solves a real pain point for non-professional hosts in rural areas",
        "Highly accessible concept with low barrier to entry for first-time hosts",
        "Sustainable recurring revenue model through property subscriptions",
        "Perfect scope for an MVP with clear expansion potential into local tourism"
      ],
      weaknesses: [
        "Significant competition from established property management tools",
        "Low tech adoption rates among older hosts in rural areas may hinder growth",
        "High dependency on localized pricing data for accurate suggestions",
        "Requires high level of trust for hosts to automate financial communications"
      ],
      suggestions: [
        "Prioritize WhatsApp integration for easier guest and cleaners communication",
        "Narrow initial launch to a specific tourist hub to build density and trust",
        "Offer a free basic tier for single-property hosts to accelerate acquisition",
        "Invest in localized pricing data to make the pricing suggester a killer feature"
      ]
    },
    metrics: {
      userAdoption: 38,
      investorConfidence: 65,
      cashRunway: 75,
      teamMorale: 78,
      founderHealth: 65,
      socialImpact: 55,
      revenueHealth: 65,
      pmf: 30
    }
  };
};

const MetricBar = ({ label, value, color, showWarning }: { label: string, value: number, color: string, showWarning?: boolean }) => (
  <div className="mb-3">
    <div className="flex justify-between items-center mb-1">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</span>
      <div className="flex items-center gap-1">
        {showWarning && value < 30 && <AlertTriangle size={10} className="text-red-500 animate-pulse" />}
        <span className="text-[10px] font-mono">{Math.round(value)}%</span>
      </div>
    </div>
    <div className="h-[4px] w-full bg-gray-200 rounded-full overflow-hidden">
      <motion.div 
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </div>
  </div>
);


export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const [gameState, setGameState] = useState<'onboarding' | 'evaluating' | 'playing' | 'debrief'>('onboarding');
  const [domain, setDomain] = useState<Domain | null>(null);
  const [city, setCity] = useState<City | null>(null);
  const [startupIdea, setStartupIdea] = useState('');
  const [startupFiles, setStartupFiles] = useState<StartupFile[]>([]);
  const [metrics, setMetrics] = useState<Metrics>(INITIAL_METRICS);
  const [evaluation, setEvaluation] = useState<IdeaEvaluation | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isNewUser, setIsNewUser] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(() => {
    const saved = localStorage.getItem('startup_phase');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [showPhaseTransition, setShowPhaseTransition] = useState(false);
  const [history, setHistory] = useState<DecisionHistory[]>([]);
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [isLoadingScenario, setIsLoadingScenario] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [showWhatIf, setShowWhatIf] = useState(false);
  const [showSandbox, setShowSandbox] = useState(false);
  const [isApplyingSandbox, setIsApplyingSandbox] = useState(false);
  const [beforeSandboxMetrics, setBeforeSandboxMetrics] = useState<Metrics | null>(null);
  const [analysisStep, setAnalysisStep] = useState(0);
  const analysisSteps = [
    "Scanning market competition...",
    "Analyzing host demographics in " + city + "...",
    "Predicting user adoption curves...",
    "Assessing localized pricing models...",
    "Simulating long-term cash runway...",
    "Weaving strategic recommendations..."
  ];

  useEffect(() => {
    let interval: any;
    if (isEvaluating) {
      setAnalysisStep(0);
      interval = setInterval(() => {
        setAnalysisStep(prev => (prev + 1) % analysisSteps.length);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isEvaluating, city]);
  const [showSandboxSummary, setShowSandboxSummary] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>(() => {
    const saved = localStorage.getItem('startup_completed_steps');
    return saved ? JSON.parse(saved) : [];
  });
  const [startupDocId, setStartupDocId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('startup_phase', currentPhaseIndex.toString());
  }, [currentPhaseIndex]);

  useEffect(() => {
    localStorage.setItem('startup_completed_steps', JSON.stringify(completedSteps));
  }, [completedSteps]);
  const [phaseCompleteCelebration, setPhaseCompleteCelebration] = useState<string | null>(null);
  const [lastAppliedSandboxPath, setLastAppliedSandboxPath] = useState<SandboxPath | null>(null);

  const [sandboxMessages, setSandboxMessages] = useState<{ role: 'user' | 'ai', content: string, paths?: { pathA: SandboxPath, pathB: SandboxPath } }[]>([]);
  const [sandboxInput, setSandboxInput] = useState('');
  const [isSandboxLoading, setIsSandboxLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pendingSandboxPaths, setPendingSandboxPaths] = useState<{ pathA: SandboxPath, pathB: SandboxPath } | null>(null);

  const selectedOption = currentScenario?.options.find(o => o.id === selectedOptionId);

  const currentTheme = THEMES[currentPhaseIndex];

  useEffect(() => {
    const phaseIndex = currentPhaseIndex;
    if (phaseIndex >= STARTUP_ROADMAP.length) return;

    const currentPhase = STARTUP_ROADMAP[phaseIndex];
    const phaseStepIds = currentPhase.steps.map(s => s.id);
    const isComplete = phaseStepIds.every(id => completedSteps.includes(id));

    if (isComplete && phaseIndex < THEMES.length - 1) {
      setTimeout(() => {
        setPhaseCompleteCelebration(currentPhase.title);
        
        setTimeout(() => {
          setPhaseCompleteCelebration(null);
          
          setTimeout(() => {
            setCurrentPhaseIndex(prev => prev + 1);
            setShowPhaseTransition(true);
            
            setTimeout(() => {
              setShowPhaseTransition(false);
            }, 3000);
          }, 400);
          
        }, 3000);
      }, 500);
    }
  }, [completedSteps, currentPhaseIndex]);

  const handleStart = async () => {
    if (domain && city && startupIdea.trim()) {
      setIsEvaluating(true);
      setGameState('evaluating');
      
      const startTime = Date.now();
      
      // 100% FIXED LOCAL EVALUATION - NO BACKEND
      setTimeout(() => {
        const fixedEvaluation: IdeaEvaluation = {
          summary: {
            overview: "HostMate is a streamlined property management companion specifically designed for rural and first-time homestay hosts who find professional tools too complex. It bridges the gap between manual management and high-end enterprise software.",
            strengths: [
              "Solves a real pain point for non-professional hosts in rural areas",
              "Highly accessible concept with low barrier to entry for first-time hosts",
              "Sustainable revenue model via recurring property subscriptions",
              "Perfect scope for an MVP with clear expansion potential"
            ],
            weaknesses: [
              "Significant competition from established property management software",
              "Low tech adoption rates among older hosts in rural areas",
              "Dependency on high-quality localized pricing data",
              "Requires high level of trust and consistent user engagement"
            ],
            suggestions: [
              "Prioritize WhatsApp integration for easier guest communication",
              "Narrow your initial launch to a specific tourist hub",
              "Implement a free basic tier to accelerate user acquisition",
              "Invest in localized pricing data to improve the suggester feature"
            ]
          },
          metrics: {
            userAdoption: 38,
            investorConfidence: 65,
            cashRunway: 75,
            teamMorale: 78,
            founderHealth: 65,
            socialImpact: 55,
            revenueHealth: 65,
            pmf: 30
          }
        };

        setEvaluation(fixedEvaluation);
        setMetrics(fixedEvaluation.metrics);
        setIsEvaluating(false);
      }, 6000);
    }
  };

  const handleProceedToSimulation = () => {
    if (domain && city && startupIdea.trim()) {
      setGameState('playing');
      fetchNextScenario();
    }
  };

  const fetchNextScenario = () => {
    setIsLoadingScenario(true);
    // 100% STATIC SCENARIO - NO BACKEND
    setTimeout(() => {
      const fixedScenario: Scenario = {
        title: 'Strategic Dilemma',
        description: 'HostMate has its first 10 organic signups from rural homestays. To grow, you need to choose your primary acquisition channel.',
        question: 'How will you acquire your next 50 users in rural areas?',
        options: [
          { 
            id: 'opt1', 
            title: 'WhatsApp Referral Loop', 
            subtext: 'Incentivize existing hosts to refer neighbors via WhatsApp.', 
            consequence: 'Rapid, trust-based growth with low costs but depends on host social circles.',
            deltas: [{ metric: 'userAdoption', value: 20 }, { metric: 'cashRunway', value: -5 }]
          },
          { 
            id: 'opt2', 
            title: 'Local Hub Partnership', 
            subtext: 'Partner with local tourism boards and rural cooperatives.', 
            consequence: 'Higher credibility and bulk acquisition, but takes longer to negotiate.',
            deltas: [{ metric: 'investorConfidence', value: 15 }, { metric: 'userAdoption', value: 10 }]
          }
        ]
      };
      setCurrentScenario(fixedScenario);
      setIsLoadingScenario(false);
    }, 1500);
  };

  const handleOptionClick = (option: Option) => {
    if (selectedOptionId || isLoadingScenario) return;
    setSelectedOptionId(option.id);
  };

  const handleNextStage = async () => {
    if (!selectedOption || !currentScenario || !domain || !city) return;

    const decision: DecisionHistory = {
      scenarioTitle: currentScenario.title,
      selectedOptionId: selectedOption.id,
      selectedOptionTitle: selectedOption.title,
      consequence: selectedOption.consequence,
      deltas: selectedOption.deltas,
      allOptions: currentScenario.options
    };
    const newHistory = [...history, decision];
    setHistory(newHistory);

    const newMetrics = { ...metrics };
    selectedOption.deltas.forEach(d => {
      newMetrics[d.metric] = Math.max(0, Math.min(100, newMetrics[d.metric] + d.value));
    });
    setMetrics(newMetrics);

    if (startupDocId) {
      try {
        await fetch(`${BACKEND_URL}/history`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ startupDocId, decision, newMetrics })
        });
      } catch (e) { console.error("Firebase error logging history:", e); }
    }

    setSelectedOptionId(null);
    if (newHistory.length >= 10) {
      setGameState('debrief');
    } else {
      fetchNextScenario();
    }
  };

  const handleSandboxChat = async () => {
    if (!sandboxInput.trim() || isSandboxLoading) return;

    const userMsg = sandboxInput;
    setSandboxInput('');
    setSandboxMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsSandboxLoading(true);

    setTimeout(() => {
      const data = {
        overallSummary: "Your strategic shift will define the trajectory of HostMate for the next 6-8 weeks.",
        pathA: {
          id: 'b2b',
          title: 'Switch to B2B Model',
          subtext: 'Partner with property developers and rural resorts.',
          consequence: 'Higher revenue stability, slower user acquisition.',
          detailedAnalysis: `### PATH A — Switch to B2B

**Phase 1 — Validate Demand (Week 1–2)**
* **Circumstances**: Direct outreach to regional property management firms.
* **Metrics + Evaluation**: 10+ leads → strong demand.

**Phase 2 — Product Hardening (Week 3–5)**
* **Circumstances**: Refactor tools into a multi-property dashboard.
* **Metrics + Evaluation**: 80% feature adoption by early adopters.

**Phase 3 — Scale Acquisition (Week 6–8)**
* **Circumstances**: Hire first corporate sales rep.
* **Metrics + Evaluation**: ₹50K MRR → viable path.`,
          deltas: [
            { metric: 'revenueHealth', value: 20 },
            { metric: 'userAdoption', value: -10 },
            { metric: 'investorConfidence', value: 15 }
          ]
        },
        pathB: {
          id: 'b2c_stay',
          title: 'Continue B2C Growth',
          subtext: 'Double down on the individual rural host MVP.',
          consequence: 'Viral adoption potential, but higher churn risk.',
          detailedAnalysis: `### PATH B — Continue B2C

**Phase 1 — Community Drive (Week 1–2)**
* **Circumstances**: Launch WhatsApp-driven referral program.
* **Metrics + Evaluation**: 50+ new hosts → high organic growth.

**Phase 2 — Viral Loop (Week 3–5)**
* **Circumstances**: Gamify host reviews and check-in efficiency.
* **Metrics + Evaluation**: 30% weekly user retention.

**Phase 3 — Monetization (Week 6–8)**
* **Circumstances**: Transition first 100 users to paid subscription.
* **Metrics + Evaluation**: 5% conversion rate → validated monetization.`,
          deltas: [
            { metric: 'userAdoption', value: 25 },
            { metric: 'revenueHealth', value: -5 },
            { metric: 'cashRunway', value: -10 }
          ]
        }
      };

      setSandboxMessages(prev => [...prev, { 
        role: 'ai', 
        content: `I've analyzed two possible futures for HostMate. Compare the paths below.`,
        paths: { pathA: data.pathA as SandboxPath, pathB: data.pathB as SandboxPath }
      }]);
      setPendingSandboxPaths({ pathA: data.pathA as SandboxPath, pathB: data.pathB as SandboxPath });
      setIsSandboxLoading(false);
    }, 1500);
  };

  const applySandboxPath = async (path: SandboxPath) => {
    // CAPTURE CURRENT METRICS IMMEDIATELY
    setBeforeSandboxMetrics({ ...metrics });
    setLastAppliedSandboxPath(path);
    setIsApplyingSandbox(true);
    setShowSandbox(false);
    
    // 3-second simulation delay as requested by user
    setTimeout(async () => {
      const newMetrics = { ...metrics };
      path.deltas.forEach(d => {
        newMetrics[d.metric] = Math.max(0, Math.min(100, newMetrics[d.metric] + d.value));
      });
      
      const decision: DecisionHistory = {
        scenarioTitle: "Sandbox Intervention",
        selectedOptionId: "sandbox_" + Date.now(),
        selectedOptionTitle: path.title,
        consequence: path.consequence,
        deltas: path.deltas,
        allOptions: pendingSandboxPaths ? [pendingSandboxPaths.pathA, pendingSandboxPaths.pathB] : []
      };
      setHistory(prev => [...prev, decision]);
      
      setMetrics(newMetrics);
      
      if (startupDocId) {
        try {
          await fetch(`${BACKEND_URL}/history`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ startupDocId, decision, newMetrics })
          });
        } catch (e) { console.error("Firebase error logging path apply:", e); }
      }

      setShowSandboxSummary(true);
      setSandboxMessages([]);
      setPendingSandboxPaths(null);
      setIsApplyingSandbox(false);
    }, 3000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: StartupFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      
      const filePromise = new Promise<StartupFile>((resolve) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve({
            name: file.name,
            mimeType: file.type,
            data: base64
          });
        };
      });
      
      reader.readAsDataURL(file);
      newFiles.push(await filePromise);
    }
    
    setStartupFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setStartupFiles(prev => prev.filter((_, i) => i !== index));
  };

  const toggleStep = (stepId: string) => {
    setCompletedSteps(prev => {
      const isCompleted = prev.includes(stepId);
      return isCompleted ? prev.filter(id => id !== stepId) : [...prev, stepId];
    });
  };

  // --- Render Helpers ---

  // --- Render Helpers ---

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#7F77DD]" />
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={() => {}} />;
  }

  if (gameState === 'onboarding') {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-6 font-sans text-[13px]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white border-[0.5px] border-gray-200 rounded-2xl p-8 shadow-sm"
        >
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed">{error}</p>
              <button onClick={() => setError(null)} className="ml-auto">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">FounderSim</h1>
            <p className="text-muted-foreground text-xs">The social impact startup simulation.</p>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-4">Choose your problem area</h2>
              <div className="grid grid-cols-2 gap-2">
                {DOMAINS.map(d => (
                  <button
                    key={d}
                    onClick={() => setDomain(d)}
                    className={`p-3 rounded-lg border-[0.5px] text-left transition-all ${
                      domain === d 
                      ? 'border-[#7F77DD] bg-[#EEEDFE] text-[#3C3489] font-medium' 
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-4">Your city context</h2>
              <div className="flex flex-wrap gap-2">
                {CITIES.map(c => (
                  <button
                    key={c}
                    onClick={() => setCity(c)}
                    className={`px-4 py-2 rounded-full border-[0.5px] transition-all ${
                      city === c 
                      ? 'border-[#1D9E75] bg-[#E1F5EE] text-[#0F6E56] font-medium' 
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </section>

            <AnimatePresence>
              {domain && city && (
                <motion.section
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <h2 className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-4">Your Startup Idea</h2>
                  <div className="relative">
                    <textarea
                      value={startupIdea}
                      onChange={(e) => setStartupIdea(e.target.value)}
                      placeholder={`e.g., A platform that connects ${domain.toLowerCase()} experts with students in ${city}...`}
                      className="w-full p-4 rounded-xl border-[0.5px] border-gray-200 focus:border-[#7F77DD] focus:ring-1 focus:ring-[#7F77DD] outline-none transition-all min-h-[120px] text-gray-700 leading-relaxed pb-12"
                    />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2">
                      <label className="cursor-pointer p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-[#7F77DD]">
                        <Paperclip size={16} />
                        <input 
                          type="file" 
                          multiple 
                          className="hidden" 
                          onChange={handleFileUpload}
                          accept="image/*,application/pdf,text/plain"
                        />
                      </label>
                    </div>
                  </div>

                  {startupFiles.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {startupFiles.map((file, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[10px] font-medium text-gray-600"
                        >
                          <FileText size={12} className="text-[#7F77DD]" />
                          <span className="max-w-[120px] truncate">{file.name}</span>
                          <button 
                            onClick={() => removeFile(idx)}
                            className="hover:text-red-500 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.section>
              )}
            </AnimatePresence>

            <button
              disabled={!domain || !city || !startupIdea.trim()}
              onClick={handleStart}
              className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold tracking-tight hover:bg-black transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              Start Simulation <ChevronRight size={16} />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex font-sans text-[13px]">
      {/* Sidebar */}
      <aside className="w-[200px] bg-white border-r-[0.5px] border-gray-200 p-4 flex flex-col h-screen sticky top-0 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-lg font-black tracking-tighter text-gray-900">FounderSim</h1>
          <div className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter">{city} · {domain}</div>
        </div>

        <div className="flex-1">
          <h2 className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-4">Live Metrics</h2>
          <MetricBar label="User Adoption" value={metrics.userAdoption} color={currentTheme.primary} />
          <MetricBar label="Investor Confidence" value={metrics.investorConfidence} color="#378ADD" />
          <MetricBar label="Cash Runway" value={metrics.cashRunway} color="#E24B4A" showWarning />
          <MetricBar label="Team Morale" value={metrics.teamMorale} color={currentTheme.primary} />
          <MetricBar label="Founder Health" value={metrics.founderHealth} color="#D4537E" />
          <MetricBar label="Social Impact" value={metrics.socialImpact} color={currentTheme.primary} />
          <MetricBar label="Revenue Health" value={metrics.revenueHealth} color="#E24B4A" />
          <MetricBar label="Product-Market Fit" value={metrics.pmf} color="#BA7517" />
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100 space-y-2">
          <button 
            onClick={() => setShowRoadmap(true)}
            className="w-full py-2 px-3 border-[0.5px] rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
            style={{ 
              borderColor: currentTheme.primary,
              backgroundColor: `${currentTheme.primary}10`,
              color: currentTheme.primary
            }}
          >
            <Map size={12} /> Startup Roadmap
          </button>
          <button 
            onClick={() => setShowSandbox(true)}
            className="w-full py-2 px-3 border-[0.5px] border-gray-200 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <FlaskConical size={12} /> Test a change
          </button>
          
          {evaluation && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="text-[9px] uppercase tracking-widest font-bold text-gray-400 mb-3">Strategy Summary</h3>
              <div className="text-[11px] text-gray-600 leading-relaxed font-medium bg-gray-50 p-3 rounded-xl border-[0.5px] border-gray-100">
                <ReactMarkdown>{evaluation.summary.overview}</ReactMarkdown>
              </div>
            </div>
          )}
          {history.length > 0 && (
            <button 
              onClick={() => setShowWhatIf(true)}
              className="w-full py-2 px-3 border-[0.5px] border-gray-200 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <History size={12} /> What if?
            </button>
          )}

          <div className="mt-4 pt-4 border-t border-gray-100">
            <button 
              onClick={() => signOut(auth)}
              className="w-full py-2 px-3 text-red-500 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
            >
              <LogOut size={12} /> Log Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Area */}
      <main className={`flex-1 p-8 overflow-y-auto transition-all duration-1000 ease-in-out ${currentTheme.bg} ${currentTheme.font}`}>
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentPhaseIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto"
          >
            {isApplyingSandbox ? (
              <motion.div 
                key="sandbox-applying"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-24 text-center"
              >
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-[#7F77DD] blur-xl opacity-20 animate-pulse rounded-full" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  >
                    <Rocket className="w-16 h-16 text-[#7F77DD]" />
                  </motion.div>
                </div>
                <h2 className={`text-3xl font-black mb-4 ${currentTheme.id === 'idea' ? 'text-white' : 'text-gray-900'}`}>
                  Simulating Strategic Shift...
                </h2>
                <p className="text-muted-foreground font-medium text-sm max-w-xs mx-auto">
                  Applying selected timeline to your current core startup trajectory.
                </p>
              </motion.div>
            ) : showSandboxSummary && lastAppliedSandboxPath && beforeSandboxMetrics ? (
              <motion.div 
                key="sandbox-summary"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                className="space-y-8"
              >
                 <header className="text-center mb-12">
                  <motion.div 
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-900 text-white text-[10px] font-bold rounded-full uppercase tracking-widest mb-6 shadow-xl shadow-black/20"
                  >
                    <Rocket size={12} strokeWidth={3} /> Strategic Pivot Selected
                  </motion.div>
                  <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-2 leading-tight">
                    {lastAppliedSandboxPath.title}
                  </h1>
                  <p className="text-muted-foreground text-[10px] uppercase tracking-widest font-black opacity-40">Trajectory Results</p>
                </header>

              <div className="max-w-4xl mx-auto space-y-12 pb-12">
                {/* 1. THE PIE CHART (Refined Metrics) */}
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white border-[0.5px] border-gray-200 p-12 rounded-[48px] shadow-2xl flex flex-col items-center relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-80 h-80 bg-[#7F77DD]/5 rounded-full -mr-40 -mt-40 blur-3xl" />
                  
                  <div className="text-center mb-10">
                    <h3 className="text-gray-900 font-black text-xs uppercase tracking-widest mb-1">Refined Evaluation Metric</h3>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest opacity-60">Pulse Distribution Post-Pivot</p>
                  </div>

                  <div className="h-[450px] w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'User Adoption', value: metrics.userAdoption },
                            { name: 'Investor Conf.', value: metrics.investorConfidence },
                            { name: 'Cash Runway', value: metrics.cashRunway },
                            { name: 'PMFit', value: metrics.pmf },
                            { name: 'Team Morale', value: metrics.teamMorale },
                            { name: 'Founder Health', value: metrics.founderHealth },
                            { name: 'Social Impact', value: metrics.socialImpact },
                            { name: 'Revenue', value: metrics.revenueHealth }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={100}
                          outerRadius={160}
                          paddingAngle={6}
                          dataKey="value"
                          stroke="none"
                        >
                          {[
                            '#4F46E5', '#10B981', '#F59E0B', '#EC4899', 
                            '#8B5CF6', '#EF4444', '#06B6D4', '#111827'
                          ].map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry} 
                              className="hover:scale-105 transition-transform cursor-pointer"
                              style={{ filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.1))' }}
                            />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 flex flex-col gap-1 ring-8 ring-black/5">
                                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Real-Time Pulse</span>
                                  <span className="text-sm font-black text-gray-900 uppercase tracking-tight">{payload[0].name}</span>
                                  <span className="text-3xl font-black" style={{ color: payload[0].payload.fill }}>{payload[0].value}%</span>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Global Health</div>
                        <div className="text-6xl font-black text-gray-900 tracking-tighter">
                          {Math.round(Object.values(metrics).reduce((a, b) => a + b, 0) / 8)}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* LEGEND DOTS */}
                  <div className="mt-12 flex flex-wrap justify-center gap-4 max-w-lg">
                    {[
                      { name: 'User', color: '#4F46E5' },
                      { name: 'Investor', color: '#10B981' },
                      { name: 'Cash', color: '#F59E0B' },
                      { name: 'PMF', color: '#EC4899' },
                      { name: 'Team', color: '#8B5CF6' },
                      { name: 'Founder', color: '#EF4444' },
                      { name: 'Impact', color: '#06B6D4' },
                      { name: 'Revenue', color: '#111827' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-tight">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* 2. THE CONSEQUENCES (TIMELINE) */}
                <motion.div 
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gray-50 border-[0.5px] border-gray-200 p-12 rounded-[56px] shadow-xl relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-12">
                    <div>
                      <h3 className="text-gray-900 font-black text-xl mb-1 tracking-tight">The Resulting Consequences</h3>
                      <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">6–8 Weeks Strategic Execution Plan</p>
                    </div>
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100">
                      <Target className="text-[#7F77DD]" size={32} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-8 bg-white/60 border border-white/80 rounded-[32px] shadow-sm backdrop-blur-sm">
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2 px-3 py-1 bg-gray-50 border border-gray-100 rounded-full w-fit">
                        <div className="w-1.5 h-1.5 bg-[#7F77DD] rounded-full animate-pulse" /> Final Strategic Narrative
                      </div>
                      <p className="text-2xl font-black text-gray-900 leading-tight mb-8">
                        {lastAppliedSandboxPath.consequence}
                      </p>
                      
                      <div className="text-gray-900 text-sm sandbox-timeline-v2">
                         <ReactMarkdown>
                           {lastAppliedSandboxPath.detailedAnalysis}
                         </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>


              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex justify-center pt-6"
              >
                <button 
                  onClick={() => setShowSandboxSummary(false)}
                  className="px-12 py-5 bg-gray-900 text-white rounded-2xl font-black text-lg shadow-2xl shadow-black/20 hover:bg-black hover:scale-105 transition-all flex items-center justify-center gap-3"
                >
                  Continue Simulation <ChevronRight size={20} />
                </button>
              </motion.div>
            </motion.div>
          ) : gameState === 'evaluating' ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {isEvaluating ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="mb-8"
                  >
                    <Loader2 className="w-16 h-16" style={{ color: currentTheme.primary }} />
                  </motion.div>
                  <motion.h2 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-3xl font-black tracking-tight ${currentTheme.id === 'idea' ? 'text-white' : 'text-gray-900'}`}
                  >
                    Evaluating the idea...
                  </motion.h2>
                  <motion.p 
                    key={analysisStep}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="text-muted-foreground text-sm mt-3 max-w-xs mx-auto font-medium"
                  >
                    {analysisSteps[analysisStep]}
                  </motion.p>
                </div>
              ) : evaluation && (
                <div className="space-y-8">
                  <div className={`border-[0.5px] p-10 rounded-[40px] shadow-2xl relative overflow-hidden mb-8 ${
                    currentTheme.id === 'idea' ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'
                  }`}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#7F77DD]/10 to-transparent rounded-full -mr-32 -mt-32 blur-3xl" />
                    <h3 className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-6 flex items-center gap-2">
                       <ShieldCheck size={14} className="text-[#7F77DD]" /> 
                       Strategic Overview
                    </h3>
                    <div className={`text-xl leading-[1.6] font-medium italic relative z-10 ${
                      currentTheme.id === 'idea' ? 'text-gray-100' : 'text-gray-900'
                    }`}>
                      <ReactMarkdown>{evaluation.summary.overview}</ReactMarkdown>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {[
                      { 
                        title: 'Strengths', 
                        icon: CheckCircle2, 
                        items: evaluation.summary.strengths, 
                        color: '#1D9E75', 
                        bg: 'bg-[#E1F5EE]', 
                        darkBg: 'bg-[#1D9E75]/10',
                        darkBorder: 'border-[#1D9E75]/30'
                      },
                      { 
                        title: 'Weaknesses', 
                        icon: AlertTriangle, 
                        items: evaluation.summary.weaknesses, 
                        color: '#E24B4A', 
                        bg: 'bg-[#FCE8E8]', 
                        darkBg: 'bg-[#E24B4A]/10',
                        darkBorder: 'border-[#E24B4A]/30'
                      },
                      { 
                        title: 'Suggestions', 
                        icon: Target, 
                        items: evaluation.summary.suggestions, 
                        color: currentTheme.primary, 
                        bg: 'bg-[#F0EDFF]', 
                        darkBg: 'bg-[#7F77DD]',
                        darkBorder: 'border-[#7F77DD]'
                      }
                    ].map((section, idx) => (
                      <motion.div
                        key={section.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * idx }}
                        whileHover={{ scale: 1.02, translateY: -5 }}
                        className={`p-8 rounded-[32px] border-[0.5px] transition-all shadow-lg hover:shadow-2xl group relative overflow-hidden ${
                          currentTheme.id === 'idea' 
                            ? `${section.darkBg} ${section.darkBorder}` 
                            : `${section.bg} border-transparent`
                        }`}
                        style={currentTheme.id === 'idea' ? {} : { borderLeft: `4px solid ${section.color}` }}
                      >
                        <div className="flex items-center gap-4 mb-6">
                          <div className="p-3 rounded-2xl bg-white shadow-sm group-hover:scale-110 transition-transform" style={{ color: section.color }}>
                            <section.icon size={24} />
                          </div>
                          <h3 className="font-black text-lg uppercase tracking-tight" style={{ color: section.color }}>
                            {section.title}
                          </h3>
                        </div>
                        <ul className="space-y-4">
                          {section.items.map((item, i) => (
                            <li key={i} className={`flex gap-3 font-medium ${
                              currentTheme.id === 'idea' 
                                ? (section.title === 'Suggestions' ? 'text-white' : 'text-white/90') 
                                : 'text-gray-900 shadow-sm shadow-black/30'
                            }`}>
                              <span className={`opacity-70 mt-1 ${section.title === 'Suggestions' && currentTheme.id === 'idea' ? 'text-white' : ''}`} style={section.title === 'Suggestions' && currentTheme.id === 'idea' ? {} : { color: section.color }}>•</span> {item}
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    ))}
                  </div>

                  <div className={`mt-8 pt-8 border-t flex items-center justify-center gap-4 ${
                    currentTheme.id === 'idea' ? 'border-white/10' : 'border-gray-100'
                  }`}>
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                          currentTheme.id === 'idea' ? 'border-[#0F0F1A] bg-white/10 text-white/40' : 'border-white bg-gray-100 text-gray-400'
                        }`}>
                           AI
                        </div>
                      ))}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
                      Evaluation powered by FounderSim Strategy Engine
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button 
                      onClick={() => setShowRoadmap(true)}
                      className="flex-1 py-4 border-[0.5px] rounded-2xl font-bold transition-colors flex items-center justify-center gap-2"
                      style={{ 
                        borderColor: currentTheme.primary,
                        backgroundColor: `${currentTheme.primary}10`,
                        color: currentTheme.primary
                      }}
                    >
                      <Map size={18} /> View Roadmap
                    </button>
                    <button 
                      onClick={() => setShowSandbox(true)}
                      className="flex-1 py-4 border-[0.5px] border-gray-200 bg-white rounded-2xl font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <FlaskConical size={18} /> Test a change
                    </button>
                    <button 
                      onClick={handleProceedToSimulation}
                      className="flex-[1.5] py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-colors flex items-center justify-center gap-2"
                    >
                      Proceed to Simulation <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ) : gameState === 'debrief' ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <header className="mb-12 text-center">
                <h1 className="text-3xl font-bold tracking-tighter text-gray-900 mb-1">FounderSim · Debrief Report</h1>
                <p className="text-muted-foreground uppercase text-[10px] tracking-widest font-bold">
                  {history.length} decisions · {city} · {domain}
                </p>
              </header>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'User Adoption', key: 'userAdoption' },
                  { label: 'Investor Confidence', key: 'investorConfidence' },
                  { label: 'Social Impact', key: 'socialImpact' },
                  { label: 'Cash Runway', key: 'cashRunway' },
                  { label: 'Team Morale', key: 'teamMorale' },
                  { label: 'Founder Health', key: 'founderHealth' },
                  { label: 'Revenue Health', key: 'revenueHealth' },
                  { label: 'Product-Market Fit', key: 'pmf' }
                ].map(item => {
                  const val = metrics[item.key as keyof Metrics];
                  const color = val > 60 ? 'text-[#1D9E75]' : val < 30 ? 'text-[#E24B4A]' : 'text-[#378ADD]';
                  return (
                    <div key={item.key} className="bg-white border-[0.5px] border-gray-200 p-4 rounded-2xl text-center shadow-sm">
                      <div className={`text-2xl font-bold mb-1 ${color}`}>{Math.round(val)}%</div>
                      <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">{item.label}</div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-4 mb-12">
                {(() => {
                  const strongest = Object.entries(metrics).sort((a, b) => (b[1] as number) - (a[1] as number))[0];
                  const weakest = Object.entries(metrics).sort((a, b) => (a[1] as number) - (b[1] as number))[0];
                  
                  return (
                    <>
                      <div className="bg-[#E1F5EE] border-[0.5px] border-[#1D9E75] p-6 rounded-2xl">
                        <h3 className="text-[#0F6E56] font-bold text-[10px] uppercase tracking-widest mb-2">Strongest Quality</h3>
                        <p className="text-[#0F6E56] text-lg font-medium">Master of {strongest[0].replace(/([A-Z])/g, ' $1').toLowerCase()}</p>
                        <p className="text-[#0F6E56]/70 mt-1">Your decisions consistently prioritized long-term growth in this area.</p>
                      </div>
                      <div className="bg-[#FCE8E8] border-[0.5px] border-[#E24B4A] p-6 rounded-2xl">
                        <h3 className="text-[#A91D1D] font-bold text-[10px] uppercase tracking-widest mb-2">Biggest Blind Spot</h3>
                        <p className="text-[#A91D1D] text-lg font-medium">Neglected {weakest[0].replace(/([A-Z])/g, ' $1').toLowerCase()}</p>
                        <p className="text-[#A91D1D]/70 mt-1">You often traded this metric away to solve immediate crises.</p>
                      </div>
                      <div className="bg-[#FFF8E1] border-[0.5px] border-[#BA7517] p-6 rounded-2xl">
                        <h3 className="text-[#BA7517] font-bold text-[10px] uppercase tracking-widest mb-2">Strategic Recommendations</h3>
                        <div className="mt-2 space-y-2 text-[#633806] font-medium">
                          {metrics.cashRunway < 40 && <p>• Focus on unit economics and revenue to extend your runway.</p>}
                          {metrics.teamMorale < 40 && <p>• Invest in culture and team well-being to prevent burnout.</p>}
                          {metrics.userAdoption < 40 && <p>• Revisit your distribution strategy; growth is lagging.</p>}
                          {metrics.pmf < 40 && <p>• Pivot or refine the product; you haven't hit the sweet spot yet.</p>}
                          {metrics.socialImpact < 40 && <p>• Re-align with your mission; the social value is getting lost.</p>}
                          {metrics.revenueHealth < 40 && <p>• Explore new monetization channels to ensure sustainability.</p>}
                          {metrics.cashRunway >= 40 && metrics.teamMorale >= 40 && metrics.userAdoption >= 40 && <p>• You have a solid foundation. Now is the time to scale aggressively.</p>}
                        </div>
                      </div>
                      <div className="p-6 rounded-2xl border-[0.5px]" style={{ backgroundColor: `${currentTheme.primary}10`, borderColor: currentTheme.primary }}>
                        <h3 className="text-[#3C3489] font-bold text-[10px] uppercase tracking-widest mb-2">3 Key Lessons</h3>
                        <ul className="mt-2 space-y-2 text-[#3C3489] font-medium">
                          <li>• Impact requires sustainable cash flow, not just passion.</li>
                          <li>• Team morale is the silent engine of your startup.</li>
                          <li>• PMF is a moving target in {city}.</li>
                        </ul>
                      </div>
                    </>
                  );
                })()}
              </div>

              <section>
                <h2 className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-6">Decision Timeline</h2>
                <div className="relative border-l-[1px] border-gray-200 ml-2 pl-8 space-y-8">
                  {history.map((h, i) => {
                    const isPositive = h.deltas.reduce((acc, d) => acc + d.value, 0) > 0;
                    const isVeryNegative = h.deltas.some(d => d.value < -20);
                    const dotColor = isVeryNegative ? 'bg-[#E24B4A]' : isPositive ? 'bg-[#1D9E75]' : 'bg-[#7F77DD]';
                    
                    return (
                      <div key={i} className="relative">
                        <div className={`absolute -left-[37px] top-1 w-4 h-4 rounded-full border-4 border-white shadow-sm ${dotColor}`} />
                        <div className="bg-white border-[0.5px] border-gray-200 p-4 rounded-xl shadow-sm">
                          <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">{h.scenarioTitle}</div>
                          <div className="font-bold text-gray-900 mb-2">{h.selectedOptionTitle}</div>
                          <div className="flex flex-wrap gap-2">
                            {h.deltas.map((d, di) => (
                              <span key={di} className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${d.value > 0 ? 'bg-[#E1F5EE] text-[#0F6E56]' : 'bg-[#FCE8E8] text-[#A91D1D]'}`}>
                                {d.metric.replace(/([A-Z])/g, ' $1').toUpperCase()} {d.value > 0 ? '+' : ''}{d.value}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <div className="mt-12 text-center">
                <button 
                  onClick={() => window.location.reload()}
                  className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors"
                >
                  Play Again
                </button>
              </div>
            </motion.div>
          ) : isLoadingScenario ? (
            <div className="h-full flex flex-col items-center justify-center py-20 text-center">
              <Loader2 className="w-10 h-10 text-[#7F77DD] animate-spin mb-4" />
              <h3 className="text-lg font-bold text-gray-900">Simulating next challenge...</h3>
              <p className="text-muted-foreground text-xs mt-1">Calculating the trajectory for HostMate in {city}.</p>
            </div>
          ) : !currentScenario && evaluation ? (
            /* FALLBACK TO EVALUATION IF NO SCENARIO YET */
            <div className="flex flex-col items-center justify-center py-20">
               <Loader2 className="w-8 h-8 text-[#7F77DD] animate-spin mb-4" />
               <p className="text-gray-500 font-medium">Finalizing your strategic dashboard...</p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <div className="inline-block px-2 py-1 text-[10px] font-bold rounded uppercase tracking-widest mb-4" style={{ backgroundColor: `${currentTheme.primary}20`, color: currentTheme.primary }}>
                  Scenario {history.length + 1}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">{currentScenario?.title}</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">{currentScenario?.description}</p>
                <p className="text-gray-900 font-bold text-[14px]">{currentScenario?.question}</p>
              </div>

              <div className="grid gap-4 mb-8">
                {currentScenario?.options.map(option => (
                  <button
                    key={option.id}
                    disabled={!!selectedOptionId}
                    onClick={() => handleOptionClick(option)}
                    className={`p-5 rounded-2xl border-[0.5px] text-left transition-all relative overflow-hidden group ${currentTheme.animation} ${
                      selectedOptionId === option.id 
                      ? 'bg-white shadow-lg' 
                      : selectedOptionId 
                        ? 'border-gray-100 opacity-50' 
                        : 'border-gray-200 bg-white hover:border-gray-400 hover:shadow-md'
                    }`}
                    style={selectedOptionId === option.id ? { borderColor: currentTheme.primary } : {}}
                  >
                    <div className="font-bold text-gray-900 mb-1">{option.title}</div>
                    <div className="text-[10px] text-muted-foreground group-hover:text-gray-600">{option.subtext}</div>
                    {selectedOptionId === option.id && (
                      <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-4 right-4 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: currentTheme.primary }}
                      >
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </motion.div>
                    )}
                  </button>
                ))}
              </div>

              <AnimatePresence>
                {selectedOptionId && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`${currentTheme.chatStyle} p-6 shadow-sm mb-8`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: currentTheme.primary }}>
                            <currentTheme.icon size={16} />
                          </div>
                          <span className="font-bold text-sm uppercase tracking-wider" style={{ color: currentTheme.primary }}>{currentTheme.chatTone}</span>
                        </div>
                        <p className="text-gray-900 font-medium leading-relaxed mb-4">{selectedOption?.consequence}</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedOption?.deltas.map((d, i) => (
                            <span key={i} className={`px-2 py-1 rounded-lg text-[10px] font-bold ${d.value > 0 ? 'bg-[#E1F5EE] text-[#0F6E56]' : 'bg-[#FCE8E8] text-[#A91D1D]'}`}>
                              {d.metric.replace(/([A-Z])/g, ' $1').toUpperCase()} {d.value > 0 ? '+' : ''}{d.value}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button 
                        onClick={handleNextStage}
                        className="px-6 py-3 text-white rounded-xl font-bold transition-colors flex items-center gap-2 self-end"
                        style={{ backgroundColor: currentTheme.primary }}
                      >
                        Next Decision <ChevronRight size={16} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
          </motion.div>
        </AnimatePresence>
      </main>


      {/* Modals */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="max-w-lg w-full bg-white rounded-[40px] p-12 text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#7F77DD] via-[#1D9E75] to-[#E24B4A]" />
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg"
                style={{ backgroundColor: `${currentTheme.primary}10`, color: currentTheme.primary }}
              >
                <Rocket size={40} />
              </motion.div>
              <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter">Welcome to the Entrepreneur Journey</h2>
              <p className="text-gray-500 text-lg font-medium leading-relaxed">
                You've taken the first step in {city}. The road ahead is challenging, but your {domain} vision has the power to change lives.
              </p>
              <div className="mt-8 flex justify-center gap-2">
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: THEMES[0].primary, animationDelay: '0s' }} />
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: THEMES[1].primary, animationDelay: '0.2s' }} />
                <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: THEMES[2].primary, animationDelay: '0.4s' }} />
              </div>
            </motion.div>
          </motion.div>
        )}

        {showPhaseTransition && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] flex items-center justify-center pointer-events-none"
          >
            <motion.div 
              initial={{ scale: 0.5, rotate: -10 }}
              animate={{ scale: [0.5, 1.2, 1], rotate: 0 }}
              className="bg-white p-12 rounded-[50px] shadow-2xl text-center border-4"
              style={{ borderColor: currentTheme.primary }}
            >
              <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 1, repeat: 3 }}
                className="text-6xl mb-4"
              >
                🎉
              </motion.div>
              <h2 className="text-5xl font-black mb-2 tracking-tighter" style={{ color: currentTheme.primary }}>Phase Mastered!</h2>
              <p className="text-xl font-bold text-gray-500">Entering {THEMES[currentPhaseIndex].name}</p>
            </motion.div>
          </motion.div>
        )}

        {phaseCompleteCelebration && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          >
            <div className="bg-white/90 backdrop-blur-xl border-4 p-12 rounded-[40px] shadow-2xl text-center" style={{ borderColor: currentTheme.primary }}>
              <motion.div 
                animate={{ rotate: [0, 10, -10, 10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: 3 }}
                className="text-6xl mb-4"
              >
                🏆
              </motion.div>
              <h2 className="text-4xl font-black text-gray-900 mb-2">PHASE COMPLETE!</h2>
              <p className="text-xl font-bold uppercase tracking-widest" style={{ color: currentTheme.primary }}>{phaseCompleteCelebration}</p>
              <p className="text-gray-500 mt-4 font-medium">You've mastered the fundamentals of this stage.</p>
            </div>
          </motion.div>
        )}

        {showRoadmap && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-end z-50">
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white w-full max-w-2xl h-screen shadow-2xl flex flex-col"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white/50 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: currentTheme.primary }}>
                    <currentTheme.icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight">{currentTheme.name}</h3>
                    <p className="text-[10px] uppercase font-bold tracking-widest" style={{ color: currentTheme.primary }}>{currentTheme.chatTone}</p>
                  </div>
                </div>
                <button onClick={() => setShowRoadmap(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={24} className="text-gray-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-12">
                {STARTUP_ROADMAP.map((phase, phaseIdx) => {
                  const phaseTheme = THEMES[phaseIdx];
                  const phaseSteps = phase.steps.map(s => s.id);
                  const completedInPhase = phaseSteps.filter(id => completedSteps.includes(id)).length;
                  const isPhaseComplete = completedInPhase === phaseSteps.length;

                  return (
                    <div key={phase.id} className="relative">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h4 className="text-2xl font-black tracking-tight" style={{ color: isPhaseComplete ? phaseTheme.primary : '#111827' }}>
                            {phase.title}
                          </h4>
                          <p className="text-muted-foreground text-sm font-medium">{phase.description}</p>
                        </div>
                        <div 
                          className="px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest"
                          style={{ 
                            backgroundColor: isPhaseComplete ? `${phaseTheme.primary}20` : '#f3f4f6',
                            color: isPhaseComplete ? phaseTheme.primary : '#6b7280'
                          }}
                        >
                          {completedInPhase} / {phaseSteps.length} Steps
                        </div>
                      </div>

                      <div className="space-y-4">
                        {phase.steps.map((step) => {
                          const isCompleted = completedSteps.includes(step.id);
                          return (
                            <div 
                              key={step.id}
                              className="group relative p-6 rounded-3xl border-[0.5px] transition-all"
                              style={{
                                backgroundColor: isCompleted ? `${phaseTheme.primary}08` : 'white',
                                borderColor: isCompleted ? `${phaseTheme.primary}40` : '#e5e7eb'
                              }}
                            >
                              <div className="flex items-start gap-4">
                                <button 
                                  onClick={() => toggleStep(step.id)}
                                  className="mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all"
                                  style={{
                                    backgroundColor: isCompleted ? phaseTheme.primary : 'transparent',
                                    borderColor: isCompleted ? phaseTheme.primary : '#e5e7eb'
                                  }}
                                >
                                  {isCompleted && <CheckCircle2 size={14} className="text-white" />}
                                </button>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <h5 className="font-bold text-lg" style={{ color: isCompleted ? phaseTheme.primary : '#111827' }}>
                                      {step.title}
                                    </h5>
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Info size={16} className="text-gray-300" />
                                    </div>
                                  </div>
                                  <p className="text-muted-foreground text-xs font-medium mb-4">{step.brief}</p>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                    <div className="space-y-2">
                                      <div className="text-[9px] uppercase font-black text-gray-400 tracking-widest flex items-center gap-1">
                                        <Flag size={10} /> What to actually do
                                      </div>
                                      <ul className="space-y-1.5">
                                        {step.todo.map((item, idx) => (
                                          <li key={idx} className="text-[11px] text-gray-600 font-medium flex gap-2">
                                            <span style={{ color: phaseTheme.primary }}>•</span> {item}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                    <div className="space-y-4">
                                      <div className="p-3 bg-[#FCE8E8] rounded-xl border-[0.5px] border-[#E24B4A]/20">
                                        <div className="text-[9px] uppercase font-black text-[#A91D1D] tracking-widest flex items-center gap-1 mb-1">
                                          <AlertCircle size={10} /> Risk of skipping
                                        </div>
                                        <p className="text-[10px] text-[#A91D1D] font-medium leading-relaxed">{step.risk}</p>
                                      </div>
                                      <div className="p-3 bg-gray-50 rounded-xl border-[0.5px] border-gray-200">
                                        <div className="text-[9px] uppercase font-black text-gray-400 tracking-widest mb-1">Real Pattern</div>
                                        <p className="text-[10px] text-gray-500 italic font-medium leading-relaxed">{step.pattern}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}

        {showWhatIf && history.length > 0 && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-4xl max-h-[80vh] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-bold tracking-tight">What-If Time Machine</h3>
                <button onClick={() => setShowWhatIf(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto p-8">
                <div className="space-y-12">
                  {history.map((h, i) => {
                    const altOptions = h.allOptions.filter(o => o.id !== h.selectedOptionId);
                    return (
                      <div key={i} className="space-y-6 border-b border-gray-100 pb-12 last:border-0">
                        <div className="text-center mb-4">
                          <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">Decision {i + 1}: {h.scenarioTitle}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <div className="text-[10px] uppercase tracking-widest font-bold text-[#1D9E75] bg-[#E1F5EE] px-2 py-1 rounded inline-block">What happened</div>
                            <div className="p-4 border-[0.5px] border-gray-200 rounded-xl bg-gray-50">
                              <div className="font-bold mb-2">{h.selectedOptionTitle}</div>
                              <div className="text-xs text-muted-foreground mb-3 italic">"{h.consequence}"</div>
                              <div className="flex flex-wrap gap-2">
                                {h.deltas.map((d, di) => (
                                  <span key={di} className={`px-2 py-0.5 rounded text-[9px] font-bold ${d.value > 0 ? 'bg-[#E1F5EE] text-[#0F6E56]' : 'bg-[#FCE8E8] text-[#A91D1D]'}`}>
                                    {d.metric.replace(/([A-Z])/g, ' $1').toUpperCase()} {d.value > 0 ? '+' : ''}{d.value}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="text-[10px] uppercase tracking-widest font-bold text-[#BA7517] bg-[#FFF8E1] px-2 py-1 rounded inline-block">If you chose differently</div>
                            <div className="space-y-3">
                              {altOptions.map((alt, ai) => (
                                <div key={ai} className="p-4 border-[0.5px] border-dashed border-gray-200 rounded-xl hover:border-[#BA7517] transition-colors">
                                  <div className="font-bold mb-2">{alt.title}</div>
                                  <div className="flex flex-wrap gap-2">
                                    {alt.deltas.map((d, di) => (
                                      <span key={di} className={`px-2 py-0.5 rounded text-[9px] font-bold ${d.value > 0 ? 'bg-[#E1F5EE] text-[#0F6E56]' : 'bg-[#FCE8E8] text-[#A91D1D]'}`}>
                                        {d.metric.replace(/([A-Z])/g, ' $1').toUpperCase()} {d.value > 0 ? '+' : ''}{d.value}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {showSandbox && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-6">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[32px] w-full max-w-3xl h-[85vh] shadow-2xl overflow-hidden flex flex-col relative"
            >
              <AnimatePresence>
                {isTransitioning && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-[#7F77DD] z-[100] flex flex-col items-center justify-center text-white"
                  >
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="mb-6"
                    >
                      <FlaskConical size={64} />
                    </motion.div>
                    <h2 className="text-3xl font-black tracking-tighter">REFINING TRAJECTORY</h2>
                    <p className="text-[#EEEDFE] font-bold uppercase tracking-widest mt-2">Simulating Strategic Shift...</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#7F77DD] rounded-lg flex items-center justify-center text-white">
                    <FlaskConical size={18} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold tracking-tight">Strategy Sandbox</h3>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">AI-Powered Impact Prediction</p>
                  </div>
                </div>
                <button onClick={() => setShowSandbox(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
                {sandboxMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center px-12">
                    <div className="w-16 h-16 bg-white border border-gray-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                      <Target className="text-[#7F77DD]" size={32} />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">What if you changed your strategy?</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      Describe a change you're considering (e.g., "What if we focused on B2B sales?" or "What if we cut our marketing budget by half?"). 
                      Gemini will predict how it affects your core metrics compared to staying the course.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {sandboxMessages.map((msg, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        <div className={`max-w-[85%] p-4 rounded-2xl ${
                          msg.role === 'user' 
                            ? 'bg-[#7F77DD] text-white rounded-tr-none shadow-md' 
                            : 'bg-white border border-gray-200 text-gray-900 rounded-tl-none shadow-sm'
                        }`}>
                          <p className="leading-relaxed">{msg.content}</p>
                        </div>

                        {msg.paths && (
                          <div className="mt-6 w-full grid md:grid-cols-2 gap-4">
                            {[
                              { key: 'pathA', path: msg.paths.pathA, color: 'border-[#7F77DD]', bg: 'bg-[#EEEDFE]', text: 'text-[#3C3489]', icon: <FlaskConical size={14} /> },
                              { key: 'pathB', path: msg.paths.pathB, color: 'border-gray-200', bg: 'bg-white', text: 'text-gray-900', icon: <RotateCcw size={14} /> }
                            ].map((p) => {
                              const projectedMetrics = { ...metrics };
                              p.path.deltas.forEach(d => {
                                projectedMetrics[d.metric] = Math.max(0, Math.min(100, projectedMetrics[d.metric] + d.value));
                              });

                              return (
                                <div className={`p-5 rounded-2xl border-[0.5px] ${p.color} ${p.bg} shadow-sm flex flex-col`}>
                                  <div className={`flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest ${p.text} mb-3`}>
                                    {p.icon} {p.path.title}
                                  </div>
                                  <p className="text-xs font-bold leading-relaxed mb-4">{p.path.consequence}</p>
                                  
                                  {p.path.detailedAnalysis && (
                                    <div className="mb-6 p-4 rounded-xl bg-white/50 border border-white/50 text-[11px] leading-relaxed sandbox-timeline overflow-hidden">
                                      <ReactMarkdown>{p.path.detailedAnalysis}</ReactMarkdown>
                                    </div>
                                  )}

                                  <div className="space-y-3 mb-6">
                                    <h5 className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Projected Metric Shift</h5>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                      {[
                                        { label: 'User Adoption', key: 'userAdoption' },
                                        { label: 'Investor Conf.', key: 'investorConfidence' },
                                        { label: 'Cash Runway', key: 'cashRunway' },
                                        { label: 'PMFit', key: 'pmf' },
                                        { label: 'Founder Health', key: 'founderHealth' },
                                        { label: 'Social Impact', key: 'socialImpact' },
                                        { label: 'Revenue', key: 'revenueHealth' },
                                        { label: 'Morale', key: 'teamMorale' }
                                      ].map(m => {
                                        const delta = p.path.deltas.find(d => d.metric === m.key);
                                        const val = projectedMetrics[m.key as keyof Metrics];
                                        return (
                                          <div key={m.key} className="flex flex-col">
                                            <div className="flex justify-between items-center mb-0.5">
                                              <span className="text-[8px] text-gray-500 uppercase font-bold truncate max-w-[60px]">{m.label}</span>
                                              <div className="flex items-center gap-1">
                                                <span className="text-[8px] font-mono">{Math.round(val)}%</span>
                                                {delta && delta.value !== 0 && (
                                                  <span className={`text-[8px] font-bold ${delta.value > 0 ? 'text-[#1D9E75]' : 'text-[#E24B4A]'}`}>
                                                    {delta.value > 0 ? '↑' : '↓'}
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                                              <div className={`h-full ${delta && delta.value > 0 ? 'bg-[#1D9E75]' : delta && delta.value < 0 ? 'bg-[#E24B4A]' : 'bg-gray-400'}`} style={{ width: `${val}%` }} />
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  <button 
                                    onClick={() => applySandboxPath(p.path)}
                                    className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg ${
                                      p.key === 'pathA' 
                                        ? 'bg-[#7F77DD] text-white hover:bg-[#6B63C9] shadow-[#7F77DD]/30' 
                                        : 'bg-gray-900 text-white hover:bg-black shadow-black/30'
                                    } hover:scale-[1.02] active:scale-95`}
                                  >
                                    Select this path
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </motion.div>
                    ))}
                    {isSandboxLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-3">
                          <Loader2 size={16} className="animate-spin text-[#7F77DD]" />
                          <span className="text-xs font-medium text-gray-500">Analyzing futures...</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-6 bg-white border-t border-gray-100">
                <div className="flex gap-3">
                  <input 
                    type="text"
                    value={sandboxInput}
                    onChange={(e) => setSandboxInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSandboxChat()}
                    placeholder="Describe your strategic change..."
                    className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#7F77DD] focus:ring-1 focus:ring-[#7F77DD] outline-none transition-all"
                  />
                  <button 
                    onClick={handleSandboxChat}
                    disabled={!sandboxInput.trim() || isSandboxLoading}
                    className="px-6 bg-[#7F77DD] text-white rounded-xl font-bold hover:bg-[#6B63C9] transition-colors disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
