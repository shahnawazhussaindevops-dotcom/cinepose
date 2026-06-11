import type { DirectorVisionResult, HollywoodScene, SceneTypeAI, LocationType, MoodType } from './types';

export class DirectorVisionEngine {
  analyze(location: LocationType, mood: string, isGoldenHour: boolean): DirectorVisionResult {
    const palette = this.getPalette(location, isGoldenHour);
    return {
      storyType: this.getStoryType(location, mood),
      storytellingPotential: this.getStorytellingPotential(location, isGoldenHour),
      foregroundElements: this.getForeground(location),
      backgroundElements: this.getBackground(location),
      depthAnalysis: this.getDepthAnalysis(location),
      colorPalette: palette,
      atmosphere: this.getAtmosphere(location, isGoldenHour),
      visualTheme: this.getVisualTheme(location, mood),
      suggestion: this.getSuggestion(location, mood, isGoldenHour),
    };
  }

  generateHollywoodScene(
    sceneType: SceneTypeAI,
    mood: MoodType
  ): HollywoodScene {
    const scenes: Record<SceneTypeAI, HollywoodScene> = {
      epic_arrival: {
        sceneType: 'epic_arrival',
        cameraPosition: 'Low angle, 15m distance, 24mm lens',
        subjectPosition: 'Walking toward camera from distance',
        movementDirection: 'Walk slowly toward camera',
        facialExpression: 'Confident, looking at horizon, slight smile',
        handPosition: 'Hands relaxed at sides or in pockets',
        walkingSpeed: 'Slow, deliberate steps (0.5m/s)',
        shotDuration: 8,
        expectedResult: 'Heroic arrival shot with dramatic scale',
        directionSteps: [
          'Start walking from 50m away',
          'Look at the horizon, not the camera',
          'Slow down as you approach',
          'Stop at 5m, pause for 2 seconds',
          'Turn slightly left, let sunlight hit your face',
        ],
      },
      adventure_discovery: {
        sceneType: 'adventure_discovery',
        cameraPosition: 'Eye level, following subject at 5m, 35mm',
        subjectPosition: 'Looking at surroundings, touching elements',
        movementDirection: 'Walk and explore naturally',
        facialExpression: 'Curious, wide eyes, wonder',
        handPosition: 'Reaching out to touch elements',
        walkingSpeed: 'Casual exploration pace',
        shotDuration: 10,
        expectedResult: 'Authentic discovery moment, National Geographic style',
        directionSteps: [
          'Walk into frame from left',
          'Look up at surroundings',
          'Reach out and touch a tree/wall',
          'Turn around slowly, taking it all in',
          'Smile naturally at the beauty around you',
        ],
      },
      luxury_lifestyle: {
        sceneType: 'luxury_lifestyle',
        cameraPosition: 'Smooth gimbal, orbit around subject, 85mm',
        subjectPosition: 'Sitting or standing elegantly',
        movementDirection: 'Minimal movement, controlled poses',
        facialExpression: 'Relaxed, sophisticated, slight smirk',
        handPosition: 'Held champagne, sunglasses, or subtle hand on hip',
        walkingSpeed: 'Slow, elegant strides',
        shotDuration: 6,
        expectedResult: 'Luxury lifestyle editorial, like GQ/Vogue',
        directionSteps: [
          'Stand near the pool/balcony edge',
          'Look out at the view',
          'Take a sip of your drink slowly',
          'Turn to camera with relaxed confidence',
          'Run hand through hair naturally',
        ],
      },
      hero_introduction: {
        sceneType: 'hero_introduction',
        cameraPosition: 'Low angle push-in, 50mm, starting at 10m',
        subjectPosition: 'Standing tall, centered, commanding presence',
        movementDirection: 'Walk slowly toward camera',
        facialExpression: 'Determined, powerful, intense gaze',
        handPosition: 'One hand in pocket, other relaxed',
        walkingSpeed: 'Slow, powerful strides',
        shotDuration: 6,
        expectedResult: 'Powerful cinematic hero shot',
        directionSteps: [
          'Stand tall, shoulders back',
          'Walk slowly toward camera',
          'Look at horizon, then slowly at lens',
          'Pause, let the wind hit you',
          'Slight nod — you own this moment',
        ],
      },
      road_journey: {
        sceneType: 'road_journey',
        cameraPosition: 'Side tracking shot, vehicle or dolly, 35mm',
        subjectPosition: 'Walking along road or leaning on vehicle',
        movementDirection: 'Walk alongside the road',
        facialExpression: 'Contemplative, free, peaceful',
        handPosition: 'Hands in pockets or holding a bag',
        walkingSpeed: 'Leisurely stroll',
        shotDuration: 8,
        expectedResult: 'Iconic road trip cinematography',
        directionSteps: [
          'Walk along the road edge',
          'Look back at the road behind',
          'Stop and take in the view',
          'Continue walking, don\'t look back',
          'Natural movement, feel the freedom',
        ],
      },
      romantic_sunset: {
        sceneType: 'romantic_sunset',
        cameraPosition: 'Side profile, backlit, 85mm f/1.4',
        subjectPosition: 'Facing sunset, profile to camera',
        movementDirection: 'Minimal movement, leaning or sitting',
        facialExpression: 'Soft, dreamy, peaceful',
        handPosition: 'Holding a flower, or touching hair gently',
        walkingSpeed: 'Static or very slow movement',
        shotDuration: 5,
        expectedResult: 'Romantic golden hour scene with warm rim light',
        directionSteps: [
          'Stand facing the sunset',
          'Turn profile to camera slowly',
          'Tilt head up to catch the light',
          'Run fingers through your hair gently',
          'Close your eyes, breathe deeply',
        ],
      },
      dream_sequence: {
        sceneType: 'dream_sequence',
        cameraPosition: 'Overhead, slow rotation, 50mm',
        subjectPosition: 'Lying down or spinning slowly',
        movementDirection: 'Slow, ethereal movement',
        facialExpression: 'Dreamy, distant, mystical',
        handPosition: 'Arms spread or reaching up',
        walkingSpeed: 'Slow motion, floating quality',
        shotDuration: 10,
        expectedResult: 'Ethereal dream sequence with mystical quality',
        directionSteps: [
          'Lie down on the ground/grass',
          'Close your eyes, relax completely',
          'Slowly open your eyes',
          'Reach one hand up toward the sky',
          'Move your hand slowly as if touching clouds',
        ],
      },
      travel_documentary: {
        sceneType: 'travel_documentary',
        cameraPosition: 'Wide establishing then push to subject, 24-35mm',
        subjectPosition: 'Interacting with local environment',
        movementDirection: 'Natural exploration',
        facialExpression: 'Genuine curiosity, happiness',
        handPosition: 'Holding map, camera, or local item',
        walkingSpeed: 'Natural pace',
        shotDuration: 12,
        expectedResult: 'Authentic travel documentary footage',
        directionSteps: [
          'Walk through the location naturally',
          'Stop to observe something interesting',
          'Pull out your phone/camera to capture it',
          'Look up and smile at the beauty',
          'Interact with your surroundings authentically',
        ],
      },
      motivational_success: {
        sceneType: 'motivational_success',
        cameraPosition: 'Low angle looking up, 24mm wide',
        subjectPosition: 'Standing on higher ground or elevated',
        movementDirection: 'Walking up or standing at peak',
        facialExpression: 'Triumphant, accomplished, determined',
        handPosition: 'Arms open, fists raised, or pointing ahead',
        walkingSpeed: 'Climbing confidently',
        shotDuration: 6,
        expectedResult: 'Triumphant success scene with massive scale',
        directionSteps: [
          'Stand at the highest point',
          'Look out at the vast view',
          'Open your arms to embrace it',
          'Take a deep breath of achievement',
          'Turn and walk forward with purpose',
        ],
      },
      cinematic_walking: {
        sceneType: 'cinematic_walking',
        cameraPosition: 'Side tracking, 50mm, slow motion at 60fps',
        subjectPosition: 'Walking with purpose through location',
        movementDirection: 'Forward with occasional pauses',
        facialExpression: 'Cool, collected, slightly intense',
        handPosition: 'Hands in coat pockets or swinging naturally',
        walkingSpeed: 'Steady pace, confident',
        shotDuration: 8,
        expectedResult: 'Iconic cinematic walking sequence',
        directionSteps: [
          'Start walking from the right side',
          'Look straight ahead, confident',
          'Don\'t look at the camera',
          'Pause when you reach center frame',
          'Continue walking out of frame left',
        ],
      },
      editorial_spread: {
        sceneType: 'editorial_spread',
        cameraPosition: 'Eye level, 85mm, fashion lighting setup',
        subjectPosition: 'Bold, fashion-forward poses',
        movementDirection: 'Minimal, controlled transitions',
        facialExpression: 'Editorial — serious, bold, or detached',
        handPosition: 'Angular, intentional hand placement',
        walkingSpeed: 'Static or very controlled movement',
        shotDuration: 4,
        expectedResult: 'Editorial fashion spread, magazine quality',
        directionSteps: [
          'Stand with weight on back leg',
          'Pop your hip slightly',
          'One hand on hip, other relaxed',
          'Chin slightly down, eyes intense',
          'Hold each pose for 3 seconds',
        ],
      },
      street_candid: {
        sceneType: 'street_candid',
        cameraPosition: 'Eye level, 35mm, natural light',
        subjectPosition: 'Walking through street scene',
        movementDirection: 'Natural street flow',
        facialExpression: 'Natural, in-the-moment',
        handPosition: 'Holding coffee, phone, or bag',
        walkingSpeed: 'Urban pace',
        shotDuration: 3,
        expectedResult: 'Authentic street style photography',
        directionSteps: [
          'Walk naturally through the scene',
          'Look at shop windows as you pass',
          'Pause to check your phone',
          'Look up as if you see someone',
          'Continue walking naturally',
        ],
      },
      golden_hour_portrait: {
        sceneType: 'golden_hour_portrait',
        cameraPosition: 'Eye level, 85mm f/1.4, backlit',
        subjectPosition: 'Facing slightly away from sun',
        movementDirection: 'Minimal, relaxed',
        facialExpression: 'Soft, warm, natural smile',
        handPosition: 'Touching hair or relaxed at sides',
        walkingSpeed: 'Static',
        shotDuration: 3,
        expectedResult: 'Golden hour portrait with lens flare',
        directionSteps: [
          'Face the sunset, 45° angle',
          'Turn face slightly toward camera',
          'Let the warm light hit your face',
          'Relax your jaw and soften your eyes',
          'Natural, genuine smile',
        ],
      },
      night_cinematography: {
        sceneType: 'night_cinematography',
        cameraPosition: 'Wide aperture, 35mm f/1.4, high ISO',
        subjectPosition: 'Near light source (streetlamp, neon)',
        movementDirection: 'Minimal, use light trails as background',
        facialExpression: 'Mysterious, moody, contemplative',
        handPosition: 'Hands in pockets or holding warm drink',
        walkingSpeed: 'Slow, deliberate',
        shotDuration: 5,
        expectedResult: 'Moody night cinematography with bokeh light',
        directionSteps: [
          'Stand near a light source',
          'Let the light hit one side of your face',
          'Look away from camera into the dark',
          'Slow exhalation, visible in cold air',
          'Walk slowly through the lit area',
        ],
      },
    };

    return scenes[sceneType] || scenes.cinematic_walking;
  }

  private getStoryType(location: LocationType, mood: string): string {
    if (mood.includes('luxury')) return 'Luxury Lifestyle Story';
    if (mood.includes('adventure') || location === 'mountain') return 'Adventure Exploration';
    if (location === 'beach' || location === 'sunset_point') return 'Romantic Escape';
    if (location === 'city' || location === 'street') return 'Urban Narrative';
    if (mood.includes('mysterious')) return 'Mystery / Noir Tale';
    return 'Visual Journey';
  }

  private getStorytellingPotential(location: LocationType, golden: boolean): string {
    if (golden) return 'This scene feels like an epic travel film — golden light creates instant cinematic mood.';
    if (location === 'mountain' || location === 'desert') return 'Perfect for dramatic hero entrance or adventure discovery scene.';
    if (location === 'beach' || location === 'lake') return 'Ideal for emotional cinematic sequences with natural beauty.';
    if (location === 'luxury_property' || location === 'rooftop') return 'Perfect for luxury lifestyle content with high production value.';
    if (location === 'city') return 'Urban backdrop ideal for street style and contemporary narratives.';
    return 'Good visual foundation for storytelling with creative composition.';
  }

  private getForeground(location: LocationType): string[] {
    const map: Record<string, string[]> = {
      beach: ['sand ripples', 'seashells', 'driftwood', 'footprints'],
      mountain: ['rocks', 'wildflowers', 'tree branches', 'trail markers'],
      city: ['street signs', 'curb edges', 'rain reflections', 'crosswalks'],
      forest: ['ferns', 'mossy rocks', 'fallen leaves', 'mushrooms'],
      luxury_property: ['pool edge', 'columns', 'marble floor', 'fountain rim'],
    };
    return map[location] || ['interesting foreground texture', 'natural elements'];
  }

  private getBackground(location: LocationType): string[] {
    const map: Record<string, string[]> = {
      beach: ['ocean horizon', 'sunset sky', 'distant cliffs', 'pier structure'],
      mountain: ['snow-capped peaks', 'valley below', 'cloud formations', 'ridge lines'],
      city: ['skyscraper skyline', 'light trails', 'architectural patterns', 'street depth'],
      forest: ['dappled sunlight', 'tree canopy', 'forest floor', 'mist layers'],
      luxury_property: ['panoramic view', 'infinity pool', 'modern architecture', 'landscaped garden'],
    };
    return map[location] || ['environmental backdrop', 'depth layers'];
  }

  private getDepthAnalysis(location: LocationType): string {
    if (location === 'mountain' || location === 'desert') return 'Exceptional depth — foreground, midground, and background layers create immersive 3D feel.';
    if (location === 'beach' || location === 'lake') return 'Strong depth with water reflections adding mirror dimension to the scene.';
    if (location === 'city') return 'Great depth through perspective lines and overlapping architectural planes.';
    return 'Moderate depth — use foreground elements to add dimensionality.';
  }

  private getPalette(location: LocationType, golden: boolean): string[] {
    if (golden) return ['warm gold', 'amber', 'orange', 'deep teal', 'soft purple'];
    if (location === 'beach') return ['ocean blue', 'sand cream', 'sky azure', 'white foam', 'coral pink'];
    if (location === 'mountain') return ['olive green', 'slate grey', 'sky blue', 'snow white', 'pine green'];
    if (location === 'city') return ['steel grey', 'neon cyan', 'warm orange', 'deep navy', 'glass blue'];
    if (location === 'luxury_property') return ['cream white', 'gold', 'marble grey', 'palm green', 'pool teal'];
    return ['neutral tones', 'soft pastels', 'deep shadows', 'warm highlights'];
  }

  private getAtmosphere(location: LocationType, golden: boolean): string {
    if (golden) return 'Warm, golden glow with long dramatic shadows. Air feels thick with warm light.';
    if (location === 'mountain') return 'Crisp, clear air with expansive views. Light is clean and sharp.';
    if (location === 'beach') return 'Bright, airy with gentle breeze. Light reflects off sand and water.';
    if (location === 'city') return 'Dynamic environment with mixed lighting. Urban energy in the air.';
    if (location === 'luxury_property') return 'Controlled, elegant atmosphere. Clean lines and sophisticated ambiance.';
    return 'Natural environment with ambient lighting.';
  }

  private getVisualTheme(location: LocationType, mood: string): string {
    if (mood.includes('luxury')) return 'Wealth & Elegance — clean lines, warm neutrals, reflective surfaces';
    if (mood.includes('romantic')) return 'Intimacy & Warmth — soft focus, warm tones, dreamy atmosphere';
    if (mood.includes('adventure')) return 'Discovery & Scale — wide angles, dramatic lighting, environmental context';
    if (mood.includes('mysterious')) return 'Mystery & Depth — low key, shadows, contrast, texture';
    return 'Natural Beauty — authentic, vibrant, balanced composition';
  }

  private getSuggestion(location: LocationType, mood: string, golden: boolean): string {
    if (golden) return 'This location is ideal for a dramatic hero entrance — the warm backlight creates natural separation.';
    if (location === 'mountain') return 'This location is suitable for an epic travel film — vast scale demands wide compositions.';
    if (location === 'beach') return 'Perfect for romantic cinematic sequences — use the water line as a leading line.';
    if (location === 'luxury_property') return 'Ideal for luxury lifestyle content — emphasize symmetry and negative space.';
    if (location === 'city') return 'Great for dynamic urban storytelling — use reflections and light contrasts.';
    return 'Good location for creative visual storytelling with intentional composition.';
  }
}

export const directorVision = new DirectorVisionEngine();
