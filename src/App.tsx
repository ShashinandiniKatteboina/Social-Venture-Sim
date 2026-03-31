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
import { GoogleGenAI, Type } from "@google/genai";
import ReactMarkdown from 'react-markdown';

import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
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
  summary: string;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

interface SandboxPath {
  id: string;
  title: string;
  subtext: string;
  consequence: string;
  deltas: Delta[];
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

// --- AI Service ---

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface StartupFile {
  name: string;
  mimeType: string;
  data: string; // base64
}

const generateScenario = async (domain: string, city: string, idea: string, files: StartupFile[], metrics: Metrics, history: DecisionHistory[]): Promise<Scenario> => {
  const prompt = `You are the AI engine for "FounderSim", a startup simulation game.
Current Context:
Domain: ${domain}
City: ${city}
Startup Idea: ${idea}
Current Metrics: ${JSON.stringify(metrics)}
Past Decisions: ${history.map(h => h.selectedOptionTitle).join(", ")}

Generate a new strategic scenario for the founder. 
The scenario should be a direct consequence of the current state, the startup idea, or a new market event.
Provide 3 distinct options with specific metric deltas.

Rules:
1. One option should be a "safe" bet (small changes).
2. One option should be a "bold" bet (high risk/high reward).
3. One option should be a "trade-off" (sacrificing one metric for another).
4. Metrics are 0-100. Deltas should be between -30 and +30.

Return the response in JSON format.`;

  const parts: any[] = [{ text: prompt }];
  
  // Add files to the prompt if they exist
  files.forEach(file => {
    parts.push({
      inlineData: {
        data: file.data,
        mimeType: file.mimeType
      }
    });
  });

  const result = await genAI.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: "user", parts }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          question: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                subtext: { type: Type.STRING },
                consequence: { type: Type.STRING },
                deltas: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      metric: { type: Type.STRING, enum: Object.keys(INITIAL_METRICS) },
                      value: { type: Type.NUMBER }
                    },
                    required: ["metric", "value"]
                  }
                }
              },
              required: ["id", "title", "subtext", "consequence", "deltas"]
            }
          }
        },
        required: ["title", "description", "question", "options"]
      }
    }
  });

  if (!result.text) throw new Error("No response from Gemini");
  return JSON.parse(result.text);
};

const evaluateIdea = async (domain: string, city: string, idea: string, files: StartupFile[]): Promise<IdeaEvaluation> => {
  const prompt = `You are a startup analyst for social impact ventures in India.
Analyze the following startup idea:
Domain: ${domain}
City: ${city}
Idea: ${idea}

Provide an evaluation across 8 metrics (0-100):
1. User Adoption
2. Investor Confidence
3. Cash Runway
4. Team Morale
5. Founder Health
6. Social Impact
7. Revenue Health
8. Product-Market Fit

Also provide:
- A brief summary of the idea.
- 3 key strengths.
- 3 key weaknesses.
- 3 suggestions for improvement.

Return the response in JSON format.`;

  const parts: any[] = [{ text: prompt }];
  files.forEach(file => {
    parts.push({
      inlineData: {
        data: file.data,
        mimeType: file.mimeType
      }
    });
  });

  const result = await genAI.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: "user", parts }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          metrics: {
            type: Type.OBJECT,
            properties: {
              userAdoption: { type: Type.NUMBER },
              investorConfidence: { type: Type.NUMBER },
              cashRunway: { type: Type.NUMBER },
              teamMorale: { type: Type.NUMBER },
              founderHealth: { type: Type.NUMBER },
              socialImpact: { type: Type.NUMBER },
              revenueHealth: { type: Type.NUMBER },
              pmf: { type: Type.NUMBER }
            },
            required: ["userAdoption", "investorConfidence", "cashRunway", "teamMorale", "founderHealth", "socialImpact", "revenueHealth", "pmf"]
          },
          summary: { type: Type.STRING },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["metrics", "summary", "strengths", "weaknesses", "suggestions"]
      }
    }
  });

  if (!result.text) throw new Error("No response from Gemini");
  return JSON.parse(result.text);
};

// --- Components ---

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
        transition={{ duration: 0.8, ease: "easeOut" }}
      />
    </div>
  </div>
);


export default function App() {
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
  const [showSandboxSummary, setShowSandboxSummary] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>(() => {
    const saved = localStorage.getItem('startup_completed_steps');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('startup_phase', currentPhaseIndex.toString());
  }, [currentPhaseIndex]);

  useEffect(() => {
    localStorage.setItem('startup_completed_steps', JSON.stringify(completedSteps));
  }, [completedSteps]);
  const [phaseCompleteCelebration, setPhaseCompleteCelebration] = useState<string | null>(null);
  const [lastAppliedSandboxPath, setLastAppliedSandboxPath] = useState<SandboxPath | null>(null);
  const [beforeSandboxMetrics, setBeforeSandboxMetrics] = useState<Metrics | null>(null);

  // Sandbox chat state
  const [sandboxMessages, setSandboxMessages] = useState<{ role: 'user' | 'ai', content: string, paths?: { pathA: SandboxPath, pathB: SandboxPath } }[]>([]);
  const [sandboxInput, setSandboxInput] = useState('');
  const [isSandboxLoading, setIsSandboxLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pendingSandboxPaths, setPendingSandboxPaths] = useState<{ pathA: SandboxPath, pathB: SandboxPath } | null>(null);

  const selectedOption = currentScenario?.options.find(o => o.id === selectedOptionId);

  const currentTheme = THEMES[currentPhaseIndex];

  // Handle phase advancement
  useEffect(() => {
    const phaseIndex = currentPhaseIndex;
    if (phaseIndex >= STARTUP_ROADMAP.length) return;

    const currentPhase = STARTUP_ROADMAP[phaseIndex];
    const phaseStepIds = currentPhase.steps.map(s => s.id);
    const isComplete = phaseStepIds.every(id => completedSteps.includes(id));

    if (isComplete && phaseIndex < THEMES.length - 1) {
      // Small delay to let the user see the last checkmark
      setTimeout(() => {
        setCurrentPhaseIndex(prev => prev + 1);
        setShowPhaseTransition(true);
        setPhaseCompleteCelebration(currentPhase.title);
        setTimeout(() => {
          setShowPhaseTransition(false);
          setPhaseCompleteCelebration(null);
        }, 4000);
      }, 500);
    }
  }, [completedSteps, currentPhaseIndex]);

  const handleStart = async () => {
    if (domain && city && startupIdea.trim()) {
      setIsEvaluating(true);
      setGameState('evaluating');
      
      if (isNewUser) {
        setShowWelcome(true);
        setTimeout(() => setShowWelcome(false), 3500);
        setIsNewUser(false);
      }

      try {
        const evalResult = await evaluateIdea(domain, city, startupIdea, startupFiles);
        setEvaluation(evalResult);
        setMetrics(evalResult.metrics);
      } catch (error) {
        console.error("Failed to evaluate idea:", error);
      } finally {
        setIsEvaluating(false);
      }
    }
  };

  const handleProceedToSimulation = async () => {
    if (domain && city && startupIdea.trim()) {
      setGameState('playing');
      await fetchNextScenario(domain, city, startupIdea, startupFiles, metrics, []);
    }
  };

  const fetchNextScenario = async (d: string, c: string, idea: string, files: StartupFile[], m: Metrics, h: DecisionHistory[]) => {
    setIsLoadingScenario(true);
    try {
      const scenario = await generateScenario(d, c, idea, files, m, h);
      setCurrentScenario(scenario);
    } catch (error) {
      console.error("Failed to generate scenario:", error);
    } finally {
      setIsLoadingScenario(false);
    }
  };

  const handleOptionClick = (option: Option) => {
    if (selectedOptionId || isLoadingScenario) return;
    setSelectedOptionId(option.id);
  };

  const handleNextStage = async () => {
    if (!selectedOption || !currentScenario || !domain || !city) return;

    // Save to history
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

    // Update metrics
    const newMetrics = { ...metrics };
    selectedOption.deltas.forEach(d => {
      newMetrics[d.metric] = Math.max(0, Math.min(100, newMetrics[d.metric] + d.value));
    });
    setMetrics(newMetrics);

    // Reset selection and fetch next
    setSelectedOptionId(null);
    if (newHistory.length >= 10) {
      setGameState('debrief');
    } else {
      await fetchNextScenario(domain, city, startupIdea, startupFiles, newMetrics, newHistory);
    }
  };

  const handleSandboxChat = async () => {
    if (!sandboxInput.trim() || isSandboxLoading) return;

    const userMsg = sandboxInput;
    setSandboxInput('');
    setSandboxMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsSandboxLoading(true);

    try {
      const prompt = `You are the "FounderSim" Sandbox AI. 
      The user wants to test a strategic change to their startup.
      Context:
      Domain: ${domain}
      City: ${city}
      Idea: ${startupIdea}
      Current Metrics: ${JSON.stringify(metrics)}

      User's requested change: "${userMsg}"

      Evaluate two parallel timelines:
      Path A: The user implements the requested change.
      Path B: The user stays the course (Status Quo).

      For each path, provide:
      1. A descriptive title.
      2. A brief consequence explanation.
      3. Specific metric deltas (0-100 scale, deltas between -30 and +30).

      Return the response in JSON format with keys "pathA" and "pathB".`;

      const result = await genAI.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              pathA: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  subtext: { type: Type.STRING },
                  consequence: { type: Type.STRING },
                  deltas: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        metric: { type: Type.STRING, enum: Object.keys(INITIAL_METRICS) },
                        value: { type: Type.NUMBER }
                      },
                      required: ["metric", "value"]
                    }
                  }
                },
                required: ["id", "title", "subtext", "consequence", "deltas"]
              },
              pathB: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  subtext: { type: Type.STRING },
                  consequence: { type: Type.STRING },
                  deltas: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        metric: { type: Type.STRING, enum: Object.keys(INITIAL_METRICS) },
                        value: { type: Type.NUMBER }
                      },
                      required: ["metric", "value"]
                    }
                  }
                },
                required: ["id", "title", "subtext", "consequence", "deltas"]
              }
            },
            required: ["pathA", "pathB"]
          }
        }
      });

      if (!result.text) throw new Error("No response from Gemini");
      const data = JSON.parse(result.text);
      
      setSandboxMessages(prev => [...prev, { 
        role: 'ai', 
        content: `I've analyzed two possible futures based on your request. Compare the paths below.`,
        paths: { pathA: data.pathA, pathB: data.pathB }
      }]);
      setPendingSandboxPaths({ pathA: data.pathA, pathB: data.pathB });
    } catch (error) {
      console.error("Sandbox evaluation failed:", error);
      setSandboxMessages(prev => [...prev, { role: 'ai', content: "I'm sorry, I couldn't evaluate that change. Please try again." }]);
    } finally {
      setIsSandboxLoading(false);
    }
  };

  const applySandboxPath = (path: SandboxPath) => {
    setIsTransitioning(true);
    
    setTimeout(() => {
      const newMetrics = { ...metrics };
      path.deltas.forEach(d => {
        newMetrics[d.metric] = Math.max(0, Math.min(100, newMetrics[d.metric] + d.value));
      });
      
      // Record sandbox decision in history
      const decision: DecisionHistory = {
        scenarioTitle: "Sandbox Intervention",
        selectedOptionId: "sandbox_" + Date.now(),
        selectedOptionTitle: path.title,
        consequence: path.consequence,
        deltas: path.deltas,
        allOptions: pendingSandboxPaths ? [pendingSandboxPaths.pathA, pendingSandboxPaths.pathB] : []
      };
      setHistory(prev => [...prev, decision]);
      
      setBeforeSandboxMetrics({ ...metrics });
      setLastAppliedSandboxPath(path);
      setMetrics(newMetrics);
      setShowSandbox(false);
      setShowSandboxSummary(true);
      setSandboxMessages([]);
      setPendingSandboxPaths(null);
      setIsTransitioning(false);
    }, 800);
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

  if (gameState === 'onboarding') {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-6 font-sans text-[13px]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white border-[0.5px] border-gray-200 rounded-2xl p-8 shadow-sm"
        >
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
          {history.length > 0 && (
            <button 
              onClick={() => setShowWhatIf(true)}
              className="w-full py-2 px-3 border-[0.5px] border-gray-200 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <History size={12} /> What if?
            </button>
          )}
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
            {gameState === 'evaluating' ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {isEvaluating ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Loader2 className="w-12 h-12 animate-spin mb-6" style={{ color: currentTheme.primary }} />
                  <h2 className="text-2xl font-bold text-gray-900">Analyzing your startup idea...</h2>
                  <p className="text-muted-foreground text-sm mt-2 max-w-xs mx-auto">Gemini is evaluating your concept against the local market in {city}.</p>
                </div>
              ) : evaluation && (
                <div className="space-y-8">
                  <header className="text-center mb-10">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Initial Evaluation</h1>
                    <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold">Projected Starting State</p>
                  </header>

                  <div className="bg-white border-[0.5px] border-gray-200 p-8 rounded-3xl shadow-sm">
                    <h3 className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-4">Idea Summary</h3>
                    <p className="text-gray-900 text-lg leading-relaxed font-medium">{evaluation.summary}</p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-[#E1F5EE] border-[0.5px] border-[#1D9E75] p-6 rounded-2xl">
                      <h3 className="text-[#0F6E56] font-bold text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
                        <CheckCircle2 size={14} /> Strengths
                      </h3>
                      <ul className="space-y-3">
                        {evaluation.strengths.map((s, i) => (
                          <li key={i} className="text-[#0F6E56] font-medium flex gap-2">
                            <span className="opacity-50">•</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-[#FCE8E8] border-[0.5px] border-[#E24B4A] p-6 rounded-2xl">
                      <h3 className="text-[#A91D1D] font-bold text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2">
                        <XCircle size={14} /> Weaknesses
                      </h3>
                      <ul className="space-y-3">
                        {evaluation.weaknesses.map((w, i) => (
                          <li key={i} className="text-[#A91D1D] font-medium flex gap-2">
                            <span className="opacity-50">•</span> {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-6 rounded-2xl border-[0.5px]" style={{ backgroundColor: `${currentTheme.primary}10`, borderColor: currentTheme.primary }}>
                      <h3 className="font-bold text-[10px] uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: currentTheme.primary }}>
                        <Target size={14} /> Suggestions
                      </h3>
                      <ul className="space-y-3">
                        {evaluation.suggestions.map((s, i) => (
                          <li key={i} className="font-medium flex gap-2" style={{ color: currentTheme.primary }}>
                            <span className="opacity-50">•</span> {s}
                          </li>
                        ))}
                      </ul>
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
          ) : showSandboxSummary && lastAppliedSandboxPath && beforeSandboxMetrics ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="space-y-8"
            >
              <header className="text-center mb-10">
                <motion.div 
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-[#7F77DD] to-[#3C3489] text-white text-[10px] font-bold rounded-full uppercase tracking-widest mb-4 shadow-lg shadow-[#7F77DD]/20"
                >
                  <FlaskConical size={12} /> Strategy Refined
                </motion.div>
                <h1 className="text-4xl font-black tracking-tight text-gray-900 mb-2">Refined Metrics Evaluation</h1>
                <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold">The {lastAppliedSandboxPath.title} Trajectory</p>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white border-[0.5px] border-gray-200 p-8 rounded-3xl shadow-xl flex flex-col relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-3xl" style={{ backgroundColor: `${currentTheme.primary}10` }} />
                  
                  <h3 className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-4">Strategic Outcome</h3>
                  <p className="text-gray-900 text-xl leading-relaxed font-bold mb-6">{lastAppliedSandboxPath.consequence}</p>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-4">Differentiated Impact</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { label: 'User Adoption', key: 'userAdoption' },
                          { label: 'Investor Conf.', key: 'investorConfidence' },
                          { label: 'Cash Runway', key: 'cashRunway' },
                          { label: 'Team Morale', key: 'teamMorale' },
                          { label: 'Founder Health', key: 'founderHealth' },
                          { label: 'Social Impact', key: 'socialImpact' },
                          { label: 'Revenue Health', key: 'revenueHealth' },
                          { label: 'Product-Market Fit', key: 'pmf' }
                        ].map(item => {
                          const val = metrics[item.key as keyof Metrics];
                          const delta = lastAppliedSandboxPath.deltas.find(d => d.metric === item.key);
                          const isPositive = delta && delta.value > 0;
                          const isNegative = delta && delta.value < 0;
                          
                          return (
                            <motion.div 
                              key={item.key} 
                              whileHover={{ scale: 1.02 }}
                              className={`p-4 rounded-2xl border-[0.5px] transition-all relative overflow-hidden ${
                                isPositive ? 'bg-[#E1F5EE] border-[#1D9E75]/30' : 
                                isNegative ? 'bg-[#FCE8E8] border-[#E24B4A]/30' : 
                                'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">{item.label}</div>
                                {delta && delta.value !== 0 && (
                                  <div className={`text-[10px] font-black ${delta.value > 0 ? 'text-[#1D9E75]' : 'text-[#E24B4A]'}`}>
                                    {delta.value > 0 ? '↑' : '↓'} {Math.abs(delta.value)}%
                                  </div>
                                )}
                              </div>
                              <div className={`text-2xl font-black ${val > 60 ? 'text-[#1D9E75]' : val < 30 ? 'text-[#E24B4A]' : 'text-gray-900'}`}>
                                {Math.round(val)}%
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white border-[0.5px] border-gray-200 p-8 rounded-3xl shadow-xl h-[450px] flex flex-col"
                >
                  <h3 className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-6">Shift Analysis</h3>
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[
                        { name: 'User', before: beforeSandboxMetrics.userAdoption, after: metrics.userAdoption },
                        { name: 'Investor', before: beforeSandboxMetrics.investorConfidence, after: metrics.investorConfidence },
                        { name: 'Cash', before: beforeSandboxMetrics.cashRunway, after: metrics.cashRunway },
                        { name: 'Team', before: beforeSandboxMetrics.teamMorale, after: metrics.teamMorale },
                        { name: 'Founder', before: beforeSandboxMetrics.founderHealth, after: metrics.founderHealth },
                        { name: 'Social', before: beforeSandboxMetrics.socialImpact, after: metrics.socialImpact },
                        { name: 'Revenue', before: beforeSandboxMetrics.revenueHealth, after: metrics.revenueHealth },
                        { name: 'PMF', before: beforeSandboxMetrics.pmf, after: metrics.pmf },
                      ]} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 600 }}
                          dy={10}
                        />
                        <YAxis 
                          domain={[0, 100]} 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#9CA3AF', fontSize: 10 }}
                          dx={-10}
                        />
                        <RechartsTooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '12px', padding: '12px' }}
                          cursor={{ stroke: '#E5E7EB', strokeWidth: 1 }}
                        />
                        <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '30px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                        <Line 
                          type="monotone" 
                          name="Previous" 
                          dataKey="before" 
                          stroke="#D1D5DB" 
                          strokeWidth={2} 
                          dot={{ r: 4, fill: '#D1D5DB', strokeWidth: 0 }} 
                          activeDot={{ r: 6 }}
                          strokeDasharray="5 5"
                        />
                        <Line 
                          type="monotone" 
                          name="Refined" 
                          dataKey="after" 
                          stroke={currentTheme.primary} 
                          strokeWidth={4} 
                          dot={{ r: 6, fill: currentTheme.primary, strokeWidth: 2, stroke: '#fff' }} 
                          activeDot={{ r: 8, strokeWidth: 0 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-6 p-4 rounded-2xl flex items-center gap-3" style={{ backgroundColor: `${currentTheme.primary}10` }}>
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm" style={{ color: currentTheme.primary }}>
                      <TrendingUp size={20} />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: currentTheme.primary }}>Overall Trend</div>
                      <div className="text-xs font-medium" style={{ color: `${currentTheme.primary}CC` }}>
                        {metrics.pmf > beforeSandboxMetrics.pmf ? "Your strategy has significantly improved Product-Market Fit." : "This path prioritizes immediate stability over long-term PMF."}
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
          ) : isLoadingScenario || !currentScenario ? (
            <div className="h-full flex flex-col items-center justify-center py-20 text-center">
              <Loader2 className="w-10 h-10 text-[#7F77DD] animate-spin mb-4" />
              <h3 className="text-lg font-bold text-gray-900">Generating next scenario...</h3>
              <p className="text-muted-foreground text-xs mt-1">Gemini is analyzing your startup's trajectory in {city}.</p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <div className="inline-block px-2 py-1 text-[10px] font-bold rounded uppercase tracking-widest mb-4" style={{ backgroundColor: `${currentTheme.primary}20`, color: currentTheme.primary }}>
                  Scenario {history.length + 1}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">{currentScenario.title}</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">{currentScenario.description}</p>
                <p className="text-gray-900 font-bold text-[14px]">{currentScenario.question}</p>
              </div>

              <div className="grid gap-4 mb-8">
                {currentScenario.options.map(option => (
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
                                <div key={p.key} className={`p-5 rounded-2xl border-[0.5px] ${p.color} ${p.bg} shadow-sm flex flex-col`}>
                                  <div className={`flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest ${p.text} mb-3`}>
                                    {p.icon} {p.path.title}
                                  </div>
                                  <p className="text-xs leading-relaxed mb-4 flex-1">{p.path.consequence}</p>
                                  
                                  <div className="space-y-3 mb-6">
                                    <h5 className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Projected Dashboard</h5>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                      {[
                                        { label: 'User Adoption', key: 'userAdoption' },
                                        { label: 'Investor Conf.', key: 'investorConfidence' },
                                        { label: 'Cash Runway', key: 'cashRunway' },
                                        { label: 'Team Morale', key: 'teamMorale' },
                                        { label: 'Founder Health', key: 'founderHealth' },
                                        { label: 'Social Impact', key: 'socialImpact' },
                                        { label: 'Revenue Health', key: 'revenueHealth' },
                                        { label: 'Product-Market Fit', key: 'pmf' }
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
                                                    ({delta.value > 0 ? '+' : ''}{delta.value})
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                            <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                                              <div className="h-full bg-gray-400" style={{ width: `${val}%` }} />
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
                                    Commit to this path
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
