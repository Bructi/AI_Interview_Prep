const { GoogleGenerativeAI } = require('@google/generative-ai');
const { aiCache } = require('../utils/cache');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Fast, stable models in order of priority
const CANDIDATE_MODELS = [
  'gemini-2.5-flash',
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite'
];

/**
 * Execute generation with cascading model fallback and optimized parameters
 */
const generateWithModelFallback = async (prompt, isJson = true) => {
  let lastError = null;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const config = {};
      if (isJson) {
        config.responseMimeType = 'application/json';
      }
      // Disable thinking budget on 2.5-flash to get sub-8-second responses
      if (modelName === 'gemini-2.5-flash') {
        config.thinkingConfig = { thinkingBudget: 0 };
      }

      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: config
      });

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (err) {
      console.warn(`Model ${modelName} failed, attempting next fallback:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error('All model endpoints unavailable');
};

const generateInterviewQuestions = async (req, res) => {
  try {
    const { role, experience, topicsToFocus, count = 5 } = req.body;
    if (!role || !experience) {
      return res.status(400).json({ success: false, message: 'Role and experience are required' });
    }

    const cacheKey = `questions_${role}_${experience}_${(topicsToFocus || []).sort().join('_')}_${count}`.toLowerCase();
    const cachedResult = aiCache.get(cacheKey);
    if (cachedResult) {
      return res.json({ success: true, questions: cachedResult, cached: true });
    }

    const competencies = topicsToFocus && topicsToFocus.length > 0
      ? topicsToFocus.join(', ')
      : 'Core system architecture, data structures, and production engineering';

    const prompt = `You are a Principal Software Architect and Senior Technical Interviewer.
Generate exactly ${count} focused, realistic technical interview questions for a ${role} with ${experience} seniority.
Focus competencies: ${competencies}.

CRITICAL QUESTION REQUIREMENTS:
- Keep the "question" strictly CONCISE, PUNCHY, and BITE-SIZED: 1 single crisp sentence (maximum 15 to 22 words).
- NEVER generate lengthy hypothetical scenario paragraphs, story setups, or bloated compound essays.
- Must be immediately scannable and easy to digest in 3 seconds.

CRITICAL ANSWER REQUIREMENTS:
- Keep every answer HIGHLY CONCISE, BITE-SIZED, and effortlessly readable in 15 seconds (60-90 words maximum).
- Structure each answer with clear markdown:
  * **Core Concept**: 1 crisp sentence (max 15 words) defining the primary mechanism.
  * **Key Mechanisms**: 2-3 concise bullet points with bold keywords.
  * **Trade-off / Production Rule**: 1 practical bullet point highlighting trade-offs or common pitfalls.
- Use inline backticks for code identifiers, APIs, and keys (e.g. \`key\`, \`useMemo\`, \`O(1)\`).
- Avoid verbose narrative essays. Keep it punchy, technical, and immediately actionable.

Return a valid JSON array of question objects with this schema:
[
  {
    "question": "Short, crisp single-sentence question (max 22 words)",
    "answer": "**Core Concept**: ...\\n\\n**Key Mechanisms**:\\n- **Term**: Definition\\n- **Term**: Definition\\n\\n**Trade-off / Production Rule**:\\n- Insight"
  }
]`;

    const responseText = await generateWithModelFallback(prompt, true);

    let questions = [];
    try {
      const cleaned = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      questions = JSON.parse(cleaned);
      aiCache.set(cacheKey, questions);
    } catch (parseErr) {
      console.error('JSON Parse Error in AI response:', parseErr);
      const match = responseText.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (match) {
        questions = JSON.parse(match[0]);
      } else {
        questions = [{
          question: `Explain core architectural patterns and scaling considerations for a ${role}.`,
          answer: '**Core Concept**: Designing resilient systems requires understanding trade-offs in consistency and availability.\\n\\n**Key Mechanisms**:\\n- **Partitioning**: Horizontal scaling strategies.\\n- **Replication**: Leaderless vs leader-follower.\\n\\n**Trade-off / Production Rule**:\\n- Prioritize idempotency in distributed writes.'
        }];
      }
    }

    res.json({ success: true, questions });
  } catch (error) {
    console.error('Interview Generation Error:', error.message || error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate technical evaluation questions'
    });
  }
};

const generateConceptExplanation = async (req, res) => {
  try {
    const { question, answer } = req.body;
    if (!question) {
      return res.status(400).json({ success: false, message: 'Question is required' });
    }

    const cacheKey = `concept_${question}`.substring(0, 150).toLowerCase();
    const cachedExplanation = aiCache.get(cacheKey);
    if (cachedExplanation) {
      return res.json({ success: true, explanation: cachedExplanation, cached: true });
    }

    const prompt = `You are a Principal Architect providing a concise, high-yield architectural breakdown.
Analyze the core technical concepts, mechanics, and failure modes for:

Question: ${question}
Context: ${answer || 'N/A'}

Format with clean, scannable markdown (total length: under 220 words):
### 1. Core Principle
1-2 punchy sentences defining the foundational pattern or invariant.

### 2. Under-the-Hood Mechanics
- **Mechanism 1**: Concise explanation with bold technical terms.
- **Mechanism 2**: Concise explanation with bold technical terms.
- **Mechanism 3**: State/memory or runtime impact.

### 3. Production Trade-offs & Failure Modes
- **Risk**: Concrete scenario where this degrades or breaks.
- **Mitigation**: Specific production-grade remedy.

### 4. Minimal Code Pattern
Provide a short, minimal snippet (5-8 lines max) illustrating the correct idiom if applicable.`;

    const explanation = await generateWithModelFallback(prompt, false);
    aiCache.set(cacheKey, explanation);

    res.json({ success: true, explanation });
  } catch (error) {
    console.error('Concept Explanation Error:', error.message || error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate architectural explanation'
    });
  }
};

const enhanceResume = async (req, res) => {
  try {
    const { action, text, context } = req.body;
    if (!action) {
      return res.status(400).json({ success: false, message: 'Action is required' });
    }

    let prompt = '';
    if (action === 'generate-summary') {
      prompt = `You are a Principal Engineering Recruiter and Career Coach at a top tech company.
Write a punchy, high-impact 3-4 sentence professional summary for a resume.
Target Role / Title: ${context?.title || 'Senior Software Engineer'}
Key Skills: ${context?.skills || 'Full-stack development, distributed systems, cloud architecture'}
Years of experience / background: ${context?.experience || '3+ years'}

Return ONLY the summary paragraph without preamble, quotes, or markdown headers. Make it metrics-driven, action-oriented, and modern.`;
    } else if (action === 'polish-bullet') {
      prompt = `You are an expert tech resume writer. Rewrite the following resume bullet point using the Google X-Y-Z formula ("Accomplished [X], as measured by [Y], by doing [Z]").
Start with a strong action verb, remove passive voice, include plausible metrics/percentages if appropriate, and keep it crisp under 28 words.

Original bullet: "${text}"

Return ONLY the improved bullet point as a single sentence without quotes or prefixes.`;
    } else if (action === 'generate-bullets') {
      prompt = `You are an expert resume writer. Generate 3 high-impact, STAR-method bullet points for this work experience:
Role: ${context?.role || 'Software Engineer'}
Company: ${context?.company || 'Tech Company'}
Key technologies / focus: ${text || 'Scalability, microservices, database optimization'}

Return ONLY a JSON array of strings: ["bullet 1", "bullet 2", "bullet 3"].`;
    } else {
      prompt = `Polish and improve the following resume text for senior engineering roles:
"${text}"
Return ONLY the polished text.`;
    }

    const isJson = action === 'generate-bullets';
    const resultText = await generateWithModelFallback(prompt, isJson);

    let output = resultText.trim();
    if (isJson) {
      try {
        const cleaned = output.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();
        output = JSON.parse(cleaned);
      } catch (e) {
        output = [resultText];
      }
    }

    res.json({ success: true, result: output });
  } catch (error) {
    console.error('Resume Enhancement Error:', error.message || error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to enhance resume content'
    });
  }
};

module.exports = {
  generateInterviewQuestions,
  generateConceptExplanation,
  enhanceResume,
  generateWithModelFallback
};
