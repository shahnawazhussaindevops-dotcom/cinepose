import type { APIRoute } from 'astro';
import { z } from 'astro/zod';

const PoseTipSchema = z.object({
  sceneType: z.string(),
  lighting: z.string(),
  poseName: z.string(),
  genderPreference: z.enum(['male', 'female', 'neutral']).optional(),
});

export const POST: APIRoute = async ({ request }) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'AI service not configured' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await request.json();
    const parsed = PoseTipSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: parsed.error.issues }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { sceneType, lighting, poseName, genderPreference } = parsed.data;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 150,
        system: `You are CinePose, a professional fashion photographer.
Give one natural-language coaching tip for the given pose, scene, and lighting.
Keep it under 15 words, specific, and actionable. Return JSON format:
{ "tip": string, "why_it_works": string }`,
        messages: [{
          role: 'user',
          content: `Pose: ${poseName}. Scene: ${sceneType}. Lighting: ${lighting}.${genderPreference ? ` Gender: ${genderPreference}.` : ''}
Give me one coaching tip for this pose.`,
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
      parsedContent = { tip: content, why_it_works: '' };
    }

    return new Response(
      JSON.stringify(parsedContent),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Pose tips error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
