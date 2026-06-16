import type { APIRoute } from 'astro';
import { z } from 'astro/zod';

const PoseTipSchema = z.object({
  sceneType: z.string(),
  lighting: z.string(),
  poseName: z.string(),
  genderPreference: z.enum(['male', 'female', 'neutral']).optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const parsed = PoseTipSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: parsed.error.issues }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { sceneType, lighting, poseName } = parsed.data;

    // Locally generated pose tip (Free, no API required)
    const mockTip = {
      tip: `Relax your shoulders and lean slightly into the ${lighting.replace('_', ' ')} light.`,
      why_it_works: `This creates a natural, confident posture suitable for ${sceneType} environments.`
    };

    return new Response(
      JSON.stringify(mockTip),
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
