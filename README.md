# CinePose — See the shot before you take it.

An AI-powered cinematic camera app with a 3D humanoid pose guide, real-time LUT color grading, smart lighting analysis, and drone shot simulation.

> **Web:** Astro 5 + React 19 + Three.js + Tailwind CSS 4  
> **Mobile:** React Native + Expo (separate repo)  
> **Backend:** Supabase Auth + Storage, Anthropic Claude API

## Features

- **Cinematic LUT Engine** — 15 DaVinci Resolve-quality presets with WebGL real-time preview
- **AI Humanoid Pose Robot** — 3D holographic figure that shows the perfect pose for any scene
- **Smart Lighting Analysis** — Real-time light metering, golden hour tracking, and actionable suggestions
- **Drone Shot Simulator** — Aerial framing guides and cinematic movement paths
- **Pro Color Studio** — Full DaVinci-style grading with .cube LUT export
- **Privacy First** — All AI runs on-device. No images uploaded without consent.

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/cinepose.git
cd cinepose

# Install dependencies
pnpm install

# Copy and configure environment
cp .env.example .env
# Edit .env with your Supabase and Claude API credentials

# Start development server
pnpm dev
```

### Build for Production

```bash
pnpm build
pnpm preview
```

## Project Structure

```
cinepose/
├── src/
│   ├── components/
│   │   ├── camera/         # Camera feed, controls, shutter
│   │   ├── lut/            # LUT engine, presets, picker
│   │   ├── pose/           # Humanoid robot, pose library, controls
│   │   ├── lighting/       # Lighting analysis engine
│   │   ├── drone/          # Drone guide overlay
│   │   ├── gallery/        # Photo gallery grid
│   │   ├── settings/       # Settings page
│   │   └── ui/             # GlassCard, BottomSheet, PillButton, Toast
│   ├── pages/
│   │   ├── index.astro     # Landing page
│   │   ├── camera.astro    # Main camera experience
│   │   ├── studio.astro    # Color grading studio
│   │   ├── poses.astro     # Pose library browser
│   │   ├── gallery.astro   # Photo gallery
│   │   ├── settings.astro  # App settings
│   │   ├── pose-detail/    # Individual pose guides (20 pages)
│   │   └── api/            # Serverless API routes
│   ├── stores/             # Zustand state management
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities, types, i18n
│   ├── i18n/               # English + Urdu translations
│   └── styles/             # Global CSS with Tailwind v4
├── public/                 # Static assets
└── dist/                   # Build output
```

## API Routes

| Route | Method | Description |
|---|---|---|
| `/api/scene-analyze` | POST | Analyze scene via Claude AI |
| `/api/pose-tips` | POST | Generate AI coaching tips |
| `/api/lut-export` | POST | Export .cube LUT files |

## Security

- **Zero-Trust Architecture** — All AI inference runs on-device via WebGL/TensorFlow.js
- **No Analytics SDK** — No telemetry by default, optional opt-in crash reports
- **CSP Headers** — Strict Content Security Policy
- **Supabase RLS** — Row Level Security on all database tables
- **Input Validation** — Zod schemas on all API routes
- **Rate Limiting** — 20 AI requests/hour/user via Upstash Redis (optional)

## Built With

- [Astro](https://astro.build) — Web framework
- [React](https://react.dev) — UI components
- [Three.js](https://threejs.org) — 3D humanoid robot
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) — React renderer for Three.js
- [Tailwind CSS v4](https://tailwindcss.com) — Styling
- [Zustand](https://github.com/pmndrs/zustand) — State management
- [Framer Motion](https://www.framer.com/motion/) — Animations
- [Supabase](https://supabase.com) — Auth, database, storage
- [Anthropic Claude](https://anthropic.com) — AI scene analysis

## License

MIT
