import type { AgentDefinition, AgentID } from './types';

export function createAgentDefinitions(): Map<AgentID, AgentDefinition> {
  const defs = new Map<AgentID, AgentDefinition>();

  defs.set('photographer', {
    id: 'photographer',
    name: 'Photographer AI',
    icon: '📸',
    color: '#A78BFA',
    work: {
      role: 'Composition & Framing Specialist',
      responsibilities: [
        'Analyze scene composition using rule of thirds, leading lines, and golden ratio',
        'Suggest optimal aperture, shutter speed, and ISO for current lighting',
        'Detect unwanted objects in frame and suggest reframing',
        'Provide real-time composition guidance for subject placement',
        'Recommend focal length and lens choice for desired aesthetic',
      ],
      tools: ['Pixel-level luminance analysis', 'Edge detection', 'Color histogram', 'Face/body bounding box'],
    },
    learn: {
      method: 'Supervised learning from curated photo datasets and user preference tracking',
      dataSources: ['User-rated composition feedback', 'Flickr/Instagram aesthetic benchmarks', 'Professional photography guides'],
      adaptation: 'Tunes composition weights based on which photos user keeps vs deletes',
      feedbackLoop: 'User rates each suggestion (thumbs up/down) → updates preference vector for future recommendations',
    },
    perform: {
      successMetrics: ['Composition score improvement', 'User acceptance rate of suggestions', 'Reduction in unwanted objects in frame'],
      evaluationCriteria: ['Speed: < 100ms per frame analysis', 'Accuracy: composition suggestions match photography best practices'],
      outputFormat: 'Structured JSON with scores, suggestions, and live guidance strings',
      latencyExpectation: 'Real-time (< 50ms for frame analysis, < 200ms for full scene analysis)',
    },
    memory: { shortTerm: [], longTerm: [] },
    isActive: true,
  });

  defs.set('cinematographer', {
    id: 'cinematographer',
    name: 'Cinematographer AI',
    icon: '🎬',
    color: '#6EE7B7',
    work: {
      role: 'Camera Movement & Shot Planning',
      responsibilities: [
        'Analyze scene motion and recommend camera movements (tracking, push-in, pull-out, orbit)',
        'Plan shot sequences for video content (Reels, Shorts, TikToks)',
        'Suggest subject blocking and movement within the frame',
        'Determine optimal shot duration and pacing',
        'Coordinate with Photographer AI for consistent visual language',
      ],
      tools: ['Optical flow analysis', 'Subject tracking', 'Gyroscope data', 'Scene depth estimation'],
    },
    learn: {
      method: 'Reinforcement learning from video engagement metrics and professional cinematography rules',
      dataSources: ['Instagram Reels / YouTube Shorts engagement data', 'Film grammar textbooks (digitalized rules)', 'User video retention analytics'],
      adaptation: 'Learns which shot types get the most replays/saves and prioritizes those patterns',
      feedbackLoop: 'Video completion rate → adjusts shot duration and pacing → retrains movement preference model',
    },
    perform: {
      successMetrics: ['Shot suggestion adoption rate', 'Video engagement prediction accuracy', 'Motion smoothness score'],
      evaluationCriteria: ['Planning: < 300ms for shot sequence generation', 'Quality: suggestions match film school standards'],
      outputFormat: 'Sequence of shot plans with camera movement, duration, and expected result',
      latencyExpectation: 'Near real-time (< 500ms for shot sequence planning)',
    },
    memory: { shortTerm: [], longTerm: [] },
    isActive: true,
  });

  defs.set('outfit_analyst', {
    id: 'outfit_analyst',
    name: 'Outfit Analyst',
    icon: '👔',
    color: '#F472B6',
    work: {
      role: 'Style & Color Matching Specialist',
      responsibilities: [
        'Analyze current outfit colors and match to background/environment',
        'Recommend color palettes that complement scene lighting',
        'Suggest accessories and footwear based on location type',
        'Detect color clashes between outfit and background',
        'Provide style category classification (casual, formal, streetwear, luxury)',
      ],
      tools: ['Color extraction from video frame', 'HSV/HSL color space analysis', 'Fashion attribute classifier', 'Texture detection'],
    },
    learn: {
      method: 'Transfer learning from fashion datasets with user style preference fine-tuning',
      dataSources: ['DeepFashion dataset (800K clothing images)', 'User outfit history and ratings', 'Seasonal trend databases'],
      adaptation: 'Learns user color palette preferences over time (e.g., avoids recommending red if user never picks it)',
      feedbackLoop: 'Outfit rating → updates color compatibility matrix → refines recommendations per location type',
    },
    perform: {
      successMetrics: ['Color harmony score improvement', 'User acceptance rate', 'Outfit-scene compatibility score'],
      evaluationCriteria: ['Analysis: < 150ms per frame', 'Recommendation diversity: no repeated suggestions within session'],
      outputFormat: 'Color palette, recommended outfit items, accessories, and match score',
      latencyExpectation: 'Real-time (< 100ms for color analysis)',
    },
    memory: { shortTerm: [], longTerm: [] },
    isActive: true,
  });

  defs.set('location_intel', {
    id: 'location_intel',
    name: 'Location Intelligence',
    icon: '📍',
    color: '#22D3EE',
    work: {
      role: 'Scene Recognition & Scouting',
      responsibilities: [
        'Classify location type from visual cues (urban, nature, beach, indoor, etc.)',
        'Score location for cinematic, Instagram, travel, romantic, luxury potential',
        'Detect best time-of-day to shoot based on lighting analysis',
        'Identify foreground/background elements suitable for composition',
        'Provide location-specific tips (e.g., "use wide lens for mountain landscape")',
      ],
      tools: ['Scene classification heuristics', 'Luminance gradient analysis', 'Color temperature profiling', 'Geolocation (if available)'],
    },
    learn: {
      method: 'Scene classification from Places365 dataset with geotagged social media fine-tuning',
      dataSources: ['Places365 scene database', 'Instagram geotagged photo metadata', 'User-visited location history'],
      adaptation: 'Builds personal map of preferred location types and times',
      feedbackLoop: 'Location score vs actual photo quality → adjusts scoring weights for each location type',
    },
    perform: {
      successMetrics: ['Location classification accuracy', 'Score correlation with photo engagement', 'Tip usefulness rating'],
      evaluationCriteria: ['Classification: < 200ms', 'Score range: 0-100 with meaningful differentiation'],
      outputFormat: 'Location type, multi-dimensional scores, weather/time recommendations, tips',
      latencyExpectation: '< 200ms per scene analysis',
    },
    memory: { shortTerm: [], longTerm: [] },
    isActive: true,
  });

  defs.set('director_vision', {
    id: 'director_vision',
    name: 'Director Vision',
    icon: '🎯',
    color: '#FB923C',
    work: {
      role: 'Storytelling & Visual Theme Direction',
      responsibilities: [
        'Analyze scene for storytelling potential (what story does this location tell?)',
        'Suggest visual themes (adventure, romance, luxury, mystery, etc.)',
        'Identify foreground elements, background layers, and depth composition',
        'Recommend color palettes that reinforce the narrative mood',
        'Coordinate with Hollywood Director for scene-specific shot planning',
      ],
      tools: ['Scene context embedding', 'Color psychology mapping', 'Depth layer estimation', 'Narrative archetype matching'],
    },
    learn: {
      method: 'Story type classification from movie scripts and visual theme datasets',
      dataSources: ['Movie script databases', 'Cinematic color grading references', 'User story preference history'],
      adaptation: 'Learns which narrative styles resonate with user based on saved photos and session engagement',
      feedbackLoop: 'Theme acceptance → refines narrative archetype weighting → personalizes story suggestions',
    },
    perform: {
      successMetrics: ['Story suggestion relevance score', 'Theme consistency across sessions', 'User engagement with suggestions'],
      evaluationCriteria: ['Analysis: < 300ms', 'Theme diversity: suggests from at least 5 different archetypes'],
      outputFormat: 'Story type, thematic elements, color palette, depth analysis, atmosphere description',
      latencyExpectation: '< 300ms for full scene analysis',
    },
    memory: { shortTerm: [], longTerm: [] },
    isActive: true,
  });

  defs.set('hollywood_director', {
    id: 'hollywood_director',
    name: 'Hollywood Director Engine',
    icon: '🌟',
    color: '#F59E0B',
    work: {
      role: 'Cinematic Scene Direction & Blocking',
      responsibilities: [
        'Generate step-by-step actor blocking for cinematic scenes',
        'Suggest camera positions, movement directions, and subject positioning',
        'Provide facial expression and hand position guidance for emotional impact',
        'Plan walking speed and timing for dramatic effect',
        'Coordinate shot sequences for narrative coherence',
      ],
      tools: ['Scene type template library (14 archetypes)', 'Blocking choreography engine', 'Emotional beat mapping'],
    },
    learn: {
      method: 'Knowledge-base learning from film scripts, shot logs, and directing textbooks',
      dataSources: ['Hollywood film script databases', 'Director interview transcripts (blocking techniques)', 'User scene type usage patterns'],
      adaptation: 'Learns which scene archetypes user prefers for each location type',
      feedbackLoop: 'Direction adherence rate → adjusts complexity and detail level of instructions',
    },
    perform: {
      successMetrics: ['Instruction clarity score', 'User completion rate of directions', 'Scene type match accuracy'],
      evaluationCriteria: ['Generation: < 500ms', 'Step count: 3-8 actionable steps per scene'],
      outputFormat: 'Scene type, camera/subject positions, direction steps with timing',
      latencyExpectation: '< 500ms for full direction generation',
    },
    memory: { shortTerm: [], longTerm: [] },
    isActive: true,
  });

  defs.set('cinegpt', {
    id: 'cinegpt',
    name: 'CineGPT',
    icon: '💬',
    color: '#34D399',
    work: {
      role: 'Conversational Creative Director',
      responsibilities: [
        'Answer photography and cinematography questions in natural language',
        'Provide narrative and script suggestions for video content',
        'Explain technical concepts (aperture, focal length, composition rules)',
        'Generate creative prompts for photo/video shoots',
        'Maintain conversation context across multiple exchanges',
      ],
      tools: ['LLM prompt templates (7 knowledge categories)', 'RAG retrieval from cinematography knowledge base', 'Conversation state tracking'],
    },
    learn: {
      method: 'Few-shot learning from curated Q&A pairs and user conversation history',
      dataSources: ['Photography FAQ databases', 'Cinematography textbook excerpts', 'User chat history and ratings'],
      adaptation: 'Learns user terminology preferences and knowledge level over time',
      feedbackLoop: 'Answer helpfulness rating → adjusts response detail level and tone → personalizes explanations',
    },
    perform: {
      successMetrics: ['Answer relevance score', 'User satisfaction rating', 'Conversation continuation rate'],
      evaluationCriteria: ['Response: < 2s for LLM generation', 'Accuracy: answers match established photography knowledge'],
      outputFormat: 'Natural language answer with optional structured suggestions',
      latencyExpectation: '< 2s for conversational responses',
    },
    memory: { shortTerm: [], longTerm: [] },
    isActive: true,
  });

  defs.set('reel_generator', {
    id: 'reel_generator',
    name: 'Reel Generator',
    icon: '🎞️',
    color: '#EC4899',
    work: {
      role: 'Video Editing & Reel Planning',
      responsibilities: [
        'Plan shot sequences optimized for social media platforms (Reels, Shorts, TikTok)',
        'Suggest music genres and tracks that match scene mood',
        'Recommend video transitions between clips',
        'Propose text overlay styles and placement',
        'Select color grading preset for consistent visual tone across the reel',
        'Estimate engagement potential and suggest optimization tweaks',
      ],
      tools: ['Scene mood detection', 'Music genre matching engine', 'Transition library (20+ types)', 'Engagement prediction model'],
    },
    learn: {
      method: 'Pattern learning from viral reel analysis and user platform preference tracking',
      dataSources: ['Viral Instagram Reels / TikTok dataset', 'Music-tempo beat mapping database', 'User platform preference (which format they use most)'],
      adaptation: 'Learns which reel formats get the most saves/shares and prioritizes those patterns',
      feedbackLoop: 'Reel engagement metrics → adjusts shot pacing, transition density, and music selection → retrains platform-specific optimizer',
    },
    perform: {
      successMetrics: ['Estimated engagement score accuracy', 'Shot sequence coherence', 'Music-scene mood alignment'],
      evaluationCriteria: ['Planning: < 1s for full reel plan', 'Format: supports 5 platform formats'],
      outputFormat: 'Shot sequence, music suggestions, transitions, overlays, color grade, duration, platform format',
      latencyExpectation: '< 1s for complete reel generation',
    },
    memory: { shortTerm: [], longTerm: [] },
    isActive: true,
  });

  defs.set('mood_detector', {
    id: 'mood_detector',
    name: 'Mood Detector',
    icon: '😊',
    color: '#86EFAC',
    work: {
      role: 'Emotion & Expression Recognition',
      responsibilities: [
        'Analyze facial expressions and body language from video feed',
        'Classify primary and secondary moods (confident, relaxed, energetic, mysterious, etc.)',
        'Suggest pose adaptations based on detected mood',
        'Provide direction adjustments (e.g., "ask subject to relax shoulders" if tension detected)',
        'Track mood changes across a session for storytelling arc',
      ],
      tools: ['Luminance/Temperature mood heuristics', 'Pose tension analysis', 'Expression classifiers', 'Body symmetry detection'],
    },
    learn: {
      method: 'Emotion classification from FER+ dataset with body language augmentation',
      dataSources: ['FER+ facial expression dataset', 'Body posture mood mapping', 'User mood feedback corrections'],
      adaptation: 'Calibrates mood detection to user\'s natural expression baseline over time',
      feedbackLoop: 'Mood accuracy feedback → adjusts classification thresholds → personalizes expression mapping',
    },
    perform: {
      successMetrics: ['Mood classification accuracy', 'Adaptation suggestion relevance', 'User correction rate'],
      evaluationCriteria: ['Detection: < 100ms', 'Mood classes: supports 18 mood types with confidence scores'],
      outputFormat: 'Primary mood, secondary moods, confidence, expression description, adaptive suggestions',
      latencyExpectation: 'Real-time (< 100ms per frame)',
    },
    memory: { shortTerm: [], longTerm: [] },
    isActive: true,
  });

  defs.set('pose_projector', {
    id: 'pose_projector',
    name: 'AR Pose Projector',
    icon: '👻',
    color: '#06B6D4',
    work: {
      role: 'Real-time Pose Overlay & Guidance',
      responsibilities: [
        'Overlay 3D skeleton guide onto live camera view for pose matching',
        'Calculate joint angle differences between target pose and user pose',
        'Provide real-time correction feedback (e.g., "raise left arm 15 degrees")',
        'Support both front and back camera modes with mirrored guidance',
        'Sync with ARCore/ARKit for device-relative positioning',
      ],
      tools: ['3D joint position interpolation', 'Angle difference calculation', 'AR framework integration', 'Real-time skeleton rendering'],
    },
    learn: {
      method: 'Pose alignment learning from user correction history and pose database matching',
      dataSources: ['60+ pose joint position database', 'User correction feedback', 'Pose completion rate tracking'],
      adaptation: 'Learns which poses the user finds difficult and provides more detailed guidance',
      feedbackLoop: 'Pose match accuracy → adjusts guidance verbosity and visual feedback style → personalizes difficulty curve',
    },
    perform: {
      successMetrics: ['Pose match accuracy', 'User correction speed', 'Guidance clarity rating'],
      evaluationCriteria: ['Overlay: < 16ms (60fps)', 'Joint accuracy: < 5 degree error margin'],
      outputFormat: '3D skeleton overlay, joint angle targets, real-time correction instructions',
      latencyExpectation: 'Real-time at 60fps (< 16ms per frame)',
    },
    memory: { shortTerm: [], longTerm: [] },
    isActive: true,
  });

  defs.set('human_clone', {
    id: 'human_clone',
    name: 'Human Clone',
    icon: '🧬',
    color: '#A78BFA',
    work: {
      role: '3D Avatar & Virtual Try-On',
      responsibilities: [
        'Generate 3D avatar preview of user for pose visualization',
        'Enable virtual outfit try-on by mapping clothing to avatar',
        'Preview poses in 3D before attempting them in real life',
        'Support gender-specific avatar models and body types',
        'Render avatar with correct lighting and environment matching',
      ],
      tools: ['Three.js parametric body model', 'Joint-to-avatar mapping', 'Texture/outfit projection', 'Gender-specific model selection'],
    },
    learn: {
      method: 'Avatar customization learning from user body measurements and outfit preferences',
      dataSources: ['User body proportion estimates from camera', 'Outfit-to-avatar texture mapping', 'Pose-to-animation motion graphs'],
      adaptation: 'Refines avatar body proportions as more camera data is captured',
      feedbackLoop: 'Avatar realism rating → adjusts body model parameters → improves proportion accuracy',
    },
    perform: {
      successMetrics: ['Avatar pose accuracy', 'Outfit mapping quality', 'Render performance (fps)'],
      evaluationCriteria: ['Render: < 16ms at 60fps on mobile', 'Pose accuracy: matches joint positions within 5% error'],
      outputFormat: 'Three.js 3D scene with avatar, pose animation, and optional outfit texture',
      latencyExpectation: 'Real-time at 60fps (< 16ms per frame)',
    },
    memory: { shortTerm: [], longTerm: [] },
    isActive: true,
  });

  defs.set('scene_analyzer', {
    id: 'scene_analyzer',
    name: 'Scene Analyzer (Master Scene)',
    icon: '🔬',
    color: '#F59E0B',
    work: {
      role: 'Comprehensive Scene Understanding & Fusion',
      responsibilities: [
        'Fuse outputs from all other agents into a unified scene analysis',
        'Provide holistic recommendation (best pose + angle + lens + color grade + LUT + story concept)',
        'Detect scene-specific opportunities (golden hour, backlit silhouettes, leading lines)',
        'Coordinate agent priorities based on current scene context',
        'Generate overall recommendation string for the user',
      ],
      tools: ['Multi-agent output fusion', 'Priority ranking algorithm', 'Scene archetype templates', 'Recommendation scoring'],
    },
    learn: {
      method: 'Ensemble learning from all agent feedback and holistic user session outcomes',
      dataSources: ['All agent performance metrics', 'Session-level outcomes (photos/videos created)', 'User session satisfaction ratings'],
      adaptation: 'Adjusts agent priority weights based on which agents contribute most to accepted recommendations',
      feedbackLoop: 'Overall recommendation acceptance → adjusts fusion weights → optimizes multi-agent coordination',
    },
    perform: {
      successMetrics: ['Recommendation acceptance rate', 'Multi-agent coherence', 'Session-to-session improvement'],
      evaluationCriteria: ['Fusion: < 400ms for full analysis', 'Coverage: incorporates signals from all 12 agents'],
      outputFormat: 'Structured JSON with fused recommendation, top choices, and overall advice',
      latencyExpectation: '< 400ms for full fused analysis',
    },
    memory: { shortTerm: [], longTerm: [] },
    isActive: true,
  });

  return defs;
}

export const agentDefinitions = createAgentDefinitions();
