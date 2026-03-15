# SoulSanctuary - Complete All Stubs and Placeholders

## Objective
Complete all placeholder values, stub implementations, and missing functionality in the SoulSanctuary mental health app to make it fully production-ready.

## Current State Analysis
The app is a React + TypeScript + Capacitor mobile application with:
- **Frontend**: React, Tailwind CSS, Recharts, Lucide icons
- **Backend**: Express.js, Drizzle ORM, PostgreSQL (Neon)
- **Authentication**: Clerk
- **AI Integration**: OpenRouter (Claude/GPT)
- **Mobile**: Capacitor (iOS/Android)

---

## Phase 1: Critical Configuration (MUST DO FIRST)

### 1.1 Environment Variables (.env)
Replace ALL placeholder values in `.env`:

```bash
# Current placeholders to replace:
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long
# ↓ Generate with: openssl rand -base64 32
JWT_SECRET=[GENERATE_NEW_32_CHAR_SECRET]

ENCRYPTION_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# ↓ Generate with: openssl rand -base64 32
ENCRYPTION_KEY=[GENERATE_32_BYTE_KEY]

ENCRYPTION_IV=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# ↓ Generate with: openssl rand -base64 16
ENCRYPTION_IV=[GENERATE_16_BYTE_IV]

CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# ↓ Get from Clerk Dashboard → Webhooks
CLERK_WEBHOOK_SECRET=[FROM_CLERK_DASHBOARD]
```

**Security Requirement**: Move all real API keys from `.env` to `.env.local` (already in .gitignore)

### 1.2 Remove Duplicate/Conflicting Clerk Key
Delete file `src/providers/ClerkProvider.tsx` (unused - Clerk is initialized in `src/main.tsx`)

---

## Phase 2: Server-Side Implementation

### 2.1 Create server/services/ Directory
Create these service files:

**server/services/notification.ts**
```typescript
// Implement push notification service using Firebase Admin
// - sendPushNotification(userId, title, body, data)
// - sendToMultipleUsers(userIds, title, body)
// - scheduleNotification(userId, title, body, scheduledTime)
```

**server/services/ai.ts**
```typescript
// AI service wrapper around OpenRouter
// - generateMoodInsight(moodEntries): Promise<string>
// - generateGoalCoaching(goal): Promise<string>
// - detectCrisis(message): Promise<{isCrisis: boolean, severity: string}>
// - generateMemoryInsights(memories): Promise<string[]>
```

**server/services/encryption.ts**
```typescript
// Encryption/decryption service for sensitive user data
// - encrypt(text: string): Promise<string>
// - decrypt(encrypted: string): Promise<string>
// Uses AES-256-GCM with key from ENCRYPTION_KEY env var
```

**server/services/crisis.ts**
```typescript
// Crisis detection and emergency response service
// - analyzeMoodForCrisis(moodData): Promise<CrisisAlert | null>
// - notifyEmergencyContacts(userId, severity): Promise<void>
// - getCrisisResources(): CrisisResource[]
```

### 2.2 Complete Crisis Routes
**File**: `server/routes/crisis.ts`

Replace the commented emergency notification:
```typescript
// Line 28-29: Uncomment and implement
await notifyEmergencyContacts(user.id, severity);

// Add implementation:
import { notifyEmergencyContacts } from '../services/crisis';
```

### 2.3 Complete AI Routes
**File**: `server/routes/ai.ts`

Replace hardcoded suggestions with AI-generated ones:
```typescript
// Instead of: suggestions: ['Practice deep breathing', ...]
// Call: const suggestions = await generateSuggestions(entries, 'mood');
```

Add these AI endpoints:
```typescript
// POST /api/ai/memory-insight
// Generate insights from memory patterns

// POST /api/ai/weekly-summary
// Generate weekly mental health summary

// POST /api/ai/crisis-assessment
// Assess if user message indicates crisis
```

### 2.4 Add Webhook Handler for Clerk
**File**: `server/routes/webhooks.ts`

Create webhook endpoint for Clerk events:
```typescript
// POST /api/webhooks/clerk
// Handle: user.created, user.updated, user.deleted
// Sync user data with our database
```

### 2.5 Add Error Handling Middleware
**File**: `server/middleware/error.ts`

Create comprehensive error handler:
```typescript
// Global error handling with proper logging
// Different responses for dev vs production
// Don't leak stack traces in production
```

---

## Phase 3: Frontend Implementation

### 3.1 Fix Crisis Alert Endpoint
**File**: `src/hooks/useMood.ts`

Change line with crisis alert:
```typescript
// Change from: fetch('/crisis-alert', ...)
// To: fetch('/api/crisis/alert', ...)
```

### 3.2 Implement Delete Account
**File**: `src/pages/profile/Profile.tsx`

Add delete account functionality:
```typescript
const handleDeleteAccount = async () => {
  // Show confirmation dialog
  // Call DELETE /api/user
  // Sign out from Clerk
  // Clear local storage
  // Redirect to auth page
};
```

Add server endpoint:
**File**: `server/routes/user.ts`
```typescript
// DELETE /api/user - Delete user account and all data
// Must verify password/re-authenticate first
// Delete from database, Clerk, and any external services
```

### 3.3 Implement Notifications System
**File**: `src/components/layout/NavBar.tsx`

Add notification dropdown and functionality:
```typescript
// State: notifications, unreadCount, isOpen
// Fetch notifications on mount
// Mark as read on click
// Real-time updates via WebSocket or polling
```

Create notification service:
**File**: `src/services/notifications.ts`
```typescript
// requestPermission(): Promise<boolean>
// scheduleLocalNotification(title, body, delay)
// cancelNotification(id)
// getScheduledNotifications()
```

### 3.4 Replace Hardcoded Analytics
**File**: `src/pages/analytics/Analytics.tsx`

Replace hardcoded stats with real data:
```typescript
// Current: Average Mood "3.4/5" (hardcoded)
// Should fetch from: GET /api/analytics/summary

// Add new endpoint in server/routes/analytics.ts:
// GET /api/analytics/summary
// Returns: { averageMood, totalEntries, goalsCompleted, streakDays, weeklyTrend }
```

### 3.5 Improve Memory Graph Visualization
**File**: `src/components/memory/MemoryGraph.tsx`

Replace random positioning with proper force-directed graph:
```typescript
// Use d3-force or react-force-graph
// Implement: link forces, charge forces, collision detection
// Add: zoom, pan, node selection
// Color nodes by sentiment/type
// Show connection strength
```

### 3.6 Add Offline Support
**File**: `src/services/offline.ts`

Create offline-first data layer:
```typescript
// Queue API calls when offline
// Sync when back online
// Cache moods, goals, memories locally
// Handle conflicts
```

---

## Phase 4: Database & Schema

### 4.1 Add Missing Tables
**File**: `server/db/schema.ts`

Add these tables:

```typescript
// Notifications table
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  body: text('body').notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'goal', 'mood', 'crisis', 'system'
  read: boolean('read').default(false),
  data: jsonb('data').default({}),
  createdAt: timestamp('created_at').defaultNow(),
});

// Emergency contacts table
export const emergencyContacts = pgTable('emergency_contacts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  email: varchar('email', { length: 255 }),
  relationship: varchar('relationship', { length: 100 }),
  isPrimary: boolean('is_primary').default(false),
  notifyOnCrisis: boolean('notify_on_crisis').default(true),
});

// Chat history for AI conversations
export const chatHistory = pgTable('chat_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  role: varchar('role', { length: 20 }).notNull(), // 'user' or 'assistant'
  content: text('content').notNull(),
  timestamp: timestamp('timestamp').defaultNow(),
});

// User settings/preferences
export const userSettings = pgTable('user_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull().unique(),
  notificationsEnabled: boolean('notifications_enabled').default(true),
  dailyReminderTime: varchar('daily_reminder_time', { length: 10 }), // "09:00"
  crisisModeEnabled: boolean('crisis_mode_enabled').default(true),
  encryptionEnabled: boolean('encryption_enabled').default(true),
  theme: varchar('theme', { length: 20 }).default('dark'),
  language: varchar('language', { length: 10 }).default('en'),
});
```

Run migrations:
```bash
npm run db:generate
npm run db:push
```

---

## Phase 5: Mobile-Specific Features

### 5.1 Configure Deep Linking
**File**: `capacitor.config.ts`

Add iOS/Android deep link handling for OAuth callbacks:
```typescript
server: {
  androidScheme: 'https',
  // Add URL handling for auth callbacks
}
```

**iOS**: `ios/App/App/Info.plist`
Add URL scheme for `soulsanctuary://`

**Android**: `android/app/src/main/AndroidManifest.xml`
Add intent-filter for deep links

### 5.2 Add Push Notification Handling
**File**: `src/services/pushNotifications.ts`

```typescript
// Initialize push notifications
// Handle token registration
// Handle incoming notifications (foreground/background)
// Request permissions
```

### 5.3 Add Background Sync
**File**: `src/services/backgroundSync.ts`

```typescript
// Register background tasks
// Sync data when app comes to foreground
// Handle pending API calls
```

---

## Phase 6: Testing & Quality

### 6.1 Add Input Validation
Add Zod schemas to ALL routes:
- Validate request bodies
- Validate query parameters
- Sanitize user inputs

### 6.2 Add Rate Limiting
**File**: `server/middleware/rateLimit.ts`

```typescript
// Rate limit auth endpoints: 5 requests per minute
// Rate limit AI endpoints: 20 requests per hour
// Rate limit general API: 100 requests per minute
```

### 6.3 Add Logging
**File**: `server/services/logger.ts`

```typescript
// Structured logging with Winston or Pino
// Log all API requests
// Log errors with stack traces
// Separate logs by level (error, warn, info, debug)
```

### 6.4 Create Test Suite
Add tests for critical functionality:
```
src/__tests__/
  - auth.test.ts
  - moodTracking.test.ts
  - encryption.test.ts
  - crisisDetection.test.ts
```

---

## Phase 7: Security Hardening

### 7.1 Security Headers
**File**: `server/index.ts`

Add Helmet with strict CSP:
```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      // ... more directives
    }
  }
}));
```

### 7.2 Input Sanitization
Add to all routes that accept user input:
```typescript
import DOMPurify from 'dompurify';

// Sanitize HTML content
const clean = DOMPurify.sanitize(dirtyInput);
```

### 7.3 CORS Configuration
```typescript
// Restrict CORS to known origins only
// Don't use '*' in production
```

---

## Implementation Order

**Week 1: Foundation**
1. Phase 1 (Environment & Security)
2. Phase 2.1-2.2 (Services & Crisis)

**Week 2: Core Features**
3. Phase 3.1-3.4 (Frontend fixes)
4. Phase 4 (Database schema)

**Week 3: Polish**
5. Phase 2.3-2.5 (AI & Webhooks)
6. Phase 3.5-3.6 (Memory Graph & Offline)

**Week 4: Mobile & Testing**
7. Phase 5 (Mobile features)
8. Phase 6 (Testing)
9. Phase 7 (Security)

---

## Verification Checklist

Before marking complete, verify:

- [ ] All `.env` placeholders replaced with real values
- [ ] No hardcoded API keys in source code
- [ ] All server routes have error handling
- [ ] All user inputs validated and sanitized
- [ ] Database migrations run successfully
- [ ] Push notifications work on iOS/Android
- [ ] Offline mode works (airplane mode test)
- [ ] Crisis detection triggers notifications
- [ ] Account deletion works end-to-end
- [ ] Analytics show real data, not hardcoded values
- [ ] Memory graph visualizes connections properly
- [ ] AI insights are actually AI-generated
- [ ] App builds for iOS without errors
- [ ] App builds for Android without errors

---

## Testing Commands

```bash
# Build and test
npm run build
npm run mobile:sync

# Test iOS
cd ios/App && xcodebuild -workspace App.xcworkspace -scheme App -destination 'platform=iOS Simulator,name=iPhone 15' build

# Test Android
cd android && ./gradlew assembleDebug

# Database
npm run db:studio  # View and verify data

# Server
npm run server:dev  # Test API endpoints
```

---

## Deliverables

When complete, provide:

1. **Updated source code** with all stubs implemented
2. **Test report** showing all features working
3. **Security audit** report
4. **Deployment guide** with environment setup
5. **API documentation** (OpenAPI/Swagger)

---

**Estimated Time**: 2-4 weeks for complete implementation
**Priority**: Critical stubs first (security, data integrity), then features
