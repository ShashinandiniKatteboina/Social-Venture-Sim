const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');
require('dotenv').config();

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, doc, updateDoc, arrayUnion } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const app = express();

// Whitelist the frontend on port 3000
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const INITIAL_METRICS = {
  userAdoption: 40,
  investorConfidence: 30,
  cashRunway: 80,
  teamMorale: 70,
  founderHealth: 90,
  socialImpact: 20,
  revenueHealth: 10,
  pmf: 15,
};

function constructDummySummary(domain, city, idea) {
  return {
    overview: `**HostMate** is a streamlined property management companion specifically designed for rural and first-time homestay hosts who find professional tools too complex. It bridges the gap between manual management and high-end enterprise software.`,
    strengths: [
      "Solves a real pain point for non-professional hosts in ${city}",
      "Highly accessible concept with low barrier to entry",
      "Sustainable revenue model via recurring subscriptions",
      "Perfect scope for an MVP with clear expansion potential"
    ],
    weaknesses: [
      "Significant competition from established property management software",
      "Low tech adoption rates among older hosts in rural areas",
      "Dependency on high-quality localized pricing data",
      "Requires high trust and consistent user engagement"
    ],
    suggestions: [
      "Prioritize WhatsApp integration for easier guest communication",
      "Narrow your initial launch to a specific tourist hub in ${city}",
      "Implement a free basic tier to accelerate user acquisition",
      "Develop offline-first features for areas with spotty connectivity"
    ]
  };
}

function constructDummySandboxAnalysis(pathTitle) {
  return `### Strategic Deep Analysis: ${pathTitle}
  
By choosing to **${pathTitle}**, you have fundamentally shifted the startup's trajectory. This decision highlights a "Growth First" mentality while attempting to balance the long-term sustainability of the mission.

**Strategic Trade-offs:**
*   **Immediate Gain**: You will likely see a boost in user adoption or investor interest in the short term as this path addresses immediate market needs.
*   **Long-term Risk**: The primary trade-off involves a potential dip in either team morale or cash runway, as resources are re-allocated to support this shift.
*   **Product-Market Fit (PMF)**: This move signals a pivot or refinement that could either solidify your position in ${city} or require a more substantial re-tooling later.

Overall, this path is considered a high-leverage move that requires careful monitoring of your core health metrics in the coming months.`;
}

async function generateWithFallback(parts, generationConfig) {
  const models = ["gemini-flash-latest", "gemini-2.0-flash-lite", "gemini-pro-latest", "gemini-2.0-flash"];
  let lastError = null;

  for (const modelName of models) {
    try {
      console.log(`Trying model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: generationConfig 
      });
      
      const result = await model.generateContent({ contents: [{ role: "user", parts }] });
      let text = result.response.text();
      
      if (text) {
        // Clean markdown JSON blocks if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return text;
      }
    } catch (err) {
      console.error(`Model ${modelName} failed:`, err.message);
      lastError = err;
      // If 429, wait a bit
      if (err.status === 429) {
        console.log("Rate limited. Waiting 1s before fallback...");
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      continue;
    }
  }
  throw lastError || new Error("All models failed");
}

app.post('/api/evaluate', async (req, res) => {
  try {
    const { domain, city, idea } = req.body;
    
    if (!domain || !city || !idea) {
      return res.status(400).json({ error: 'Domain, city, and idea are required.' });
    }

    console.log("Processing STATIC evaluation (AI bypassed as requested)...");
    
    // Simulate a brief analysis delay for UI feel
    await new Promise(resolve => setTimeout(resolve, 1500));

    // CONSTANT STATIC EVALUATION 
    const evaluation = {
      metrics: {
        userAdoption: 45,
        investorConfidence: 50,
        cashRunway: 60,
        teamMorale: 70,
        founderHealth: 65,
        socialImpact: 55,
        revenueHealth: 40,
        pmf: 30
      },
      summary: constructDummySummary(domain, city, idea)
    };

    let docId = "static_" + Date.now();
    try {
      // Still log to Firebase as a background task if API is available
      addDoc(collection(db, "startups"), {
        domain, city, idea,
        initialMetrics: evaluation.metrics,
        currentMetrics: evaluation.metrics,
        summary: evaluation.summary,
        evaluation,
        createdAt: new Date().toISOString()
      }).then(docRef => {
         console.log(`Saved successfully with docId: ${docRef.id}`);
      }).catch(err => {
         console.error("Firebase background save failed (ignored):", err.message);
      });
    } catch (e) {}

    res.json({ ...evaluation, docId });
  } catch (error) {
    console.error('Fatal evaluation error:', error);
    res.status(500).json({ error: 'Evaluation failed' });
  }
});

app.post('/api/scenario', async (req, res) => {
  try {
    const { domain, city, idea, files, metrics, history } = req.body;

    const prompt = `You are the AI engine for "FounderSim", a startup simulation game.
Current Context:
Domain: ${domain}
City: ${city}
Startup Idea: ${idea}
Current Metrics: ${JSON.stringify(metrics)}
Past Decisions: ${history ? history.map(h => h.selectedOptionTitle).join(", ") : ''}

Generate a new strategic scenario for the founder based purely on the domain, city, idea, and their past decisions. 
Make sure this scenario feels highly tailored to the specific user input idea.
The scenario should be a direct consequence of the current state, the startup idea, or a new market event.
Provide 3 distinct options with specific metric deltas.

Rules:
1. One option should be a "safe" bet (small changes).
2. One option should be a "bold" bet (high risk/high reward).
3. One option should be a "trade-off" (sacrificing one metric for another).
4. Metrics are 0-100. Deltas should be between -30 and +30.

Return the response in JSON format.`;

    const parts = [{ text: prompt }];
    
    if (files && files.length > 0) {
      files.forEach(file => {
        parts.push({
          inlineData: {
            data: file.data,
            mimeType: file.mimeType
          }
        });
      });
    }

    const text = await generateWithFallback(parts, {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
          question: { type: SchemaType.STRING },
          options: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                id: { type: SchemaType.STRING },
                title: { type: SchemaType.STRING },
                subtext: { type: SchemaType.STRING },
                consequence: { type: SchemaType.STRING },
                deltas: {
                  type: SchemaType.ARRAY,
                  items: {
                    type: SchemaType.OBJECT,
                    properties: {
                      metric: { type: SchemaType.STRING, enum: Object.keys(INITIAL_METRICS) },
                      value: { type: SchemaType.NUMBER }
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
    });

    res.json(JSON.parse(text));

  } catch (error) {
    console.error("Scenario Error:", error);
    res.status(500).json({ error: 'Failed to generate scenario' });
  }
});

app.post('/api/history', async (req, res) => {
  try {
    const { startupDocId, decision, newMetrics } = req.body;
    if (startupDocId) {
      console.log(`Updating history for doc: ${startupDocId}`);
      await updateDoc(doc(db, "startups", startupDocId), {
        history: arrayUnion(decision),
        currentMetrics: newMetrics
      });
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Firebase error logging history:", error);
    res.status(500).json({ error: 'Failed to update history' });
  }
});

app.post('/api/sandbox', async (req, res) => {
  try {
    const { domain, city, idea, metrics, userMsg } = req.body;

    const prompt = `You are the "FounderSim" Sandbox AI. 
The user wants to test a strategic change to their startup.
Make sure the consequence explicitly references the specific input they just gave: "${userMsg}".
Context:
Domain: ${domain}
City: ${city}
Idea: ${idea}
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

    let data;
    try {
      const text = await generateWithFallback([{ text: prompt }], {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            overallSummary: { type: SchemaType.STRING },
            pathA: {
              type: SchemaType.OBJECT,
              properties: {
                id: { type: SchemaType.STRING },
                title: { type: SchemaType.STRING },
                subtext: { type: SchemaType.STRING },
                consequence: { type: SchemaType.STRING },
                detailedAnalysis: { type: SchemaType.STRING },
                deltas: {
                  type: SchemaType.ARRAY,
                  items: {
                    type: SchemaType.OBJECT,
                    properties: {
                       metric: { type: SchemaType.STRING, enum: Object.keys(INITIAL_METRICS) },
                       value: { type: SchemaType.NUMBER }
                    },
                    required: ["metric", "value"]
                  }
                }
              },
              required: ["id", "title", "subtext", "consequence", "detailedAnalysis", "deltas"]
            },
            pathB: {
              type: SchemaType.OBJECT,
              properties: {
                id: { type: SchemaType.STRING },
                title: { type: SchemaType.STRING },
                subtext: { type: SchemaType.STRING },
                consequence: { type: SchemaType.STRING },
                detailedAnalysis: { type: SchemaType.STRING },
                deltas: {
                  type: SchemaType.ARRAY,
                  items: {
                    type: SchemaType.OBJECT,
                    properties: {
                       metric: { type: SchemaType.STRING, enum: Object.keys(INITIAL_METRICS) },
                       value: { type: SchemaType.NUMBER }
                    },
                    required: ["metric", "value"]
                  }
                }
              },
              required: ["id", "title", "subtext", "consequence", "detailedAnalysis", "deltas"]
            }
          },
          required: ["overallSummary", "pathA", "pathB"]
        }
      });
      data = JSON.parse(text);
    } catch (aiError) {
      console.error("Sandbox AI FAILED (Fallback to static paths):", aiError.message);
    }

    // B2B vs B2C STATIC SCENARIO - OVERRIDE EVERYTHING FOR DEMO RELIABILITY
    data = {
      overallSummary: "Strategic pivot analysis: Comparing high-value B2B contracts against scalable B2C growth.",
      pathA: {
        id: "path_b2b",
        title: "Switch to B2B",
        subtext: "Prioritize high-value corporate contracts.",
        consequence: "High revenue per client, slower but stable growth.",
        detailedAnalysis: `### PATH A — Switch to B2B (6–8 Weeks)

**Phase 1 — Validate Demand (Week 1–2)**
*   10+ qualified business leads → **Strong demand**
*   30%+ demo conversion → **Good fit**
*   ₹10K+ expected contract value → **Viable pricing**

**Phase 2 — Adapt Product (Week 3–5)**
*   80%+ required features completed → **Ready for clients**
*   <2 critical bugs → **Stable product**
*   Positive feedback from 3+ businesses → **Validated solution**

**Phase 3 — Acquire Clients (Week 6–8)**
*   3–5 paying clients → **Strong early traction**
*   MRR ≥ ₹30K → **Sustainable start**
*   Sales cycle ≤ 2 weeks → **Efficient process**`,
        deltas: [
          { metric: "revenueHealth", value: 25 },
          { metric: "investorConfidence", value: 15 },
          { metric: "userAdoption", value: -15 },
          { metric: "cashRunway", value: 10 }
        ]
      },
      pathB: {
        id: "path_b2c",
        title: "Stay with B2C",
        subtext: "Focus on mass-market user growth.",
        consequence: "Fast growth, lower revenue per user, requires strong marketing.",
        detailedAnalysis: `### PATH B — Stay with B2C (6–8 Weeks)

**Phase 1 — Grow Users (Week 1–2)**
*   500+ new users → **Good traction**
*   40%+ activation rate → **Strong onboarding**
*   Low acquisition cost → **Scalable growth**

**Phase 2 — Improve Features (Week 3–5)**
*   30%+ weekly retention → **Healthy engagement**
*   Increased session time → **Product value**
*   Positive user feedback → **Usability validated**

**Phase 3 — Monetize (Week 6–8)**
*   5–10% conversion to paid → **Viable monetization**
*   ARPU increasing → **Revenue growth**
*   Churn <5% → **User satisfaction**`,
        deltas: [
          { metric: "userAdoption", value: 30 },
          { metric: "revenueHealth", value: -10 },
          { metric: "cashRunway", value: -20 },
          { metric: "pmf", value: 10 }
        ]
      }
    };

    if (req.body.startupDocId) {
      try {
        console.log(`Logging sandbox test for doc: ${req.body.startupDocId}`);
        await updateDoc(doc(db, "startups", req.body.startupDocId), {
          sandboxTests: arrayUnion({
            timestamp: new Date().toISOString(),
            testedChange: req.body.userMsg,
            pathA: data.pathA,
            pathB: data.pathB
          })
        });
        console.log("Sandbox test logged successfully.");
      } catch (dbError) {
        console.error("Firebase error logging sandbox test:", dbError);
      }
    }

    res.json(data);
  } catch (error) {
    console.error('Fatal sandbox error:', error);
    res.status(500).json({ error: 'Sandbox analysis failed' });
  }
});

const PORT = 5001;
const server = app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Keep the process alive
setInterval(() => {
  // Just keeping the event loop busy
}, 1000 * 60 * 60);
