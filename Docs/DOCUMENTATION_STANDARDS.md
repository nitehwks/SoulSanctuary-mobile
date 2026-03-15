# Code Documentation Standards

**Project:** SoulSanctuary v2.0

---

## Overview

This document defines the documentation standards for the SoulSanctuary codebase. All code should be documented to ensure maintainability and clarity.

---

## JSDoc/TSDoc Format

### Function Documentation

```typescript
/**
 * Brief description of what the function does
 * 
 * @param paramName - Description of the parameter
 * @param paramName - Description (optional: default value)
 * @returns Description of return value
 * @throws ErrorType - When/why this error is thrown
 * 
 * @example
 * ```typescript
 * const result = functionName(arg1, arg2);
 * console.log(result);
 * ```
 */
```

### Component Documentation

```typescript
/**
 * Component description
 * 
 * @props PropType - Description of props
 * 
 * @example
 * ```tsx
 * <ComponentName 
 *   prop1={value1}
 *   prop2={value2}
 * />
 * ```
 */
```

### Interface/Type Documentation

```typescript
/**
 * Description of the interface
 */
interface TypeName {
  /** Description of property */
  property: type;
  
  /** Description of optional property */
  optionalProperty?: type;
}
```

---

## Documentation Examples

### Example 1: Hook with Full Documentation

**File:** `src/hooks/useAI.ts`

```typescript
import { useState, useCallback } from 'react';
import { post } from '../utils/api';

/**
 * Response from AI mood analysis
 */
interface AIInsight {
  /** Main insight text from AI */
  insight: string;
  /** List of actionable suggestions */
  suggestions: string[];
  /** Optional urgency level for the insight */
  urgency?: 'low' | 'medium' | 'high';
}

/**
 * Hook for AI-powered features
 * 
 * Provides methods to interact with AI services including mood analysis,
 * goal coaching, chat, and comprehensive coaching with user profiles.
 * 
 * @returns Object containing AI methods and loading state
 * 
 * @example
 * ```typescript
 * const { chatWithTherapist, loading } = useAI();
 * 
 * const response = await chatWithTherapist(
 *   "I'm feeling anxious today",
 *   [],
 *   'spiritual'
 * );
 * ```
 */
export function useAI() {
  const [loading, setLoading] = useState(false);

  /**
   * Get AI insight for mood entries
   * 
   * Analyzes mood history and provides personalized insights
   * and coping strategies.
   * 
   * @param moodEntries - Array of mood entry objects
   * @returns AI-generated insight with suggestions
   * @throws Error if API request fails
   * 
   * @example
   * ```typescript
   * const insight = await getMoodInsight([
   *   { mood: 3, emotions: ['anxious'], timestamp: '2024-01-01' }
   * ]);
   * ```
   */
  const getMoodInsight = useCallback(async (moodEntries: unknown[]): Promise<AIInsight> => {
    setLoading(true);
    try {
      const result = await post('/ai/mood-insight', { entries: moodEntries });
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Send a chat message to the AI therapist
   * 
   * @param message - User's message text
   * @param history - Previous conversation messages
   * @param mode - 'spiritual' for faith-based or 'general' for secular
   * @returns AI response text
   * @throws Error if API request fails
   */
  const chatWithTherapist = useCallback(async (
    message: string, 
    history: unknown[], 
    mode: 'spiritual' | 'general' = 'spiritual'
  ): Promise<string> => {
    setLoading(true);
    try {
      const result = await post('/ai/chat', { message, history, mode });
      return result.response;
    } finally {
      setLoading(false);
    }
  }, []);

  // ... additional methods documented similarly

  return { 
    getMoodInsight, 
    chatWithTherapist,
    // ... other exports
    loading 
  };
}
```

---

### Example 2: API Route Documentation

**File:** `server/routes/ai.ts`

```typescript
/**
 * @route POST /api/ai/chat
 * @desc Send a message to the AI chatbot
 * @access Private (requires authentication)
 * 
 * @body {string} message - User's message
 * @body {Array} history - Previous messages for context
 * @body {string} mode - 'spiritual' or 'general'
 * 
 * @returns {Object}
 * @returns {string} response - AI's response text
 * @returns {boolean} isCrisis - Whether crisis detected
 * 
 * @errors 400 - Invalid request body
 * @errors 401 - Not authenticated
 * @errors 500 - AI service error
 * 
 * @example
 * Request:
 * ```json
 * {
 *   "message": "I'm feeling anxious",
 *   "history": [],
 *   "mode": "spiritual"
 * }
 * ```
 * 
 * Response:
 * ```json
 * {
 *   "response": "I hear you. Anxiety can be challenging...",
 *   "isCrisis": false
 * }
 * ```
 */
router.post('/chat', validateBody(chatSchema), async (req, res) => {
  // Implementation
});
```

---

### Example 3: Component Documentation

**File:** `src/components/ui/Button.tsx`

```typescript
import React from 'react';

/**
 * Props for the Button component
 */
interface ButtonProps {
  /** Button content/label */
  children: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Visual style variant */
  variant?: 'primary' | 'secondary' | 'danger';
  /** Disable button interaction */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** HTML button type */
  type?: 'button' | 'submit' | 'reset';
}

/**
 * Reusable button component with sanctuary styling
 * 
 * Supports multiple variants and integrates with the design system.
 * Automatically applies appropriate colors, shadows, and hover states.
 * 
 * @example
 * ```tsx
 * <Button 
 *   variant="primary"
 *   onClick={handleSubmit}
 *   disabled={isLoading}
 * >
 *   Submit
 * </Button>
 * ```
 */
export function Button({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  className = '',
  type = 'button',
}: ButtonProps) {
  // Implementation
}
```

---

### Example 4: Database Schema Documentation

**File:** `server/db/schema.ts`

```typescript
/**
 * Users table
 * 
 * Stores core user information synced from Clerk authentication.
 * Links to all user-related data through userId foreign keys.
 * 
 * @relations
 * - moods: One-to-many
 * - goals: One-to-many
 * - memories: One-to-many
 * 
 * @indexed
 * - clerkId (unique)
 * - email
 */
export const users = pgTable('users', {
  /** Unique identifier */
  id: serial('id').primaryKey(),
  /** Clerk authentication ID */
  clerkId: text('clerk_id').notNull().unique(),
  /** User's email address */
  email: text('email').notNull(),
  /** Display name */
  name: text('name'),
  /** User preferences JSON */
  preferences: json('preferences').default({}),
  /** FCM token for push notifications */
  fcmToken: text('fcm_token'),
  /** Account creation timestamp */
  createdAt: timestamp('created_at').defaultNow(),
});
```

---

## Inline Comment Guidelines

### Use Inline Comments For:

1. **Complex Logic**
```typescript
// Calculate weighted average with decay for recent entries
const weightedSum = entries.reduce((sum, entry, index) => {
  const weight = Math.exp(-0.1 * (entries.length - index)); // Exponential decay
  return sum + entry.value * weight;
}, 0);
```

2. **Workarounds**
```typescript
// NOTE: iOS Safari requires this delay for smooth animations
// See: https://bugs.webkit.org/show_bug.cgi?id=12345
setTimeout(() => setIsVisible(true), 100);
```

3. **TODOs**
```typescript
// TODO: Add retry logic with exponential backoff
// Issue: #123
const response = await fetch(url);
```

4. **Warnings**
```typescript
// WARNING: This modifies the database state directly
// Only use for admin operations
await db.delete(users).where(eq(users.id, id));
```

### Don't Comment:
- Obvious code (`i++ // increment i`)
- What the code does (should be clear from code)
- Outdated information

---

## File Header Documentation

Every file should have a brief header:

```typescript
/**
 * AI Service Hooks
 * 
 * React hooks for interacting with AI services including chat,
 * mood analysis, and coaching features.
 * 
 * @module hooks/useAI
 */
```

---

## Documentation Checklist

Before submitting code, verify:

- [ ] All exported functions have JSDoc comments
- [ ] All components have prop documentation
- [ ] All interfaces/types have descriptions
- [ ] Complex logic has inline comments
- [ ] API routes have request/response docs
- [ ] Database tables have relation docs
- [ ] Examples are provided for complex functions
- [ ] Error conditions are documented

---

## Tools

### VSCode Extensions
- **JSDoc Tag Complete** - Auto-completion for JSDoc
- **Document This** - Generate JSDoc automatically
- **TypeDoc** - Generate documentation from TypeScript

### Generation
```bash
# Generate documentation
npx typedoc --out docs/typedoc src/
```

---

## Review Criteria

Documentation will be reviewed for:
1. Completeness - All exports documented?
2. Clarity - Easy to understand?
3. Accuracy - Matches implementation?
4. Examples - Helpful code samples?
5. Maintenance - Up to date?
