import type { APIRoute } from 'astro';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_MODEL = 'gemini-2.0-flash';

const SYSTEM_PROMPT = `You are the PUNK AI Director — the central orchestrator of a 12-agent cinematic AI system. Your role is to analyze the current scene and user context, then generate instructions for the relevant agents.

For each active agent, you MUST provide:
- work: what the agent should do now in this specific scene context
- learn: how this interaction updates the agent's knowledge
- perform: how the agent's success is evaluated in this context

The 12 agents are:
- photographer: Composition, framing, lens/aperture suggestions
- cinematographer: Camera movement, shot planning, subject blocking
- outfit_analyst: Color matching, outfit recommendations, style detection
- location_intel: Scene classification, cinematic scoring, location tips
- director_vision: Storytelling themes, visual direction, color palettes
- hollywood_director: Step-by-step scene blocking, camera positions, expression guidance
- cinegpt: Conversational Q&A, creative prompts, technical explanations
- reel_generator: Shot sequences, music, transitions, platform-optimized reel plans
- mood_detector: Facial expression, body language, mood classification
- pose_projector: 3D skeleton overlay, real-time pose correction
- human_clone: 3D avatar preview, virtual try-on
- scene_analyzer: Multi-agent fusion, holistic recommendations

Output ONLY valid JSON with this structure:
{
  "sceneSummary": "brief scene description",
  "mood": "detected mood",
  "agents": [
    {
      "agentId": "agent_id",
      "work": "what to do now",
      "learn": "what to learn from this",
      "perform": "how to evaluate success",
      "action": "specific action to take",
      "output": { "key": "value" },
      "confidence": 0.95
    }
  ],
  "styleSuggestion": "best style for this scene",
  "directorSteps": [{ "step": 1, "instruction": "do this", "target": "subject" }],
  "overallAdvice": "brief overall recommendation"
}`;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { scene, user, activeAgents } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Gemini API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const userPrompt = `Analyze this scene for cinematic photography/videography and generate agent instructions:

Scene:
- Luminance: ${scene?.luminance ?? 'unknown'}
- Color Temperature: ${scene?.temperature ?? 'unknown'}K
- Golden Hour: ${scene?.isGoldenHour ?? false}
- Backlit: ${scene?.isBacklit ?? false}
- Tilt Angle: ${scene?.tiltAngle ?? 0}°
- Camera Angle: ${scene?.cameraAngle ?? 'unknown'}
- Location: ${scene?.locationType ?? 'unknown'}
- Weather: ${scene?.weather ?? 'unknown'}
- Time: ${scene?.timeOfDay ?? 'unknown'}

User:
- Gender: ${user?.selectedGender ?? 'not set'}
- Style: ${user?.selectedStyle ?? 'Cinematic'}
- Recent Feedback: ${(user?.recentFeedback ?? []).join(', ') || 'none'}
- Session History: ${(user?.sessionHistory ?? []).length} interactions

Active Agents: ${(activeAgents ?? ['scene_analyzer']).join(', ')}

Provide detailed agent instructions for this specific scene context.`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: SYSTEM_PROMPT + '\n\n' + userPrompt }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096,
      },
    });

    const response = result.response;
    let text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return new Response(
        JSON.stringify({ error: 'Failed to parse structured response from Gemini' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify(parsed),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (err) {
    console.error('Gemini API error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
