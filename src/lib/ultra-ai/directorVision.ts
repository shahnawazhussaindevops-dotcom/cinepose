import type { DirectorVisionResult, HollywoodScene, SceneTypeAI, LocationType, MoodType } from './types';

const STORY_TYPES: Record<string, string[]> = {
  luxury: ['Luxury Lifestyle Story', 'High-End Editorial', 'Premium Brand Narrative'],
  adventure: ['Adventure Exploration', 'Discovery Journey', 'Wilderness Quest'],
  romantic: ['Romantic Escape', 'Love Story', 'Intimate Connection'],
  mysterious: ['Mystery / Noir Tale', 'Suspense Narrative', 'Shadow Story'],
  cinematic: ['Epic Visual Journey', 'Cinematic Portrait Series', 'Dramatic Sequence'],
  energetic: ['Urban Energy Story', 'Dynamic Life Narrative', 'Vibrant Journey'],
  calm: ['Peaceful Reflection', 'Serene Portrait', 'Meditative Visual'],
  dreamy: ['Dream Sequence', 'Ethereal Narrative', 'Surreal Visual Poem'],
  professional: ['Professional Story', 'Corporate Narrative', 'Brand Portrait'],
  default: ['Visual Journey', 'Environmental Portrait', 'Scene Narrative'],
};

const ATMOSPHERES: Record<string, string[]> = {
  golden_hour: [
    'Warm, golden glow with long dramatic shadows. The thick warm light creates an almost tangible atmosphere.',
    'The golden light wraps everything in warmth, creating a dreamy, romantic quality.',
    'Long shadows and warm hues create a nostalgic, cinematic atmosphere.',
  ],
  bright_day: [
    'Crisp, clear light with sharp shadows. Everything appears vibrant and alive.',
    'Bright, energetic atmosphere with high contrast and vivid colors.',
    'Clean, sharp light that reveals every detail with clarity.',
  ],
  overcast: [
    'Soft, diffused light creates a gentle, even atmosphere with minimal shadows.',
    'The cloud cover acts as a natural softbox, creating flattering, even illumination.',
    'Muted light with a quiet, contemplative quality.',
  ],
  dark: [
    'Dramatic low-light atmosphere with deep shadows and selective illumination.',
    'Moody, intimate environment where light sources become compositional elements.',
    'High contrast between darkness and available light sources creates mystery.',
  ],
  night: [
    'Night atmosphere with artificial light sources creating pockets of warm illumination.',
    'Dark environment with light trails and reflections adding dynamic visual elements.',
    'The darkness emphasizes the available light, creating dramatic contrast.',
  ],
};

const STORYTELLING: Record<string, string[]> = {
  beach: ['The endless horizon and rhythmic waves create a meditative, timeless quality.', 'Coastal scenes naturally evoke feelings of freedom and infinite possibility.'],
  mountain: ['The vast scale and dramatic peaks create an epic, awe-inspiring backdrop.', 'Layered mountain ridges suggest depth and the grandeur of nature.'],
  city: ['Urban architecture provides strong lines and contrasts, perfect for contemporary narratives.', 'The city backdrop offers dynamic energy with layers of life and movement.'],
  luxury_property: ['Clean lines and sophisticated spaces create a canvas for luxury visual storytelling.', 'The refined environment speaks of success and curated aesthetics.'],
  sunset_point: ['The dramatic sky creates a naturally cinematic backdrop with evolving color.', 'Sunset light transforms any scene into a romantic, golden moment.'],
  street: ['Urban texture and authentic life create raw, compelling visual stories.', 'Street scenes offer candid moments and genuine human context.'],
  forest: ['Dappled light through canopy creates a magical, enchanted atmosphere.', 'Natural elements provide organic framing and textured depth.'],
  default: ['The environment provides interesting visual potential for creative composition.', 'Natural and architectural elements combine to create visual interest.'],
};

const PALETTES: Record<string, string[][]> = {
  golden_hour: [
    ['warm gold', 'amber', 'orange', 'deep teal', 'soft purple'],
    ['honey', 'copper', 'terracotta', 'navy', 'lavender'],
    ['saffron', 'coral', 'bronze', 'indigo', 'rose'],
  ],
  beach: [
    ['ocean blue', 'sand cream', 'sky azure', 'white foam', 'coral pink'],
    ['turquoise', 'beige', 'cerulean', 'ivory', 'salmon'],
  ],
  mountain: [
    ['olive green', 'slate grey', 'sky blue', 'snow white', 'pine'],
    ['sage', 'charcoal', 'ice blue', 'cream', 'forest green'],
  ],
  city: [
    ['steel grey', 'neon cyan', 'warm orange', 'deep navy', 'glass blue'],
    ['concrete', 'amber', 'midnight', 'silver', 'neon pink'],
  ],
  luxury_property: [
    ['cream white', 'gold', 'marble grey', 'palm green', 'pool teal'],
    ['ivory', 'champagne', 'pearl', 'sage', 'sky'],
  ],
  default: [
    ['neutral tones', 'soft pastels', 'deep shadows', 'warm highlights', 'muted accents'],
    ['earth tones', 'faded blues', 'warm greys', 'cream', 'olive'],
  ],
};

const SCENE_TYPES: Record<string, SceneTypeAI[]> = {
  beach: ['romantic_sunset', 'adventure_discovery', 'travel_documentary'],
  mountain: ['epic_arrival', 'adventure_discovery', 'motivational_success'],
  city: ['urban_editorial', 'street_candid', 'cinematic_walking'],
  luxury_property: ['luxury_lifestyle', 'editorial_spread', 'hero_introduction'],
  sunset_point: ['romantic_sunset', 'golden_hour_portrait', 'dream_sequence'],
  street: ['street_candid', 'cinematic_walking', 'urban_editorial'],
  cafe: ['street_candid', 'cinematic_walking', 'intimate_portrait'],
  forest: ['dream_sequence', 'adventure_discovery', 'travel_documentary'],
  rooftop: ['luxury_lifestyle', 'hero_introduction', 'cinematic_walking'],
  desert: ['epic_arrival', 'motivational_success', 'travel_documentary'],
  lake: ['romantic_sunset', 'dream_sequence', 'golden_hour_portrait'],
  garden: ['romantic_sunset', 'dream_sequence', 'golden_hour_portrait'],
  indoor_studio: ['editorial_spread', 'luxury_lifestyle', 'hero_introduction'],
  night_club: ['night_cinematography', 'mystery_noir', 'urban_editorial'],
  historical_place: ['travel_documentary', 'cinematic_walking', 'epic_arrival'],
};

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(Math.floor(seed)) % arr.length];
}

export class DirectorVisionEngine {
  analyze(location: LocationType, mood: string, isGoldenHour: boolean, dominantColors?: string[]): DirectorVisionResult {
    const now = Date.now();
    const seed = now + location.length * 1000 + (dominantColors?.length ?? 0) * 500;

    const storyTypes = Object.keys(STORY_TYPES).includes(mood) ? STORY_TYPES[mood] : STORY_TYPES.default;
    const storyType = pick(storyTypes, seed);

    const atmosKey = isGoldenHour ? 'golden_hour' : 'bright_day';
    const atmosphere = pick(ATMOSPHERES[atmosKey] || ATMOSPHERES.bright_day, seed + 100);

    const storyLines = STORYTELLING[location] || STORYTELLING.default;
    const storytellingPotential = pick(storyLines, seed + 200);

    const paletteKey = isGoldenHour ? 'golden_hour' : location;
    const paletteOptions = PALETTES[paletteKey] || PALETTES.default;
    const colorPalette = pick(paletteOptions, seed + 300);

    const foreground = this.getForeground(location, seed);
    const background = this.getBackground(location, seed);
    const depthAnalysis = this.getDepthAnalysis(location, isGoldenHour, seed);

    const visualTheme = this.getVisualTheme(location, mood, seed);
    const suggestion = this.getSuggestion(location, mood, isGoldenHour, seed);

    return {
      storyType,
      storytellingPotential,
      foregroundElements: foreground,
      backgroundElements: background,
      depthAnalysis,
      colorPalette,
      atmosphere,
      visualTheme,
      suggestion,
    };
  }

  generateHollywoodScene(sceneType: SceneTypeAI, mood: MoodType): HollywoodScene {
    const now = Date.now();
    const seed = now + sceneType.length * 1000;

    const baseScenes: Record<SceneTypeAI, Omit<HollywoodScene, 'sceneType'>> = {
      epic_arrival: {
        cameraPosition: 'Low angle, wide 24mm lens, subject approaching from distance',
        subjectPosition: 'Walking toward camera from the horizon',
        movementDirection: 'Slow, deliberate approach — each step builds anticipation',
        facialExpression: 'Determined, focused on the horizon with quiet confidence',
        handPosition: 'Hands relaxed at sides or casually in pockets',
        walkingSpeed: 'Slow and measured — 0.5m/s with grounded strides',
        shotDuration: 8,
        expectedResult: 'Heroic arrival frame with the scale of the environment behind the subject',
        directionSteps: [
          'Start walking toward camera from the farthest point',
          'Keep your gaze on the horizon, not the camera',
          'Slow your pace as you approach — let anticipation build',
          'Pause at the 5m mark and hold for 2 seconds',
          'Turn your head slowly toward the camera with a slight nod',
        ],
      },
      adventure_discovery: {
        cameraPosition: 'Eye level, 35mm lens, following at 5m distance',
        subjectPosition: 'Exploring the environment, interacting with surroundings',
        movementDirection: 'Curious and natural — pause and examine things',
        facialExpression: 'Genuine wonder — eyes wide, slight smile of discovery',
        handPosition: 'Reaching out to touch elements, holding discoveries',
        walkingSpeed: 'Casual exploration pace — unhurried and curious',
        shotDuration: 10,
        expectedResult: 'Authentic discovery moment with natural curiosity',
        directionSteps: [
          'Enter the frame naturally from the side',
          'Look around as if seeing this place for the first time',
          'Reach out and touch something — a wall, leaf, or railing',
          'Pause and take in the view with a genuine expression',
          'Continue exploring with natural, unhurried movement',
        ],
      },
      luxury_lifestyle: {
        cameraPosition: 'Gimbal orbit at 3m radius, 85mm lens, smooth rotation',
        subjectPosition: 'Elegant seated or standing pose with refined posture',
        movementDirection: 'Minimal, controlled — every gesture is deliberate',
        facialExpression: 'Relaxed sophistication — slight smirk, knowing look',
        handPosition: 'Holding a prop (glass, sunglasses) or elegant hand on hip',
        walkingSpeed: 'Slow, graceful strides — intentional and poised',
        shotDuration: 6,
        expectedResult: 'Luxury lifestyle editorial frame with premium aesthetic',
        directionSteps: [
          'Assume your position with natural elegance',
          'Take a slow sip or adjust your sunglasses deliberately',
          'Turn to the camera with relaxed confidence',
          'Let your gaze linger — unhurried and self-assured',
          'A subtle smile — you know you belong here',
        ],
      },
      hero_introduction: {
        cameraPosition: 'Low angle push-in, 50mm lens, starting at 10m',
        subjectPosition: 'Standing tall, centered, occupying the frame with presence',
        movementDirection: 'Forward and commanding — own the space',
        facialExpression: 'Focused, powerful — intense gaze meeting the lens',
        handPosition: 'One hand in pocket, other relaxed — casual authority',
        walkingSpeed: 'Slow, powerful strides — each step lands with purpose',
        shotDuration: 6,
        expectedResult: 'Powerful hero introduction with commanding screen presence',
        directionSteps: [
          'Stand with your shoulders back and chin slightly raised',
          'Walk forward with deliberate, grounded steps',
          'Lock eyes with the camera as you approach',
          'Pause in center frame and hold the moment',
          'A slight, confident nod — you are in control',
        ],
      },
      road_journey: {
        cameraPosition: 'Side tracking from vehicle or dolly, 35mm lens',
        subjectPosition: 'Walking along the road or leaning against a vehicle',
        movementDirection: 'Forward with occasional pauses to take in the view',
        facialExpression: 'Contemplative and free — peaceful connection to the journey',
        handPosition: 'Hands in pockets or holding a travel bag strap',
        walkingSpeed: 'Leisurely stroll — the journey is the destination',
        shotDuration: 8,
        expectedResult: 'Iconic road trip frame with a sense of freedom and movement',
        directionSteps: [
          'Walk along the edge of the road at a relaxed pace',
          'Stop and look back at the road behind you',
          'Take a deep breath and survey the landscape',
          'Continue forward without looking back',
          'Let your body language show you are at peace',
        ],
      },
      romantic_sunset: {
        cameraPosition: 'Side profile, backlit by sunset, 85mm f/1.4 lens',
        subjectPosition: 'Facing the sunset, profile visible to camera',
        movementDirection: 'Minimal — soft, gentle shifts in position',
        facialExpression: 'Dreamy, peaceful — soft smile, distant gaze',
        handPosition: 'Touching hair gently, holding a flower, or relaxed at sides',
        walkingSpeed: 'Static or very slow, floating movement',
        shotDuration: 5,
        expectedResult: 'Romantic golden hour portrait with warm rim light and soft atmosphere',
        directionSteps: [
          'Stand facing the sunset with your side to the camera',
          'Slowly turn your face toward the warm light',
          'Tilt your chin up slightly to catch the rim light',
          'Run your fingers through your hair gently',
          'Close your eyes for a moment, then open them softly',
        ],
      },
      dream_sequence: {
        cameraPosition: 'Overhead or low angle with slow rotation, 50mm lens',
        subjectPosition: 'Lying down, spinning slowly, or reaching upward',
        movementDirection: 'Slow, ethereal — like moving through water',
        facialExpression: 'Dreamy, distant — lost in thought or wonder',
        handPosition: 'Arms spread, reaching up, or touching face gently',
        walkingSpeed: 'Slow motion quality — float rather than walk',
        shotDuration: 10,
        expectedResult: 'Ethereal dream sequence with mystical, floating quality',
        directionSteps: [
          'Lie back and close your eyes completely',
          'Take three slow, deep breaths to enter a relaxed state',
          'Slowly open your eyes as if waking from a dream',
          'Reach one hand up as if touching the sky',
          'Move your hand slowly through the air with wonder',
        ],
      },
      travel_documentary: {
        cameraPosition: 'Wide establishing then push to subject, 24-35mm lens',
        subjectPosition: 'Interacting with the local environment naturally',
        movementDirection: 'Exploratory — authentic, unscripted movement',
        facialExpression: 'Genuine curiosity and happiness — natural reactions',
        handPosition: 'Holding a map, camera, phone, or local item',
        walkingSpeed: 'Natural, unhurried pace — taking it all in',
        shotDuration: 12,
        expectedResult: 'Authentic travel documentary footage with genuine human connection',
        directionSteps: [
          'Walk through the location as if discovering it',
          'Stop and observe something that catches your interest',
          'Pull out your phone to capture the moment',
          'Look up and smile naturally at the beauty around you',
          'Interact with the environment — touch, feel, experience',
        ],
      },
      motivational_success: {
        cameraPosition: 'Low angle, 24mm wide lens, looking up at subject',
        subjectPosition: 'Standing on higher ground or at the top of a climb',
        movementDirection: 'Ascending or standing at the peak with presence',
        facialExpression: 'Triumphant, accomplished — quiet pride and determination',
        handPosition: 'Arms open, fists gently raised, or pointing at the horizon',
        walkingSpeed: 'Climbing confidently — each step is earned',
        shotDuration: 6,
        expectedResult: 'Triumphant achievement frame with massive environmental scale',
        directionSteps: [
          'Stand at the highest point available',
          'Look out at the full scope of the view',
          'Open your arms to embrace the achievement',
          'Breathe deeply — this moment belongs to you',
          'Turn and face the path ahead with renewed purpose',
        ],
      },
      cinematic_walking: {
        cameraPosition: 'Side tracking, 50mm lens, slow motion at 60fps',
        subjectPosition: 'Walking with purpose through the environment',
        movementDirection: 'Forward with confident, rhythmic steps',
        facialExpression: 'Cool, collected — aware but not performing',
        handPosition: 'Hands in coat pockets or swinging naturally at sides',
        walkingSpeed: 'Steady, confident pace — each step intentional',
        shotDuration: 8,
        expectedResult: 'Iconic cinematic walking sequence with rhythmic elegance',
        directionSteps: [
          'Start walking with a natural, confident rhythm',
          'Look straight ahead — do not acknowledge the camera',
          'Find your pace and settle into it',
          'Pause briefly when you reach center frame',
          'Continue out of frame without breaking your stride',
        ],
      },
      editorial_spread: {
        cameraPosition: 'Eye level, 85mm lens, studio lighting setup',
        subjectPosition: 'Bold, fashion-forward poses with attitude',
        movementDirection: 'Minimal — controlled transitions between positions',
        facialExpression: 'Editorial — serious, bold, or elegantly detached',
        handPosition: 'Angular, intentional — each hand placement is deliberate',
        walkingSpeed: 'Static or very controlled, deliberate movement',
        shotDuration: 4,
        expectedResult: 'Editorial fashion frame with magazine-quality composition',
        directionSteps: [
          'Stand with your weight shifted to your back leg',
          'Pop your hip slightly for a fashion silhouette',
          'Place one hand on your hip with attitude',
          'Chin slightly down, eyes intense and focused',
          'Hold each pose for a full 3-count before transitioning',
        ],
      },
      street_candid: {
        cameraPosition: 'Eye level, 35mm lens, natural light, documentary distance',
        subjectPosition: 'Walking through urban environment naturally',
        movementDirection: 'Natural street flow — authentic and unposed',
        facialExpression: 'In-the-moment — natural reactions to surroundings',
        handPosition: 'Holding coffee, phone, shopping bag, or hands in pockets',
        walkingSpeed: 'Urban pace — natural speed for the context',
        shotDuration: 3,
        expectedResult: 'Authentic street style frame with genuine urban energy',
        directionSteps: [
          'Walk naturally through the urban environment',
          'Glance at shop windows as you pass by',
          'Pause briefly to check your phone',
          'Look up as if recognizing someone in the distance',
          'Continue walking — candid and authentic',
        ],
      },
      golden_hour_portrait: {
        cameraPosition: 'Eye level, 85mm f/1.4, backlit by golden sun',
        subjectPosition: 'Facing slightly away from direct sun, face catching warm light',
        movementDirection: 'Minimal, relaxed — let the light do the work',
        facialExpression: 'Soft, warm — natural, genuine smile with relaxed eyes',
        handPosition: 'Touching hair lightly, or relaxed naturally at sides',
        walkingSpeed: 'Static — this is a moment to hold',
        shotDuration: 3,
        expectedResult: 'Golden hour portrait with warm skin tones and lens flare',
        directionSteps: [
          'Face the sunset at a 45-degree angle',
          'Turn your face slightly toward the camera',
          'Let the warm golden light illuminate your features',
          'Relax your jaw and soften your eyes',
          'Give a natural, genuine smile — think of something beautiful',
        ],
      },
      night_cinematography: {
        cameraPosition: 'Wide aperture, 35mm f/1.4, high ISO, near streetlamp',
        subjectPosition: 'Positioned near a light source in the dark environment',
        movementDirection: 'Minimal — emphasize the contrast between light and shadow',
        facialExpression: 'Mysterious, moody, contemplative — eyes catching light',
        handPosition: 'Hands in pockets, holding a warm drink, or touching collar',
        walkingSpeed: 'Slow, deliberate — each step measured against the dark',
        shotDuration: 5,
        expectedResult: 'Moody night scene with dramatic lighting and atmospheric depth',
        directionSteps: [
          'Stand close to a light source — let it illuminate one side of your face',
          'Look away from the camera into the darkness',
          'Take a slow, visible breath — let the cold air add atmosphere',
          'Walk slowly through the lit area, pausing in pools of light',
          'Turn back toward the camera with the light behind you',
        ],
      },
      urban_editorial: {
        cameraPosition: 'Eye level, 35mm lens, clean urban backdrop',
        subjectPosition: 'Standing against textured urban wall or structure',
        movementDirection: 'Minimal — strong static poses, controlled transitions',
        facialExpression: 'Cool, editorial detachment — confident and aware',
        handPosition: 'Hands in pockets, holding a coffee, or adjusting collar',
        walkingSpeed: 'Slow, deliberate transitions between poses',
        shotDuration: 4,
        expectedResult: 'Urban editorial frame with city texture and attitude',
        directionSteps: [
          'Stand with your back against a textured wall',
          'Cross one ankle over the other, hands in pockets',
          'Look down, then slowly up at the camera',
          'Roll your shoulder forward for dimension',
          'Hold each position for a 3-count',
        ],
      },
      intimate_portrait: {
        cameraPosition: 'Close, 85mm f/1.4, soft natural light from window',
        subjectPosition: 'Seated or close up, intimate distance to camera',
        movementDirection: 'Minimal — small, subtle adjustments',
        facialExpression: 'Vulnerable, soft — eyes carrying emotion',
        handPosition: 'Touching face gently, or hands folded in lap',
        walkingSpeed: 'Static — this is about the moment between movements',
        shotDuration: 3,
        expectedResult: 'Intimate close portrait with emotional depth and soft light',
        directionSteps: [
          'Settle into a comfortable position',
          'Take a slow breath and soften your entire face',
          'Let your thoughts drift to something meaningful',
          'Slowly bring your gaze to meet the lens',
          'Hold the emotion — this is the frame',
        ],
      },
      mystery_noir: {
        cameraPosition: 'Dutch angle or low angle, 50mm, high contrast lighting',
        subjectPosition: 'Half in shadow, half in light — partially revealed',
        movementDirection: 'Slow, deliberate — reveal yourself gradually',
        facialExpression: 'Enigmatic, slightly dangerous — hint of a story untold',
        handPosition: 'Adjusting collar, holding hat brim, or lighting a cigarette prop',
        walkingSpeed: 'Slow, purposeful — each step echoes',
        shotDuration: 6,
        expectedResult: 'Noir-inspired scene with mystery, shadow, and tension',
        directionSteps: [
          'Stand in the shadows, letting only half your face catch the light',
          'Look at the ground, then slowly raise your eyes',
          'Take a slow step forward into the light',
          'Pause — let the shadow fall across you again',
          'Turn and walk away, disappearing into darkness',
        ],
      },
    };

    const base = baseScenes[sceneType] || baseScenes.cinematic_walking;
    return { sceneType, ...base };
  }

  private getForeground(location: LocationType, seed: number): string[] {
    const map: Record<string, string[]> = {
      beach: ['sand ripples', 'seashells', 'driftwood patterns', 'footprints leading to water'],
      mountain: ['layered rocks', 'wildflowers in the breeze', 'pine needles on trail', 'stacked stones'],
      city: ['reflective puddles', 'curb edges', 'crosswalk stripes', 'steam vents'],
      forest: ['fern fronds', 'moss-covered logs', 'fallen leaves', 'mushroom clusters'],
      luxury_property: ['pool edge reflections', 'marble columns', 'polished floor', 'fountain rim'],
      rooftop: ['parapet edge', 'terrace plants', 'cafe table', 'city light reflection'],
      street: ['cobblestone texture', 'cafe chairs', 'street signs', 'flower boxes'],
      cafe: ['coffee cup', 'fresh flowers', 'menu board', 'pastry display'],
      desert: ['sand ripples', 'cactus silhouette', 'rock formations', 'dust particles'],
      sunset_point: ['grass silhouettes', 'horizon line', 'cloud reflections', 'warm haze'],
      garden: ['flower petals', 'fountain edge', 'stone path', 'ornamental grass'],
      lake: ['rippled water surface', 'pebbles on shore', 'reed stems', 'dragonfly perches'],
      indoor_studio: ['textured backdrop', 'softbox reflection', 'cable lines', 'prop placement'],
      pool: ['water surface', 'tiled edge', 'floating objects', 'chlorine ripple'],
      night_club: ['smoke machine haze', 'neon reflections', 'glass surfaces', 'stage lights'],
      hotel_room: ['bed linen texture', 'window view', 'lamp glow', 'room key'],
    };
    const items = map[location] || ['foreground texture elements', 'natural details', 'environmental accents'];
    return items.slice(seed % items.length, seed % items.length + 3);
  }

  private getBackground(location: LocationType, seed: number): string[] {
    const map: Record<string, string[]> = {
      beach: ['ocean horizon fading into sky', 'distant cliffs catching light', 'pier stretching into water', 'sailing boats at distance'],
      mountain: ['snow-capped peaks in layers', 'valley unfolding below', 'cloud formations between ridges', 'distant lake reflection'],
      city: ['skyscraper skyline', 'light trails from traffic', 'architectural glass patterns', 'bridges spanning the view'],
      forest: ['dappled sunlight through canopy', 'layered tree trunks fading', 'forest clearing ahead', 'mist between trees'],
      luxury_property: ['panoramic ocean/city view', 'infinity pool blending with horizon', 'modern architecture lines', 'landscaped garden tiers'],
      rooftop: ['city skyline spreading out', 'sun setting behind buildings', 'sky opening up', 'neighbourhood below'],
      street: ['building facades receding', 'street stretching into distance', 'urban canyon perspective', 'alley depth'],
      cafe: ['warm interior with wood tones', 'other patrons in background', 'window view to street', 'shelves with decor'],
      desert: ['dune waves to horizon', 'mountain silhouettes far away', 'heat shimmer on sand', 'clear sky fading to pale'],
      sunset_point: ['warm gradient sky', 'sun disk touching horizon', 'clouds catching colors', 'land silhouetted against glow'],
      garden: ['layered flower beds', 'hedge walls framing view', 'garden path curving away', 'greenhouse in distance'],
      lake: ['opposite shore line', 'mountain reflected in water', 'sun path across surface', 'islands dotting the view'],
      indoor_studio: ['clean backdrop sweep', 'light modifiers in distance', 'props arranged behind', 'studio depth'],
      pool: ['pool stretching away', 'loungers and umbrellas', 'landscaping beyond', 'waterfall feature'],
      night_club: ['colored lights on walls', 'crowd silhouettes', 'smoke-filled air', 'DJ booth in distance'],
      hotel_room: ['city view through window', 'luxury bathroom beyond', 'artwork on wall', 'balcony doors open'],
    };
    const items = map[location] || ['environmental backdrop', 'depth-creating layers', 'distant visual context'];
    return items.slice(seed % items.length, seed % items.length + 2);
  }

  private getDepthAnalysis(location: LocationType, golden: boolean, seed: number): string {
    const analyses = golden
      ? [
          'Exceptional depth — golden light creates distinct separation between foreground, subject, and background layers.',
          'The warm backlight carves the subject out from the background, creating three-dimensional depth.',
          'Golden hour light naturally separates the subject from the environment with warm rim lighting.',
        ]
      : {
          beach: ['Strong depth with ocean horizon and sand leading lines creating natural perspective.', 'Coastal scenes have natural depth with shoreline, water, and sky as distinct layers.'],
          mountain: ['Remarkable depth with layered mountain ridges, valley, and sky creating immersive scale.', 'The overlapping peaks and valleys create a naturally layered composition with vast depth.'],
          city: ['Good depth through perspective lines and overlapping architectural planes of varying distances.', 'Urban environments offer strong depth cues through receding buildings and street lines.'],
          default: ['Moderate depth — consider using foreground elements to add dimensionality to the frame.', 'The scene has decent depth potential — position subjects between foreground and background layers.'],
        };

    if (golden) return pick(analyses as string[], seed);
    const options = (analyses as Record<string, string[]>)[location] || (analyses as Record<string, string[]>).default;
    return pick(options, seed + location.length);
  }

  private getVisualTheme(location: LocationType, mood: string, seed: number): string {
    const themes: Record<string, string[]> = {
      luxury: [
        'Wealth & Elegance — clean lines, warm neutrals, reflective surfaces, understated opulence',
        'Premium Aesthetic — curated details, soft textures, golden accents, refined simplicity',
      ],
      romantic: [
        'Intimacy & Warmth — soft focus, warm tones, dreamy atmosphere, emotional connection',
        'Tender Beauty — gentle curves, warm light, intimate spacing, romantic color palette',
      ],
      adventure: [
        'Discovery & Scale — wide angles, dramatic lighting, environmental context, movement energy',
        'Exploration Spirit — dynamic composition, natural elements, journey narrative, open space',
      ],
    };

    const defaultTheme = 'Natural Beauty — authentic, vibrant, balanced composition with environmental context';
    const themeList = themes[mood] || [defaultTheme];
    return pick(themeList, seed);
  }

  private getSuggestion(location: LocationType, mood: string, golden: boolean, seed: number): string {
    const goldenSuggestions = [
      'This light is exceptional — position the subject so the warm backlight creates a natural rim light effect around their silhouette.',
      'The golden hour glow transforms this location into a cinematic canvas — use the warm directional light to sculpt the subject\'s features.',
      'Let the golden light be your key element — backlight the subject and expose for the warm highlights for a dreamy, editorial look.',
      'The warm quality of this light creates instant production value — position the subject facing the sun at a 45° angle for perfect skin tones.',
    ];

    if (golden) return pick(goldenSuggestions, seed);

    const locationSuggestions: Record<string, string[]> = {
      beach: ['Use the shoreline as a leading line toward the subject for a natural, dynamic composition.', 'Position the subject where the water meets the sand for a visually striking contrast point.'],
      mountain: ['Incorporate the layered ridges in the background by positioning the subject on a foreground rock or ledge.', 'Use the vast scale by keeping the subject small in a wide frame to emphasize the environment\'s magnitude.'],
      city: ['Look for reflections in glass buildings to create symmetrical or abstract elements in the frame.', 'Shoot from a high vantage point with the subject looking out over the city for an urban editorial feel.'],
      luxury_property: ['Emphasize the symmetry and clean lines of the architecture by centering the subject in wide frames.', 'Use the pool or reflective surfaces to create mirror images that double the visual impact.'],
      street: ['Find clean, textured walls as backdrops — they provide context without competing with the subject.', 'Use the depth of the street as a leading line toward the subject positioned at the vanishing point.'],
    };

    const suggestions = locationSuggestions[location] || [
      'Look for natural framing elements in the environment to add depth and context to the composition.',
      'Consider how the available light sculpts the space — position your subject where the light is most interesting.',
    ];

    return pick(suggestions, seed + location.length);
  }
}

export const directorVision = new DirectorVisionEngine();
