# Unused Code Report

**Generated:** 2026-03-15
**Project:** SoulSanctuary v2.0

---

## Executive Summary

| Category | Files | Lines | Action |
|----------|-------|-------|--------|
| Duplicate API utilities | 1 | ~150 | Merge or remove |
| Potentially unused exports | 35+ | ~500 | Review individually |
| Console statements | 174 | ~300 | Replace with logger |
| Commented code | Unknown | Unknown | Remove |

**Estimated Cleanup:** 2-4 hours
**Risk Level:** Low (mostly utilities)

---

## 🔴 HIGH PRIORITY (Remove/Merge)

### 1. Duplicate API Utilities

**Files:**
- `src/utils/api.ts` - ✅ **USED** (8 imports found)
- `src/services/api.ts` - ❌ **UNUSED** (0 imports found)

**Issue:** Two nearly identical API utility modules

**Details:**
```typescript
// src/utils/api.ts - ACTIVELY USED
export async function apiFetch(...)
export function get(...)
export function post(...)
export function patch(...)
export function del(...)
export function useApi(...)

// src/services/api.ts - UNUSED
export async function apiRequest<T>(...)
export class ApiError extends Error
export const api = { ... }
export default api;
```

**Recommendation:**
- [ ] Delete `src/services/api.ts`
- [ ] Move any unique functionality to `src/utils/api.ts`
- [ ] Update any missed imports

**Effort:** 15 minutes
**Risk:** Low (verified unused)

---

## 🟡 MEDIUM PRIORITY (Review)

### 2. Potentially Unused Exports (from ts-prune)

**Note:** Some may be used dynamically or in untracked files

#### A. Configuration
| Export | Location | Status |
|--------|----------|--------|
| `validateEnv` | `src/config/env.ts:26` | Check usage |
| `ENV` | `src/config/env.ts:4` | Check usage |

#### B. Background Sync Services
| Export | Location | Recommendation |
|--------|----------|----------------|
| `getCachedData` | `src/services/backgroundSync.ts:236` | Verify unused |
| `clearCachedData` | `src/services/backgroundSync.ts:258` | Verify unused |
| `handleBackgroundFetch` | `src/services/backgroundSync.ts:300` | Verify unused |

#### C. Notification Services
| Export | Location | Recommendation |
|--------|----------|----------------|
| `scheduleDailyReminder` | `src/services/notifications.ts:86` | Verify unused |
| `cancelNotification` | `src/services/notifications.ts:127` | Verify unused |
| `cancelAllNotifications` | `src/services/notifications.ts:165` | Verify unused |
| `scheduleGoalReminder` | `src/services/notifications.ts:180` | Verify unused |
| `scheduleMoodCheckIn` | `src/services/notifications.ts:194` | Verify unused |
| `addNotificationListener` | `src/services/notifications.ts:226` | Verify unused |

#### D. Offline Services
| Export | Location | Recommendation |
|--------|----------|----------------|
| `clearQueue` | `src/services/offline.ts:90` | Verify unused |
| `clearCache` | `src/services/offline.ts:196` | Verify unused |
| `smartFetch` | `src/services/offline.ts:208` | Verify unused |
| `getOfflineStatus` | `src/services/offline.ts:310` | May be used |

#### E. Push Notification Services
| Export | Location | Recommendation |
|--------|----------|----------------|
| `unregisterPushNotifications` | `src/services/pushNotifications.ts:175` | Verify unused |
| `getPushNotificationStatus` | `src/services/pushNotifications.ts:196` | Verify unused |
| `requestPushPermission` | `src/services/pushNotifications.ts:222` | Verify unused |
| `clearAllNotifications` | `src/services/pushNotifications.ts:239` | Verify unused |

#### F. Types
| Export | Location | Recommendation |
|--------|----------|----------------|
| `MoodEntry` | `src/types/index.ts:1` | Keep - likely used |
| `Goal` | `src/types/index.ts:12` | Keep - likely used |
| `MemoryNode` | `src/types/index.ts:34` | Verify unused |
| `CrisisEvent` | `src/types/index.ts:45` | Keep - used in schema |
| `UserProfile` | `src/types/index.ts:56` | Keep - likely used |

#### G. Utilities
| Export | Location | Recommendation |
|--------|----------|----------------|
| `encryptData` | `src/utils/encryption.ts:5` | Keep - likely used |
| `decryptData` | `src/utils/encryption.ts:10` | Keep - likely used |
| `hashSensitiveData` | `src/utils/encryption.ts:16` | Keep - likely used |

#### H. Server Security Config
| Export | Location | Recommendation |
|--------|----------|----------------|
| `PASSWORD_POLICY` | `server/config/security.ts:9` | Verify unused |
| `SESSION_CONFIG` | `server/config/security.ts:19` | Verify unused |

---

## 🟢 LOW PRIORITY (Code Quality)

### 3. Console Statements (174 instances)

**Distribution:**
| Type | Count | Location |
|------|-------|----------|
| console.log | ~100 | Throughout codebase |
| console.error | ~50 | Error handling |
| console.warn | ~24 | Warnings |

**Files with Most Console Statements:**
1. `server/services/ai.ts` - Debug logging
2. `server/services/comprehensiveCoaching.ts` - Debug logging
3. `server/routes/*.ts` - Request logging
4. `src/services/*.ts` - Client-side logging

**Recommendation:**
Replace with proper logger (Winston on server, custom on client):
```typescript
// Instead of:
console.log('User created:', userId);

// Use:
logger.info('User created', { userId });
```

**Effort:** 2-3 hours
**Benefit:** Better log management, production filtering

---

### 4. Commented Code

**Search for:**
```bash
grep -rn "^\s*//.*[a-zA-Z]" --include="*.ts" --include="*.tsx" src/ server/
grep -rn "^\s*/\*" --include="*.ts" --include="*.tsx" src/ server/
```

**Likely Locations:**
- Old implementations
- Debugging code
- Feature flags

**Recommendation:** Remove before production

---

### 5. Unused Imports (Specific Cases)

#### React Imports
Check for unused:
- `useEffect` imported but not used
- `useState` imported but not used
- `useCallback` imported but not used

#### Icon Imports (Lucide)
Many files import icons that may not be used:
```typescript
import { Something, Another, Unused } from 'lucide-react';
```

**Recommendation:** Use ESLint with `unused-imports` plugin

---

## Detailed Analysis

### File-by-File Review

#### `src/services/api.ts`
- **Status:** Completely unused
- **Action:** DELETE
- **Lines:** ~160
- **Risk:** None (verified no imports)

#### `src/config/env.ts`
- **Exports:** `validateEnv`, `ENV`
- **Check:** Are these used anywhere?
- **Action:** Verify then remove or keep

#### Notification Service Exports
- Many notification functions may be unused
- Check if UI components call these
- Consider removing if push notifications disabled

#### Type Exports
- Most type exports should be kept
- They enable TypeScript intellisense
- Even if not directly imported, they help IDE

---

## Cleanup Script

### Phase 1: Safe Removals (15 min)
```bash
# Remove duplicate API file
rm src/services/api.ts

# Remove empty test placeholders
# (Keep encryption.test.ts but update it)
```

### Phase 2: Replace Console Logs (2-3 hours)
```typescript
// Add to logger utility
import { logInfo, logError, logWarn } from './logger';

// Replace all console.* with logger.*
```

### Phase 3: ESLint Auto-fix (30 min)
```bash
# Add ESLint unused imports plugin
npm install eslint-plugin-unused-imports --save-dev

# Run auto-fix
npx eslint --fix src/
```

---

## Verification Checklist

After cleanup:
- [ ] TypeScript compiles without errors
- [ ] Build succeeds
- [ ] All tests pass
- [ ] App runs correctly
- [ ] No runtime errors

---

## Recommendations

### Immediate (Do Now)
1. ✅ Remove `src/services/api.ts` (confirmed unused)
2. ✅ Replace console.log with logger in critical paths

### Short Term (This Week)
3. Add ESLint unused-imports plugin
4. Run automated cleanup
5. Verify all remaining exports

### Long Term
6. Set up CI check for unused code
7. Regular dependency audits
8. Code coverage reporting

---

## Tools for Ongoing Maintenance

| Tool | Purpose | Command |
|------|---------|---------|
| ts-prune | Find unused exports | `npx ts-prune` |
| eslint-plugin-unused-imports | Auto-remove unused imports | `npx eslint --fix` |
| depcheck | Find unused dependencies | `npx depcheck` |
| unimported | Find dead code | `npx unimported` |

---

## Summary

**Quick Wins:**
- Remove duplicate API file (15 min)
- Clean up console logs (2-3 hours)
- Remove commented code (30 min)

**Total Cleanup Time:** ~4 hours
**Code Reduction:** ~800-1000 lines
**Maintenance Benefit:** High (cleaner codebase)
