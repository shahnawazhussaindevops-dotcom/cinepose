import type { SceneContext, SceneAnalysisResult, CameraAngleType } from './types';

export class SceneUnderstandingEngine {
  analyzeScene(
    luminance: number,
    temperature: number,
    tiltAngle: number,
    isLandscape: boolean,
    isBacklit: boolean,
    isSidelit: boolean,
    shadowRatio: number,
    highlightRatio: number
  ): SceneContext {
    return {
      locationType: this.detectLocationType(luminance, temperature),
      weather: this.detectWeather(luminance, temperature, shadowRatio),
      lightingDirection: isBacklit ? 'backlit' : isSidelit ? 'side_lit' : 'front_lit',
      isGoldenHour: this.isGoldenHour(temperature, luminance),
      isBlueHour: this.isBlueHour(temperature, luminance),
      indoorLighting: luminance < 0.3 ? 'low' : luminance < 0.5 ? 'moderate' : 'bright',
      artificialLighting: temperature < 4000 ? 'warm' : temperature > 6000 ? 'cool' : 'neutral',
      backgroundDepth: this.estimateDepth(shadowRatio, luminance),
      subjectDistance: this.estimateDistance(luminance, highlightRatio),
      cameraAngle: this.detectCameraAngle(tiltAngle),
      cameraHeight: this.estimateCameraHeight(tiltAngle),
      focalLength: this.suggestFocalLength(this.detectCameraAngle(tiltAngle)),
      environmentMood: this.detectMood(luminance, temperature, isBacklit),
      timeOfDay: this.detectTimeOfDay(temperature, luminance),
      temperature,
    };
  }

  private detectLocationType(luminance: number, temperature: number): string {
    if (luminance > 0.7) {
      if (temperature > 6500) return 'open_landscape';
      if (temperature > 5500) return 'urban_street';
      return 'beach_or_desert';
    }
    if (luminance > 0.4) {
      if (temperature > 6000) return 'park_or_nature';
      if (temperature < 4500) return 'indoor_warm';
      return 'urban_indoor';
    }
    if (luminance < 0.2 && temperature < 4000) return 'indoor_dim';
    return 'indoor_controlled';
  }

  private detectWeather(luminance: number, temperature: number, shadowRatio: number): string {
    if (luminance > 0.7 && shadowRatio < 0.05) return 'clear_sunny';
    if (luminance > 0.5 && shadowRatio > 0.3) return 'partly_cloudy';
    if (luminance > 0.6 && temperature > 7000) return 'hazy';
    if (luminance < 0.4 && temperature > 6000) return 'overcast';
    if (luminance < 0.3 && shadowRatio < 0.1) return 'foggy_misty';
    return 'indoor';
  }

  private isGoldenHour(temperature: number, luminance: number): boolean {
    return temperature >= 3200 && temperature <= 4500 && luminance > 0.3 && luminance < 0.65;
  }

  private isBlueHour(temperature: number, luminance: number): boolean {
    return temperature > 6500 && temperature <= 8000 && luminance > 0.15 && luminance < 0.45;
  }

  private estimateDepth(shadowRatio: number, luminance: number): number {
    if (shadowRatio > 0.3) return 0.1;
    if (shadowRatio > 0.15) return 0.3;
    if (luminance > 0.6) return 0.8;
    return 0.5;
  }

  private estimateDistance(luminance: number, highlightRatio: number): number {
    if (highlightRatio > 0.2) return 0.2;
    if (luminance > 0.6) return 0.7;
    return 0.4;
  }

  private detectCameraAngle(tiltAngle: number): CameraAngleType {
    if (tiltAngle > 70) return 'overhead';
    if (tiltAngle > 45) return 'bird_eye';
    if (tiltAngle < 5) return 'worm_eye';
    if (tiltAngle < 15) return 'low_angle';
    if (tiltAngle > 25 && tiltAngle < 40) return 'high_angle';
    return 'eye_level';
  }

  private estimateCameraHeight(tiltAngle: number): number {
    if (tiltAngle > 60) return 0;
    if (tiltAngle > 30) return 0.3;
    if (tiltAngle < 10) return 1.8;
    return 1.2;
  }

  private suggestFocalLength(angle: CameraAngleType): number {
    const map: Record<CameraAngleType, number> = {
      eye_level: 50,
      low_angle: 24,
      high_angle: 70,
      bird_eye: 35,
      overhead: 24,
      dutch_angle: 35,
      worm_eye: 16,
    };
    return map[angle] || 50;
  }

  private detectMood(luminance: number, temperature: number, isBacklit: boolean): string {
    if (isBacklit) return 'dramatic_mysterious';
    if (this.isGoldenHour(temperature, luminance)) return 'warm_romantic';
    if (this.isBlueHour(temperature, luminance)) return 'calm_melancholic';
    if (luminance > 0.7) return 'bright_energetic';
    if (luminance < 0.25) return 'dark_intimate';
    if (temperature > 6000) return 'cool_serene';
    if (temperature < 4000) return 'warm_cozy';
    return 'neutral_balanced';
  }

  private detectTimeOfDay(temperature: number, luminance: number): string {
    if (this.isGoldenHour(temperature, luminance)) return 'golden_hour';
    if (this.isBlueHour(temperature, luminance)) return 'blue_hour';
    if (luminance > 0.65) return 'midday';
    if (luminance > 0.4) return 'afternoon';
    if (luminance > 0.2) return 'evening';
    return 'night';
  }

  determineBestSettings(ctx: SceneContext): Partial<SceneAnalysisResult> {
    const angleSuggestions: Record<CameraAngleType, string> = {
      eye_level: 'Eye-level — intimate, personal connection with subject',
      low_angle: 'Low angle — power, dominance, heroic framing',
      high_angle: 'High angle — vulnerability, overview, environmental context',
      bird_eye: 'Bird\'s eye — pattern, symmetry, abstract composition',
      overhead: 'Overhead — top-down, flat lay, drone perspective',
      dutch_angle: 'Dutch angle — tension, unease, dynamic energy',
      worm_eye: 'Worm\'s eye — extreme power, monumental scale',
    };

    const lensSuggestions: Record<string, string> = {
      portrait: '85mm f/1.4 — classic portrait compression, creamy bokeh',
      travel: '35mm f/2 — versatile wide, environmental storytelling',
      fashion: '70-200mm f/2.8 — compressed backgrounds, editorial separation',
      landscape: '16-35mm f/2.8 — sweeping vistas, dramatic foreground',
      street: '50mm f/1.8 — natural perspective, discreet shooting',
      macro: '100mm f/2.8 — detail extraction, abstract textures',
    };

    const framingSuggestions: Record<string, string> = {
      portrait: 'Rule of thirds — subject in left/right third, eyes on upper third',
      landscape: 'Leading lines — use natural lines to guide eye to subject',
      symmetry: 'Centered composition — perfect symmetry for architecture',
      negative: 'Negative space — minimal subject placement, maximal atmosphere',
      frame: 'Frame within frame — use doors/windows/arches as natural frames',
    };

    const placement: Record<string, string> = {
      center: 'Center placement — direct, confrontational, powerful',
      left_third: 'Left third — classical composition, leading gaze room',
      right_third: 'Right third — dynamic imbalance, forward momentum',
      bottom: 'Bottom third — grounded, environmental scale',
      edge: 'Edge placement — tension, modern editorial style',
    };

    const mood = ctx.environmentMood;
    let lensKey = 'portrait';
    let framingKey = 'portrait';
    let placeKey = 'center';

    if (ctx.locationType.includes('landscape') || ctx.locationType.includes('beach')) {
      lensKey = 'landscape';
      framingKey = 'landscape';
      placeKey = 'bottom';
    } else if (ctx.locationType.includes('street') || ctx.locationType.includes('urban')) {
      lensKey = 'street';
      framingKey = 'negative';
      placeKey = 'left_third';
    } else if (mood.includes('dramatic') || mood.includes('editorial')) {
      lensKey = 'fashion';
      framingKey = 'frame';
      placeKey = 'edge';
    } else if (ctx.indoorLighting === 'low' || ctx.indoorLighting === 'moderate') {
      lensKey = 'portrait';
      framingKey = 'symmetry';
      placeKey = 'center';
    }

    return {
      bestCameraAngle: angleSuggestions[ctx.cameraAngle] || angleSuggestions.eye_level,
      bestLensSuggestion: lensSuggestions[lensKey] || lensSuggestions.portrait,
      bestFraming: framingSuggestions[framingKey] || framingSuggestions.portrait,
      bestSubjectPlacement: placement[placeKey] || placement.center,
      overallMood: mood,
    };
  }
}

export const sceneEngine = new SceneUnderstandingEngine();
