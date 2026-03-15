# Stub/Placeholder Inventory

**Generated:** 2026-03-15
**Project:** SoulSanctuary v2.0

---

## Executive Summary

| Priority | Count | Category |
|----------|-------|----------|
| 🔴 CRITICAL | 2 | Security/Feature impacting |
| 🟡 HIGH | 3 | User experience affecting |
| 🟢 MEDIUM | 5 | Nice-to-have improvements |
| ⚪ LOW | 174 | Code quality (console logs) |

---

## 🔴 CRITICAL (Must Fix)

### 1. Premium Access Control

**Location:** `server/routes/ai.ts:414`

**Current Code:**
```typescript
// Check if user has premium access (implement your premium check)
// For now, allow all
```

**Issue:** All users have access to premium curriculum generation. No payment/subscription check.

**Impact:** Revenue loss, unauthorized access to paid features

**Recommendation:** 
- Implement Stripe/subscription check
- OR remove premium tier entirely
- OR add feature flags

**Effort:** 4-8 hours

---

### 2. Placeholder Test Suite

**Location:** `src/__tests__/encryption.test.ts:6-7`

**Current Code:**
```typescript
// This is a placeholder test
// In real implementation, test the actual encryption functions
```

**Issue:** No actual encryption tests despite encryption being used

**Impact:** Security vulnerabilities could go undetected

**Recommendation:**
- Implement proper encryption/decryption tests
- Test key generation, data integrity, edge cases

**Effort:** 2-4 hours

---

## 🟡 HIGH (Should Fix)

### 3. File Upload/Media Storage

**Status:** NOT IMPLEMENTED

**Missing Features:**
- User profile picture upload
- Memory attachments (photos)
- Voice note storage

**Database Schema:** Has fields for media but no upload handlers

**Current State:**
- Database has `imageUrl`, `mediaUrl` fields
- No multer/S3/Cloudinary integration
- No file type validation
- No size limits

**Impact:** Core feature (memories) is text-only

**Recommendation:**
- Option A: Implement file upload with Cloudinary (2-3 days)
- Option B: Remove media fields from schema (1 hour)
- Option C: Document as future feature (now)

---

### 4. Console.log Statements (174 instances)

**Issue:** 174 console.log/error/warn statements in production code

**Examples:**
- Debug logging in auth flows
- API response logging
- Error tracing

**Impact:**
- Performance degradation
- Potential data leakage in logs
- Unprofessional appearance

**Files with Most Console Statements:**
- `server/services/*.ts` - Service logging
- `src/services/*.ts` - Client logging
- `server/routes/*.ts` - API logging

**Recommendation:**
- Replace with proper logger (Winston already imported)
- Use log levels (debug, info, warn, error)
- Disable debug logs in production

**Effort:** 4-6 hours

---

### 5. Crisis Escalation System

**Location:** `server/services/ai.ts` - Crisis detection

**Current Implementation:**
```typescript
const crisisKeywords = {
  critical: ['suicide', 'kill myself', ...],
  high: ['self harm', 'hurt myself', ...],
  medium: ['hopeless', 'can\'t go on', ...],
};
```

**Issues:**
- Simple keyword matching (easily bypassed)
- No human escalation
- No crisis counselor notification
- No location-based resources

**Impact:** User safety risk

**Recommendation:**
- Document limitations clearly
- Add "Get Help" button prominently
- Consider partnership with crisis services
- Add mandatory crisis resources page

**Effort:** Documentation: 1 hour | Full system: 1-2 weeks

---

## 🟢 MEDIUM (Nice to Have)

### 6. Push Notifications (Partially Implemented)

**Status:** Frontend complete, server conditional

**What's Working:**
- FCM token registration
- Token storage
- Notification listeners

**What's Missing:**
- Firebase credentials (disabled)
- No notification sending in production
- Background sync not fully implemented

**Recommendation:**
- Either complete Firebase setup
- OR remove push notification code entirely
- OR implement alternative (OneSignal, Pusher)

**Location:**
- `server/services/notification.ts`
- `src/services/pushNotifications.ts`

---

### 7. Offline Sync Queue

**Location:** `src/services/offline.ts`

**Status:** Basic implementation present

**Issues:**
- Conflict resolution is basic (last-write-wins)
- No retry with exponential backoff
- Queue persistence limited

**Impact:** Data loss possible in edge cases

**Recommendation:** Document limitations

---

### 8. AI Conversation Analysis

**Location:** `server/services/conversationAnalysis.ts`

**Status:** Implemented but AI-dependent

**Issues:**
- Requires OpenRouter API
- Falls back to empty insights if AI unavailable
- No local analysis capability

**Recommendation:** Acceptable for MVP

---

### 9. Comprehensive Coaching System

**Location:** `server/services/comprehensiveCoaching.ts`

**Status:** Implemented

**Limitation:** Full feature only works with valid OpenRouter API key

**Fallback:** Basic responses when AI unavailable

---

### 10. Memory Graph Visualization

**Location:** `src/components/memory/MemoryGraph.tsx`

**Status:** Implemented with react-force-graph

**Potential Issue:** Performance with large datasets (100+ memories)

**Recommendation:** Add pagination or virtualization for large datasets

---

## ⚪ LOW (Code Quality)

### 11. Unused Imports

**Files to Review:**
- All `.tsx` files for unused Lucide icons
- Component files for unused types
- Test files for unused mocks

**Recommendation:** Run linter with unused import rules

### 12. Placeholder Text in UI

**Locations:**
- Input placeholders (intentional - user guidance)
- Empty state messages (need review)

**Status:** Acceptable for production

### 13. Sample/Test Data in Database

**Check:** Are there any seed scripts with test data?

**Status:** Production database appears clean

---

## Stub Completion Roadmap

### Phase 1: Critical (Week 1)
- [ ] Implement premium access check OR remove premium tier
- [ ] Write encryption tests

### Phase 2: High Priority (Weeks 2-3)
- [ ] Remove or complete file upload feature
- [ ] Replace console.log with proper logger
- [ ] Document crisis system limitations

### Phase 3: Medium Priority (Weeks 4-6)
- [ ] Complete OR remove push notifications
- [ ] Improve offline sync conflict resolution
- [ ] Add memory graph pagination

### Phase 4: Polish (Ongoing)
- [ ] Clean up unused imports
- [ ] Add component documentation
- [ ] Optimize AI fallback responses

---

## Decision Matrix

| Feature | Implement | Remove | Document |
|---------|-----------|--------|----------|
| Premium Access | ✅ | ❌ | ❌ |
| Encryption Tests | ✅ | ❌ | ❌ |
| File Upload | ❓ | ❓ | ❌ |
| Push Notifications | ❓ | ✅ | ❌ |
| Crisis Escalation | ❌ | ❌ | ✅ |
| Console Logs | ✅ (logger) | ❌ | ❌ |
| Offline Sync | ❌ | ❌ | ✅ |

---

## Effort Estimates

| Task | Min Hours | Max Hours |
|------|-----------|-----------|
| Premium access control | 4 | 8 |
| Encryption tests | 2 | 4 |
| File upload (implement) | 16 | 24 |
| File upload (remove) | 1 | 2 |
| Console log cleanup | 4 | 6 |
| Push notifications (complete) | 8 | 16 |
| Push notifications (remove) | 2 | 4 |
| Crisis documentation | 1 | 2 |

**Total (implement everything):** ~60-80 hours
**Total (minimal viable):** ~15-25 hours

---

## Recommended Approach

For **Phase One Completion**:

1. **Do Now:**
   - Implement premium check (or remove tier)
   - Write encryption tests
   - Replace console logs with logger

2. **Document Only:**
   - Crisis system limitations
   - Offline sync limitations

3. **Defer to Phase 2:**
   - File upload feature
   - Push notifications
   - Memory graph optimization
