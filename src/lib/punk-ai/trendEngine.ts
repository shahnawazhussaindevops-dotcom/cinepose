import type { TrendData, SceneContext, StyleTab } from './types';

interface TrendPattern {
  category: string;
  poses: string[];
  angles: string[];
  framing: string;
  engagement: number;
  hashtags: string[];
  season: string;
}

class SocialTrendEngine {
  private trends: TrendPattern[] = [
    {
      category: 'golden_hour_portrait',
      poses: ['looking_away', 'confident_stand', 'arms_out', 'silhouette_profile'],
      angles: ['eye_level', 'low_angle'],
      framing: 'Rule of thirds with sun flare on upper third',
      engagement: 92,
      hashtags: ['goldenhour', 'golden_hour_photography', 'goldenlight', 'warmtones'],
      season: 'all',
    },
    {
      category: 'urban_fashion',
      poses: ['crossed_arms', 'hand_in_pocket', 'candid_walk', 'leaning_wall', 'looking_down'],
      angles: ['eye_level', 'low_angle', 'dutch_angle'],
      framing: 'Leading lines from architecture, subject on left third',
      engagement: 88,
      hashtags: ['streetstyle', 'urbanfashion', 'cityphotography', 'streetphotography'],
      season: 'all',
    },
    {
      category: 'travel_landscape',
      poses: ['arms_stretched_wide', 'walking_uphill', 'looking_into_distance', 'jump_mid_air'],
      angles: ['low_angle', 'wide_angle'],
      framing: 'Wide cinematic — subject small in frame, environment dominant',
      engagement: 94,
      hashtags: ['travelphotography', 'landscape', 'wanderlust', 'naturephotography'],
      season: 'summer',
    },
    {
      category: 'couple_romantic',
      poses: ['whisper', 'dip_kiss', 'hand_hold_walk', 'back_hug', 'forehead_touch'],
      angles: ['eye_level', 'high_angle'],
      framing: 'Centered with negative space, candid emotion',
      engagement: 96,
      hashtags: ['couplegoals', 'romanticphotography', 'couplephotography', 'love'],
      season: 'all',
    },
    {
      category: 'beach_summer',
      poses: ['lying_on_ground', 'arms_wide', 'walking_step', 'candid_walk'],
      angles: ['eye_level', 'high_angle', 'bird_eye'],
      framing: 'Horizon on lower third, sky dominant, golden light',
      engagement: 90,
      hashtags: ['beachphotography', 'summervibes', 'beachlife', 'ocean'],
      season: 'summer',
    },
    {
      category: 'editorial_high_fashion',
      poses: ['confident_stand', 'looking_away', 'hand_in_pocket', 'crossed_arms'],
      angles: ['eye_level', 'low_angle', 'dutch_angle'],
      framing: 'Minimal — negative space, strong lines, subject off-center',
      engagement: 85,
      hashtags: ['editorial', 'highfashion', 'fashionphotography', 'editorialphotography'],
      season: 'all',
    },
    {
      category: 'sunset_silhouette',
      poses: ['looking_into_distance', 'arms_stretched_wide', 'kiss_silhouette', 'jump_mid_air'],
      angles: ['eye_level', 'low_angle'],
      framing: 'Subject centered, sun behind, exposed for sky',
      engagement: 93,
      hashtags: ['sunsetphotography', 'silhouette', 'sunsetlovers', 'goldenhour'],
      season: 'all',
    },
    {
      category: 'fitness_active',
      poses: ['jump_mid_air', 'crouching', 'walking_step', 'arms_out'],
      angles: ['low_angle', 'eye_level'],
      framing: 'Dynamic — tilted horizon, motion blur, action frozen',
      engagement: 82,
      hashtags: ['fitnessphotography', 'active', 'sportsphotography', 'motion'],
      season: 'all',
    },
    {
      category: 'rooftop_cityscape',
      poses: ['looking_into_distance', 'leaning_on_railing', 'looking_down', 'confident_stand'],
      angles: ['high_angle', 'eye_level'],
      framing: 'City skyline on lower third, subject on upper third, golden hour',
      engagement: 89,
      hashtags: ['rooftopphotography', 'cityscape', 'skyline', 'urbanexploration'],
      season: 'all',
    },
    {
      category: 'cafe_lifestyle',
      poses: ['sitting_crossed', 'confident_stand', 'candid_walk', 'looking_at_phone'],
      angles: ['eye_level', 'high_angle'],
      framing: 'Over-shoulder, shallow depth of field, warm tones',
      engagement: 84,
      hashtags: ['cafephotography', 'lifestylephotography', 'coffeeaesthetic', 'cafehop'],
      season: 'all',
    },
  ];

  getTrendsForScene(context: SceneContext): TrendData[] {
    const matched: TrendData[] = [];
    const timeOfDay = context.timeOfDay;

    for (const trend of this.trends) {
      let matchScore = 0;

      if (context.isGoldenHour && trend.category.includes('golden')) matchScore += 40;
      if (context.isBlueHour && trend.category.includes('sunset')) matchScore += 30;
      if (context.locationType.includes('beach') && trend.category.includes('beach')) matchScore += 40;
      if (context.locationType.includes('urban') && trend.category.includes('urban')) matchScore += 35;
      if (context.locationType.includes('landscape') && trend.category.includes('travel')) matchScore += 35;
      if (context.environmentMood.includes('dramatic') && trend.category.includes('editorial')) matchScore += 25;
      if (trend.season === 'all' || trend.season === this.getCurrentSeason()) matchScore += 10;

      if (matchScore > 20) {
        matched.push({
          category: trend.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          trendingPoses: trend.poses,
          popularAngles: trend.angles,
          recommendedFraming: trend.framing,
          engagement: trend.engagement,
          hashtags: trend.hashtags,
          season: trend.season,
        });
      }
    }

    return matched.slice(0, 3);
  }

  getTrendingStyles(): { style: StyleTab; engagement: number; description: string }[] {
    return [
      { style: 'Aesthetic', engagement: 94, description: 'Soft tones, pastels, dreamy quality' },
      { style: 'Cinematic', engagement: 91, description: 'Widescreen framing, moody grading' },
      { style: 'Natural', engagement: 88, description: 'Candid, unposed, authentic moments' },
      { style: 'Luxury', engagement: 86, description: 'High-end, polished, aspirational' },
      { style: 'Vintage', engagement: 83, description: 'Film grain, warm tones, retro feel' },
      { style: 'Minimal', engagement: 81, description: 'Clean lines, negative space, simple' },
    ];
  }

  private getCurrentSeason(): string {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return 'spring';
    if (month >= 5 && month <= 7) return 'summer';
    if (month >= 8 && month <= 10) return 'autumn';
    return 'winter';
  }
}

export const trendEngine = new SocialTrendEngine();
