import type { APIRoute } from 'astro';
import { z } from 'astro/zod';

const SceneAnalyzeSchema = z.object({
  sceneType: z.enum(['urban', 'nature', 'indoor', 'beach', 'mountain', 'street', 'architecture']),
  lighting: z.enum(['bright_daylight', 'golden_hour', 'blue_hour', 'overcast', 'indoor_low_light', 'harsh_midday', 'indoor_tungsten', 'indoor_fluorescent', 'backlit', 'side_lit', 'front_lit']),
  cameraAngle: z.enum(['eye_level', 'low_angle', 'high_angle', 'bird_eye', 'overhead']),
  genderPreference: z.enum(['male', 'female', 'neutral']),
});

export const POST: APIRoute = async ({ request, locals }) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'AI service not configured' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await request.json();
    const parsed = SceneAnalyzeSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: parsed.error.issues }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { sceneType, lighting, cameraAngle, genderPreference } = parsed.data;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        system: `You are CinePose, a professional photography coach.
Analyze scene descriptions and return JSON only.
Response format: { "scene_type": string, "lighting": string,
"mood": string, "poses": string[], "composition_tip": string }
Keep each pose suggestion under 10 words. Be specific and cinematic.`,
        messages: [{
          role: 'user',
          content: `Scene detected: ${sceneType}. Lighting: ${lighting}.
Camera angle: ${cameraAngle}. Gender preference: ${genderPreference}.
Suggest 3 poses and 1 composition tip.`,
        }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'AI service error' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'Empty response from AI' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let parsedContent;
    try {
      parsedContent = JSON.parse(content);
    } catch {
      return new Response(
        JSON.stringify({ result: content }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(parsedContent),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Scene analyze error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
