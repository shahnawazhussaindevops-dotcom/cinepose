import type { APIRoute } from 'astro';
import { z } from 'astro/zod';

const SceneAnalyzeSchema = z.object({
  sceneType: z.enum(['urban', 'nature', 'indoor', 'beach', 'mountain', 'street', 'architecture']),
  lighting: z.enum(['bright_daylight', 'golden_hour', 'blue_hour', 'overcast', 'indoor_low_light', 'harsh_midday', 'indoor_tungsten', 'indoor_fluorescent', 'backlit', 'side_lit', 'front_lit']),
  cameraAngle: z.enum(['eye_level', 'low_angle', 'high_angle', 'bird_eye', 'overhead']),
  genderPreference: z.enum(['male', 'female', 'neutral']),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const parsed = SceneAnalyzeSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: parsed.error.issues }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { sceneType, lighting, cameraAngle } = parsed.data;

    // Locally generated cinematic analysis (Free, no API required)
    const mockAnalysis = {
      scene_type: sceneType,
      lighting: lighting,
      mood: lighting === 'golden_hour' ? 'Warm, cinematic, nostalgic' : 'Dynamic, bold, structured',
      poses: [
        'Lean against a nearby surface, look off-camera',
        'Walk towards the camera with purpose',
        'Look over the shoulder, mysterious expression'
      ],
      composition_tip: `For a ${cameraAngle} shot, place the subject off-center using the rule of thirds.`
    };

    return new Response(
      JSON.stringify(mockAnalysis),
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
