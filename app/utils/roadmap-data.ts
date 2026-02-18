export type Difficulty = 'easy' | 'medium' | 'hard'

export interface RoadmapTask {
  id: string
  skill: string
  description: string
  difficulty: Difficulty
  aiAssisted: boolean
}

export interface RoadmapPhase {
  id: string
  title: string
  description: string
  tasks: RoadmapTask[]
}

export const DIFFICULTY_CONFIG: Record<Difficulty, { label: string, color: 'success' | 'warning' | 'error' }> = {
  easy: { label: 'Easy', color: 'success' },
  medium: { label: 'Medium', color: 'warning' },
  hard: { label: 'Hard', color: 'error' }
}

export const ROADMAP_PHASES: RoadmapPhase[] = [
  {
    id: 'phase-1',
    title: 'Phase 1: Foundation — Testing & Validation',
    description: 'Every later phase depends on verification and validation. These are the most AI-assistable skills.',
    tasks: [
      {
        id: '1a',
        skill: 'Unit & Integration Tests (Vitest)',
        description: 'Install Vitest + test-utils. Write unit tests for composables (useBricks, useCVBuilder, useChat, useCarPhysics2D), utility functions (brick-types.ts), and integration tests for API routes.',
        difficulty: 'medium',
        aiAssisted: true
      },
      {
        id: '1b',
        skill: 'E2E Tests (Playwright)',
        description: 'Install Playwright. Write E2E flows: create experience brick, build CV with brick selection, save & share CV and visit public link.',
        difficulty: 'medium',
        aiAssisted: true
      },
      {
        id: '1c',
        skill: 'Zod Validation',
        description: 'Install Zod. Create schemas matching brick-types.ts interfaces. Wire into server routes (replace ad-hoc checks) and frontend forms. Add SettingsSchema for email/URL/phone validation. Validate chat/analyze endpoint: bricks array schema and jobDescription length limit.',
        difficulty: 'easy',
        aiAssisted: true
      }
    ]
  },
  {
    id: 'phase-2',
    title: 'Phase 2: Security & Access Control',
    description: 'Add authentication, harden security, and expand CI/CD. Depends on Phase 1 (validated inputs, tests in CI).',
    tasks: [
      {
        id: '2a',
        skill: 'Authentication (GitHub OAuth)',
        description: 'Install nuxt-auth-utils. Add users table, userId FK to bricks/cvs/settings. GitHub OAuth flow, session middleware on API routes, login/logout UI. Public CV route stays open.',
        difficulty: 'hard',
        aiAssisted: true
      },
      {
        id: '2b',
        skill: 'Security Hardening',
        description: 'Add security headers (CSP, HSTS, X-Frame-Options). Rate limit chat endpoint (10 req/min). Add AI prompt token budget (cap bricks context size). Sanitize markdown with DOMPurify. Ensure Zod validation on every server endpoint.',
        difficulty: 'hard',
        aiAssisted: false
      },
      {
        id: '2c',
        skill: 'CI/CD Pipeline Expansion',
        description: 'Expand GitHub Actions: add Vitest, Playwright E2E, build step, preview deploys for PRs, production deploy on master push.',
        difficulty: 'medium',
        aiAssisted: true
      }
    ]
  },
  {
    id: 'phase-3',
    title: 'Phase 3: Accessibility & Internationalization',
    description: 'Make the app accessible and multilingual. Validation errors must be accessible and translatable.',
    tasks: [
      {
        id: '3a',
        skill: 'Accessibility (WCAG 2.2)',
        description: 'Install axe-core/playwright. Add a11y assertions to E2E tests. Fix forms (aria attributes, role=alert), canvas labels, chat aria-live, keyboard nav on BrickCard, focus trap in modals.',
        difficulty: 'medium',
        aiAssisted: true
      },
      {
        id: '3b',
        skill: 'Internationalization (i18n)',
        description: 'Install @nuxtjs/i18n. Extract strings into en.json + es.json. Add language switcher in header. Store locale in settings. Update AI chat to respond in user\'s language.',
        difficulty: 'easy',
        aiAssisted: true
      }
    ]
  },
  {
    id: 'phase-4',
    title: 'Phase 4: Performance, Visualization & Drag-and-Drop',
    description: 'Optimize performance, add data visualizations, and enable drag-and-drop reordering.',
    tasks: [
      {
        id: '4a',
        skill: 'Performance Optimization',
        description: 'Lazy-load PixiJS, server-side caching for public CV routes, batch PixiJS textures. Target Lighthouse 90+ on all pages.',
        difficulty: 'medium',
        aiAssisted: false
      },
      {
        id: '4b',
        skill: 'Data Visualization — Skills Dashboard',
        description: 'Install chart.js + vue-chartjs. New /dashboard page with radar chart (skill proficiency), timeline (experience), donut (brick distribution), bar (tech frequency).',
        difficulty: 'medium',
        aiAssisted: true
      },
      {
        id: '4c',
        skill: 'Drag & Drop Brick Reordering',
        description: 'Install vuedraggable. Draggable selected-bricks list in builder. Real-time preview update on reorder. Save sort order via existing sortOrder field.',
        difficulty: 'easy',
        aiAssisted: true
      }
    ]
  },
  {
    id: 'phase-5',
    title: 'Phase 5: Real-Time, Observability & PWA',
    description: 'Add real-time sync, structured logging, and offline support.',
    tasks: [
      {
        id: '5a',
        skill: 'Real-Time Sync (SSE)',
        description: 'SSE endpoint for brick changes. Broadcast to other tabs/sessions. useRealtimeSync composable with EventSource. Live viewer count on public CV pages.',
        difficulty: 'hard',
        aiAssisted: false
      },
      {
        id: '5b',
        skill: 'Observability & Error Tracking',
        description: 'Structured logging middleware (method, path, duration, userId). Vue error boundary for PixiJS. Error logs table + admin page. Optional Sentry integration.',
        difficulty: 'medium',
        aiAssisted: true
      },
      {
        id: '5c',
        skill: 'PWA & Offline Mode',
        description: 'Install @vite-pwa/nuxt. Service worker caching strategies. IndexedDB offline cache for bricks. Offline edit queue with sync on reconnect. Install prompt banner.',
        difficulty: 'hard',
        aiAssisted: false
      }
    ]
  },
  {
    id: 'phase-6',
    title: 'Phase 6: AI Hardening, Advanced AI & Docker',
    description: 'Harden the AI chat pipeline, add RAG-powered CV assistance, and containerize the app. Leverages all previous phases.',
    tasks: [
      {
        id: '6a',
        skill: 'AI SDK Migration & Chat Hardening',
        description: 'Migrate chat/analyze endpoint from raw fetch() to Vercel AI SDK (ai, @ai-sdk/anthropic — already installed). Render AI responses as markdown using render-markdown.ts. Fix brick ID validation in extractBrickIds(). Clear stale results on job description change. Remove duplicate result display during loading. Correct default provider to match docs.',
        difficulty: 'medium',
        aiAssisted: true
      },
      {
        id: '6b',
        skill: 'RAG-Powered CV Assistant',
        description: 'Embedding pipeline on brick create/update. Vector search endpoint: embed job description, find top-K bricks. Upgrade chat to use retrieved bricks. "Smart Match Score" in builder.',
        difficulty: 'hard',
        aiAssisted: true
      },
      {
        id: '6c',
        skill: 'Docker Containerization',
        description: 'Multi-stage Dockerfile (build + slim runtime). docker-compose.yml with SQLite volume. .dockerignore. Optional GitHub Actions to build/push image on release.',
        difficulty: 'medium',
        aiAssisted: true
      }
    ]
  }
]

export function getTotalTasks(): number {
  return ROADMAP_PHASES.reduce((sum, phase) => sum + phase.tasks.length, 0)
}

export function getPhaseTaskIds(phase: RoadmapPhase): string[] {
  return phase.tasks.map(t => t.id)
}
