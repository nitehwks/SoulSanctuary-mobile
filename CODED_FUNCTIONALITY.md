# SoulSanctuary - Coded Functionality Summary

**Project**: SoulSanctuary v2.0 - AI-Powered Mental Health Companion  
**Date**: March 14, 2026  
**Status**: Core functionality implemented, stubs identified for completion

---

## 1. Architecture Overview

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + Custom Theme |
| State Management | React Context + Hooks |
| Mobile | Capacitor 6 (iOS/Android) |
| Backend | Express.js + TypeScript |
| Database | PostgreSQL (Neon) + Drizzle ORM |
| Auth | Clerk |
| AI | OpenRouter (Claude 3.5 Sonnet) |
| Icons | Lucide React |
| Charts | Recharts |

### Project Structure
```
soulsanctuary/
├── src/                    # Frontend source
│   ├── components/         # Reusable UI components
│   ├── context/           # React contexts (Auth, Sanctuary, Layout)
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   ├── services/          # API and utility services
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── server/                # Backend source
│   ├── db/               # Database schema and connection
│   ├── middleware/       # Express middleware
│   ├── routes/           # API route handlers
│   └── services/         # Business logic services (empty - stubs)
├── ios/                  # iOS native project
├── android/              # Android native project
└── dist/                 # Build output
```

---

## 2. Authentication System (Clerk)

### Implemented Features
- ✅ Email/password authentication
- ✅ OAuth (Google, Apple, GitHub) via Clerk
- ✅ Session management with JWT
- ✅ User profile management
- ✅ Sign out functionality
- ✅ Auth state persistence across app restarts

### Files
- `src/main.tsx` - ClerkProvider with custom dark theme
- `src/App.tsx` - Auth state routing
- `src/pages/auth/Auth.tsx` - SignIn/SignUp components
- `src/context/AuthContext.tsx` - User state sync
- `src/components/layout/NavBar.tsx` - UserButton integration
- `src/pages/profile/Profile.tsx` - Profile display & logout
- `server/middleware/auth.ts` - Clerk token verification

### Clerk Theme Customization
Dark theme matching app design with:
- Custom card styling (semi-transparent, rounded)
- Sancturary glow color (#e94560) for primary actions
- Dark input fields matching app background
- Proper text colors for readability

---

## 3. Database Schema (Drizzle ORM)

### Tables Implemented

#### users
```typescript
- id: uuid (primary key)
- clerkId: varchar (unique, from Clerk)
- email: varchar
- name: varchar (nullable)
- createdAt: timestamp
- preferences: jsonb (default: {})
```

#### moods
```typescript
- id: uuid (primary key)
- userId: uuid (foreign key → users.id)
- mood: integer (1-5 scale)
- emotions: jsonb (array of emotion strings)
- note: text (nullable)
- context: text (nullable)
- aiInsights: text (AI-generated insights)
- timestamp: timestamp
```

#### goals
```typescript
- id: uuid (primary key)
- userId: uuid (foreign key)
- title: varchar
- description: text (nullable)
- category: varchar
- status: varchar (default: 'active')
- progress: integer (default: 0)
- targetDate: timestamp (nullable)
- aiCoaching: text (AI coaching tips)
- createdAt: timestamp
```

#### milestones
```typescript
- id: uuid (primary key)
- goalId: uuid (foreign key → goals.id)
- title: varchar
- completed: boolean (default: false)
- completedAt: timestamp (nullable)
```

#### memories
```typescript
- id: uuid (primary key)
- userId: uuid (foreign key)
- type: varchar ('note', 'event', 'milestone')
- content: text
- relatedNodes: jsonb (array of related memory IDs)
- sentiment: integer (default: 0, -1 to 1)
- encrypted: boolean (default: true)
- timestamp: timestamp
```

#### crisis_events
```typescript
- id: uuid (primary key)
- userId: uuid (foreign key)
- severity: varchar ('low', 'medium', 'high', 'critical')
- trigger: text
- response: text
- resourcesAccessed: jsonb (array)
- resolved: boolean (default: false)
- timestamp: timestamp
```

### Schema File
- `server/db/schema.ts` - All table definitions
- `server/db/index.ts` - Database connection using Neon serverless

---

## 4. API Routes (Express)

### Protected Routes (Require Auth)
All routes use Clerk JWT verification middleware.

#### Moods (`/api/moods`)
```typescript
GET /           # Get user's mood history (last 50)
POST /          # Create new mood entry
```

#### Goals (`/api/goals`)
```typescript
GET /                    # Get user's goals with milestones
POST /                   # Create new goal
PATCH /:id/progress      # Update goal progress
POST /:id/milestones     # Add milestone to goal
```

#### Memories (`/api/memories`)
```typescript
GET /           # Get user's memory vault
POST /          # Create new memory
```

#### Analytics (`/api/analytics`)
```typescript
GET /moods      # Get 30-day mood trend data
```

#### Crisis (`/api/crisis`)
```typescript
POST /alert     # Log crisis event (⚠️ stub: emergency notifications)
GET /history    # Get crisis event history
```

#### AI (`/api/ai`)
```typescript
POST /mood-insight    # Get AI insight on mood entries
POST /goal-coach      # Get AI coaching for goal
POST /chat            # AI chat endpoint
```

### Middleware
- `server/middleware/auth.ts` - Clerk JWT verification
- `server/routes.ts` - Route registration with auth middleware

---

## 5. Frontend Pages

### Auth Page (`/src/pages/auth/Auth.tsx`)
- SignIn/SignUp forms via Clerk
- Social login buttons (Google, Apple, GitHub)
- Toggle between sign in and sign up
- App branding and description

### Dashboard (`/src/pages/dashboard/Dashboard.tsx`)
- Welcome greeting with user's name
- Quick mood entry card
- Active goals overview
- Recent memories preview
- Daily streak display (⚠️ stub: hardcoded "12 days")
- Crisis support quick access

### Mood Tracker (`/src/pages/dashboard/MoodTracker.tsx`)
- 1-5 mood rating selector
- Emotion tags (Happy, Calm, Anxious, Sad, etc.)
- Context/notes input
- AI insight generation
- Crisis detection (auto-triggers on very low moods)
- Mood history chart (7-day trend)

### Goal Coach (`/src/pages/dashboard/GoalCoach.tsx`)
- Create new goals with SMART criteria
- Category selection (Mental Health, Physical, Career, etc.)
- Milestone creation and tracking
- Progress visualization
- AI coaching tips for each goal
- Goal status management

### Memory Vault (`/src/pages/dashboard/MemoryVault.tsx`)
- Memory graph visualization (⚠️ stub: simplified layout)
- Create new memory entries
- Tag memories with type (note, event, milestone)
- Link related memories
- Sentiment analysis display

### Analytics (`/src/pages/analytics/Analytics.tsx`)
- 30-day mood trend chart (Recharts)
- Emotion distribution pie chart
- Goal completion rate
- Weekly patterns analysis
- ⚠️ Stats summary (hardcoded values - needs real data)

### Crisis Support (`/src/pages/dashboard/CrisisSupport.tsx`)
- Immediate help resources
- Crisis hotline numbers
- Emergency contact button
- Grounding techniques
- Breathing exercise guide
- Crisis history log

### Profile (`/src/pages/profile/Profile.tsx`)
- User info display
- Notification settings toggle
- Encryption status indicator
- Dark mode indicator (always on)
- Sign out button (functional)
- Delete account button (⚠️ stub: no implementation)

---

## 6. React Contexts

### AuthContext (`src/context/AuthContext.tsx`)
```typescript
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}
```
- Syncs Clerk user with local state
- Persists user to Capacitor Preferences
- Provides auth state to all components

### SanctuaryContext (`src/context/SanctuaryContext.tsx`)
```typescript
interface SanctuaryContextType {
  currentMood: MoodEntry | null;
  setCurrentMood: (mood: MoodEntry | null) => void;
  activeGoals: Goal[];
  setActiveGoals: (goals: Goal[]) => void;
  memoryGraph: MemoryNode[];
  addMemoryNode: (node: MemoryNode) => void;
  crisisMode: boolean;
  setCrisisMode: (mode: boolean) => void;
  refreshData: () => Promise<void>;
}
```
- Global app state management
- Data fetching with auth tokens
- Crisis mode state

### LayoutContext (`src/context/SanctuaryContext.tsx`)
```typescript
interface LayoutContextType {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  isMobile: boolean;
}
```
- Responsive layout management
- Sidebar state for mobile

---

## 7. Custom Hooks

### useMood (`src/hooks/useMood.ts`)
```typescript
{
  logMood: (entry: MoodEntry) => Promise<void>;
  getMoodHistory: () => Promise<MoodEntry[]>;
  analyzeTrends: () => TrendAnalysis;
  crisisAlert: () => void;  // ⚠️ endpoint path bug
}
```

### useGoals (`src/hooks/useGoals.ts`)
```typescript
{
  createGoal: (goal: Goal) => Promise<void>;
  updateProgress: (id: string, progress: number) => Promise<void>;
  addMilestone: (goalId: string, milestone: Milestone) => Promise<void>;
}
```

### useAI (`src/hooks/useAI.ts`)
```typescript
{
  getMoodInsight: (entries: MoodEntry[]) => Promise<string>;
  getGoalCoaching: (goal: Goal) => Promise<string>;
  chat: (message: string, history: ChatMessage[]) => Promise<string>;
}
```

---

## 8. UI Components

### Layout Components
- **Layout** (`src/components/layout/Layout.tsx`) - Main app shell
- **NavBar** (`src/components/layout/NavBar.tsx`) - Top navigation with UserButton
- **SideBar** (`src/components/layout/SideBar.tsx`) - Navigation menu
- **PageLoader** (`src/components/ui/PageLoader.tsx`) - Loading spinner

### UI Primitives
- **Card** (`src/components/ui/Card.tsx`) - Container with sanctuary theme
- **Button** (`src/components/ui/Button.tsx`) - Styled buttons (primary, secondary, danger)
- **ProgressBar** (`src/components/ui/ProgressBar.tsx`) - Goal progress visualization

### Feature Components
- **MoodEntryForm** (`src/components/mood/MoodEntryForm.tsx`) - Mood input form
- **MoodChart** (`src/components/analytics/MoodChart.tsx`) - Recharts line chart
- **GoalCard** (`src/components/goals/GoalCard.tsx`) - Goal display card
- **MemoryGraph** (`src/components/memory/MemoryGraph.tsx`) - ⚠️ stub: needs proper visualization
- **CrisisModal** (`src/components/crisis/CrisisModal.tsx`) - Crisis intervention UI

---

## 9. Services & Utilities

### API Service (`src/utils/api.ts`)
- Generic `apiFetch()` with Clerk token injection
- Helper methods: `post()`, `patch()`, `del()`
- `useApi()` hook for React components

### Encryption (`src/utils/encryption.ts`)
- AES-256-CBC encryption for sensitive data
- Uses `ENCRYPTION_KEY` and `ENCRYPTION_IV` from env
- ⚠️ stub: returns unencrypted if keys missing (security issue)

### Crisis Detection (`src/utils/crisisDetection.ts`)
- Keyword-based crisis detection
- Mood score threshold checking
- Automatic crisis event logging

---

## 10. Mobile Integration (Capacitor)

### Installed Plugins
| Plugin | Version | Purpose |
|--------|---------|---------|
| @capacitor/core | 6.2.1 | Core Capacitor |
| @capacitor/ios | 6.2.1 | iOS support |
| @capacitor/android | 6.2.1 | Android support |
| @capacitor/preferences | 6.0.4 | Secure storage |
| @capacitor/browser | 6.0.6 | OAuth browser flow |
| @capacitor/app | 6.0.3 | App lifecycle |
| @capacitor/splash-screen | 6.0.4 | Launch screen |
| @capacitor/status-bar | 6.0.3 | Status bar styling |
| @capacitor/keyboard | 6.0.4 | Keyboard handling |
| @capacitor/haptics | 6.0.3 | Haptic feedback |
| @capacitor/local-notifications | 6.1.3 | Local notifications |
| @capacitor/push-notifications | 6.0.5 | Push notifications |
| @capacitor/screen-orientation | 6.0.4 | Screen orientation |

### Capacitor Configuration
- **App ID**: `com.soulsanctuary.app`
- **App Name**: SoulSanctuary
- **iOS Scheme**: https
- **Android Scheme**: https
- **Deep Links**: ⚠️ partially configured

---

## 11. AI Integration (OpenRouter)

### Configuration
- **Base URL**: `https://openrouter.ai/api/v1`
- **Model**: `anthropic/claude-3.5-sonnet`
- **Fallback**: `openai/gpt-4o-mini`

### AI Features Implemented
1. **Mood Insights** - Analyzes mood patterns and provides gentle observations
2. **Goal Coaching** - Motivational advice for achieving goals
3. **Chat Support** - Conversational AI for mental health support
4. **Crisis Detection** - Analyzes messages for crisis indicators

### AI Prompts
All prompts include system context for compassionate, non-clinical mental health support.

---

## 12. Security Features

### Implemented
- ✅ Clerk authentication with JWT
- ✅ Encrypted data storage (memories marked encrypted)
- ✅ Auth middleware on all API routes
- ✅ HTTPS-only (Capacitor schemes)

### ⚠️ Stubs/Issues
- Encryption service returns unencrypted data if key missing
- No rate limiting on API endpoints
- No CORS restrictions configured
- No input sanitization (DOMPurify not implemented)
- No security headers (Helmet not fully configured)

---

## 13. Known Bugs & Stubs

### Critical (Must Fix)
1. **Crisis Alert Endpoint** - Wrong path in `useMood.ts` (`/crisis-alert` vs `/api/crisis/alert`)
2. **Hardcoded Analytics** - Stats in Analytics page are fake
3. **Missing Encryption** - Encryption utility incomplete
4. **No Delete Account** - Button exists but no functionality

### High Priority
5. **Empty Services Directory** - All business logic stubs missing
6. **No Notifications** - Notification bell has no functionality
7. **Simplified Memory Graph** - Not a true force-directed graph
8. **Hardcoded Suggestions** - AI routes return static suggestions

### Medium Priority
9. **No Emergency Contact Notifications** - Crisis route has commented code
10. **No Webhook Handlers** - Clerk webhooks not implemented
11. **No Offline Support** - No caching or sync queue
12. **Missing PWA Icons** - Icon files may not exist

### Low Priority
13. **No Background Sync** - Data doesn't sync when app resumes
14. **No Deep Linking** - OAuth callbacks not fully configured
15. **No Rate Limiting** - API vulnerable to abuse
16. **No Logging Service** - Only console.log used

---

## 14. Environment Variables

### Required (.env)
```bash
# Database
DATABASE_URL=postgresql://...

# Clerk Auth
VITE_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...

# AI
OPENROUTER_API_KEY=sk-or-v1-...

# Security
JWT_SECRET=[GENERATE]
ENCRYPTION_KEY=[GENERATE]
ENCRYPTION_IV=[GENERATE]

# Optional OAuth
GOOGLE_CLIENT_ID=
GITHUB_CLIENT_ID=
APPLE_CLIENT_ID=

# Optional Push Notifications
FIREBASE_...=
APNS_...=

# Optional Analytics
SENTRY_DSN=
```

---

## 15. Build & Deployment

### Scripts
```bash
npm run dev              # Vite dev server
npm run build            # Production build
npm run server:dev       # Express dev server
npm run mobile:sync      # Capacitor sync
npm run mobile:ios       # Open iOS project
npm run mobile:android   # Open Android project
db:generate              # Generate Drizzle migrations
db:push                  # Push schema to database
db:studio                # Open Drizzle Studio
```

### Build Output
- **Web**: `dist/` - Static files for web deployment
- **iOS**: `ios/App/` - Xcode project
- **Android**: `android/` - Android Studio project

---

## 16. Testing Status

### Manual Testing Completed
- ✅ Clerk authentication flow
- ✅ Basic navigation
- ✅ Mood entry creation
- ✅ Goal creation
- ✅ AI chat interface

### Automated Tests
- ❌ No unit tests written
- ❌ No integration tests
- ❌ No E2E tests

---

## 17. Documentation

### Existing
- ✅ This summary document
- ✅ Completion prompt guide
- ✅ Environment example (.env.example)

### Missing
- ❌ API documentation (OpenAPI/Swagger)
- ❌ Component storybook
- ❌ Deployment guide
- ❌ User manual

---

## 18. Lines of Code

| Category | Files | Approx LOC |
|----------|-------|------------|
| Frontend (src/) | 45 | ~4,500 |
| Backend (server/) | 15 | ~1,200 |
| Database Schema | 1 | ~65 |
| Config/Build | 10 | ~300 |
| **Total** | **71** | **~6,065** |

---

## 19. Next Steps (Priority Order)

### Week 1: Critical Fixes
1. Fix crisis alert endpoint path
2. Implement delete account functionality
3. Complete encryption service
4. Replace hardcoded analytics with real queries

### Week 2: Core Services
5. Create notification service
6. Implement AI suggestion generation
7. Build emergency contact system
8. Add input validation & sanitization

### Week 3: Polish
9. Improve memory graph visualization
10. Add offline support
11. Configure push notifications
12. Add webhook handlers

### Week 4: Production Ready
13. Security audit & hardening
14. Rate limiting & CORS
15. Comprehensive testing
16. Performance optimization

---

## 20. Success Criteria

The app is considered complete when:

- [ ] All authentication flows work (email, OAuth)
- [ ] Mood tracking with AI insights functional
- [ ] Goal setting with milestones working
- [ ] Memory vault with proper visualization
- [ ] Crisis detection triggers notifications
- [ ] Push notifications delivered
- [ ] Offline mode works
- [ ] All data encrypted at rest
- [ ] iOS build passes App Store review
- [ ] Android build passes Play Store review
- [ ] Security audit passed
- [ ] Load testing successful (100+ concurrent users)

---

**Document Version**: 1.0  
**Last Updated**: March 14, 2026  
**Author**: AI Assistant
