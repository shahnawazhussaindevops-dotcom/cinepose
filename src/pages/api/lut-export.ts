import type { APIRoute } from 'astro';
import { z } from 'astro/zod';

const LUTExportSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().optional(),
  shadows: z.tuple([z.number(), z.number(), z.number()]),
  mids: z.tuple([z.number(), z.number(), z.number()]),
  highlights: z.tuple([z.number(), z.number(), z.number()]),
  saturation: z.number().min(0).max(3),
  contrast: z.number().min(0).max(3),
  temperature: z.number().min(2000).max(10000),
});

function generateCubeLUT(params: z.infer<typeof LUTExportSchema>): string {
  const { name, shadows, mids, highlights, saturation, contrast } = params;
  const size = 33;

  let cube = `TITLE "${name || 'CinePose LUT'}"\n`;
  cube += `LUT_3D_SIZE ${size}\n`;
  cube += `DOMAIN_MIN 0.0 0.0 0.0\n`;
  cube += `DOMAIN_MAX 1.0 1.0 1.0\n\n`;

  for (let b = 0; b < size; b++) {
    for (let g = 0; g < size; g++) {
      for (let r = 0; r < size; r++) {
        let ri = r / (size - 1);
        let gi = g / (size - 1);
        let bi = b / (size - 1);

        const gray = ri * 0.299 + gi * 0.587 + bi * 0.114;

        let shadowBlend = Math.max(1 - gray * 3, 0);
        let midBlend = 1 - Math.abs(gray - 0.5) * 2;
        let highlightBlend = Math.max((gray - 0.666) * 3, 0);

        ri += shadows[0] * shadowBlend + mids[0] * midBlend + highlights[0] * highlightBlend;
        gi += shadows[1] * shadowBlend + mids[1] * midBlend + highlights[1] * highlightBlend;
        bi += shadows[2] * shadowBlend + mids[2] * midBlend + highlights[2] * highlightBlend;

        const gs = ri * 0.299 + gi * 0.587 + bi * 0.114;
        ri = ri * saturation + gs * (1 - saturation);
        gi = gi * saturation + gs * (1 - saturation);
        bi = bi * saturation + gs * (1 - saturation);

        ri = (ri - 0.5) * contrast + 0.5;
        gi = (gi - 0.5) * contrast + 0.5;
        bi = (bi - 0.5) * contrast + 0.5;

        ri = Math.max(0, Math.min(1, ri));
        gi = Math.max(0, Math.min(1, gi));
        bi = Math.max(0, Math.min(1, bi));

        cube += `${ri.toFixed(6)} ${gi.toFixed(6)} ${bi.toFixed(6)}\n`;
      }
    }
  }

  return cube;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const parsed = LUTExportSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid LUT parameters', details: parsed.error.issues }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const cubeContent = generateCubeLUT(parsed.data);
    const sanitizedName = parsed.data.name.replace(/[^a-zA-Z0-9_-]/g, '_');

    return new Response(cubeContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${sanitizedName}.cube"`,
        'Content-Length': cubeContent.length.toString(),
      },
    });
  } catch (err) {
    console.error('LUT export error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
