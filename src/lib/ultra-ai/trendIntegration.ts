import type { TrendSource } from './types';

const INSTAGRAM_TRENDS: TrendSource[] = [
  {
    platform: 'instagram',
    trendName: 'Golden Hour Glow',
    engagement: 94,
    hashtags: ['#goldenhour', '#sunsetphotography', '#goldenlight', '#magiclight', '#golden_hour_photography'],
    season: 'year-round',
    styleTags: ['warm', 'cinematic', 'romantic', 'natural'],
    poseCategories: ['portrait', 'silhouette', 'nature', 'travel'],
    colorPalettes: ['warm gold', 'amber', 'deep teal', 'soft orange', 'cream'],
    sampleUrls: [],
  },
  {
    platform: 'instagram',
    trendName: 'Car Self Portrait',
    engagement: 91,
    hashtags: ['#carseatphoto', '#carphotography', '#driverseat', '#carpics', '#carselfie'],
    season: 'year-round',
    styleTags: ['urban', 'lifestyle', 'cool', 'street'],
    poseCategories: ['portrait', 'lifestyle', 'fashion', 'street'],
    colorPalettes: ['neutral', 'black', 'warm', 'earth tones'],
    sampleUrls: [],
  },
  {
    platform: 'instagram',
    trendName: 'Rooftop Cinema',
    engagement: 89,
    hashtags: ['#rooftopphotography', '#rooftopviews', '#cityscape', '#sunsetrooftop', '#skylineview'],
    season: 'spring,summer,fall',
    styleTags: ['cinematic', 'luxury', 'urban', 'dramatic'],
    poseCategories: ['portrait', 'fashion', 'lifestyle', 'cinematic_hero'],
    colorPalettes: ['warm', 'gold', 'navy', 'twilight blue'],
    sampleUrls: [],
  },
  {
    platform: 'instagram',
    trendName: 'Candid Walking',
    engagement: 92,
    hashtags: ['#candidwalking', '#streetstylephotography', '#candidstreet', '#walkingphotography', '#streetstyle'],
    season: 'year-round',
    styleTags: ['street', 'candid', 'fashion', 'urban'],
    poseCategories: ['street', 'fashion', 'candid', 'travel'],
    colorPalettes: ['urban neutral', 'contrast', 'monochrome'],
    sampleUrls: [],
  },
  {
    platform: 'instagram',
    trendName: 'Mirror Self Portrait',
    engagement: 87,
    hashtags: ['#mirrorphoto', '#mirrorselfie', '#bathroommirror', '#mirrorpic', '#mirrorgram'],
    season: 'year-round',
    styleTags: ['lifestyle', 'candid', 'fashion', 'minimal'],
    poseCategories: ['portrait', 'fashion', 'lifestyle'],
    colorPalettes: ['neutral', 'black', 'white'],
    sampleUrls: [],
  },
];

const PINTEREST_TRENDS: TrendSource[] = [
  {
    platform: 'pinterest',
    trendName: 'Coastal Grandmother',
    engagement: 96,
    hashtags: ['#coastalgrandmother', '#coastalstyle', '#beachhouse', '#nauticalstyle', '#coastalvibes'],
    season: 'spring,summer',
    styleTags: ['aesthetic', 'vintage', 'natural', 'soft'],
    poseCategories: ['portrait', 'nature', 'lifestyle', 'travel'],
    colorPalettes: ['white', 'cream', 'navy', 'striped blue', 'sand'],
    sampleUrls: [],
  },
  {
    platform: 'pinterest',
    trendName: 'Quiet Luxury',
    engagement: 95,
    hashtags: ['#quietluxury', '#oldmoneyaesthetic', '#stealthwealth', '#quietluxurystyle', '#oldmoneyoutfit'],
    season: 'year-round',
    styleTags: ['luxury', 'minimal', 'elegant', 'professional'],
    poseCategories: ['portrait', 'fashion', 'business_professional', 'lifestyle'],
    colorPalettes: ['black', 'white', 'cream', 'navy', 'beige'],
    sampleUrls: [],
  },
  {
    platform: 'pinterest',
    trendName: 'Dark Feminine / Dark Academia',
    engagement: 93,
    hashtags: ['#darkacademia', '#darkfeminine', '#gothicstyle', '#darkaesthetic', '#moodygrams'],
    season: 'fall,winter',
    styleTags: ['moody', 'dark', 'vintage', 'cinematic'],
    poseCategories: ['editorial_magazine', 'fashion', 'portrait', 'cinematic_hero'],
    colorPalettes: ['black', 'burgundy', 'forest green', 'brown', 'cream'],
    sampleUrls: [],
  },
  {
    platform: 'pinterest',
    trendName: 'Van Life / Travel Aesthetic',
    engagement: 91,
    hashtags: ['#vanlife', '#homeiswhereyouparkit', '#vanlifediaries', '#nomadlife', '#travelaesthetic'],
    season: 'spring,summer,fall',
    styleTags: ['travel', 'adventure', 'natural', 'lifestyle'],
    poseCategories: ['travel', 'nature', 'lifestyle', 'adventure'],
    colorPalettes: ['earth tones', 'warm neutrals', 'sage green', 'terracotta'],
    sampleUrls: [],
  },
  {
    platform: 'pinterest',
    trendName: 'Boujee On A Budget',
    engagement: 90,
    hashtags: ['#boujeeonabudget', '#luxuryforless', '#highclass', '#looksluxury', '#affordableluxury'],
    season: 'year-round',
    styleTags: ['luxury', 'fashion', 'lifestyle', 'elegant'],
    poseCategories: ['luxury', 'fashion', 'lifestyle', 'portrait'],
    colorPalettes: ['gold', 'black', 'white', 'champagne', 'blush'],
    sampleUrls: [],
  },
];

export class TrendIntegrationEngine {
  getAllTrends(): TrendSource[] {
    return [...INSTAGRAM_TRENDS, ...PINTEREST_TRENDS];
  }

  getTrendsBySeason(season: string): TrendSource[] {
    return this.getAllTrends().filter(t => t.season.includes(season) || t.season === 'year-round');
  }

  getTrendsByStyle(styleTags: string[]): TrendSource[] {
    return this.getAllTrends().filter(t =>
      t.styleTags.some(tag => styleTags.includes(tag))
    );
  }

  getTopTrends(count: number = 5): TrendSource[] {
    return this.getAllTrends()
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, count);
  }

  getHashtagsForTrends(trends: string[]): string[] {
    const allTags = new Set<string>();
    this.getAllTrends()
      .filter(t => trends.includes(t.trendName))
      .forEach(t => t.hashtags.forEach(h => allTags.add(h)));
    return Array.from(allTags);
  }

  suggestPoseFromTrends(location: string, season: string): { pose: string; trend: string; hashtags: string[] } | null {
    const trends = this.getTrendsBySeason(season).sort((a, b) => b.engagement - a.engagement);
    if (trends.length === 0) return null;

    const topTrend = trends[0];
    const poseExamples: Record<string, string> = {
      'Golden Hour Glow': 'Face the sunset at 45°, let the warm light hit your face. Soft gaze, natural smile.',
      'Coastal Grandmother': 'Stand by the shore in linen, holding a straw hat. Look out at the ocean peacefully.',
      'Quiet Luxury': 'Stand tall in neutral tones, one hand in pocket, confident but understated expression.',
      'Dark Feminine / Dark Academia': 'Sit among books or in a library, looking down at a page. Moody, contemplative.',
      'Van Life / Travel Aesthetic': 'Lean against your vehicle, map in hand, looking at the open road ahead.',
      'Car Self Portrait': 'In driver seat, hand on steering wheel, looking casually at camera or out the window.',
      'Rooftop Cinema': 'Stand at rooftop edge, city behind you, wind blowing through your hair.',
      'Candid Walking': 'Walk naturally, don\'t look at the camera. Look at shop windows or straight ahead.',
      'Mirror Self Portrait': 'Hold phone covering one eye, natural expression, relaxed posture.',
      'Boujee On A Budget': 'In a nice cafe or hotel lobby, holding a coffee, looking effortlessly elegant.',
    };

    return {
      pose: poseExamples[topTrend.trendName] || 'Stand naturally with relaxed confidence and a genuine expression.',
      trend: topTrend.trendName,
      hashtags: topTrend.hashtags.slice(0, 5),
    };
  }
}

export const trendIntegration = new TrendIntegrationEngine();
