# SoulSanctuary Comprehensive Coaching System

## Overview

This system transforms SoulSanctuary from a simple chatbot into a sophisticated **AI Spiritual Guide** that:

1. **Learns about the user** through conversation analysis
2. **Builds an encrypted psychological, spiritual, and behavioral profile**
3. **Uses Bible + DSM-5 + Evidence-Based Therapies** (CBT, DBT, Mindfulness, 12-Step, Trauma-Informed)
4. **Creates personalized coaching plans** that evolve with the user
5. **Provides premium curriculum** content tailored to individual needs

---

## Architecture

### Data Layer (Encrypted)

All sensitive user data is encrypted at rest using AES-256-GCM:

```
┌─────────────────────────────────────────────────────────────┐
│                    USER PROFILE DATABASE                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  user_psychological_profile                                 │
│  ├── encryptedProfileData (JSON: anxietyHistory,            │
│  │   depressionHistory, traumaAcknowledged, etc.)           │
│  ├── anxietyLevel (0-10)                                    │
│  ├── depressionLevel (0-10)                                 │
│  ├── traumaIndicators (boolean)                             │
│  └── conversationsAnalyzed                                  │
│                                                             │
│  user_spiritual_profile                                     │
│  ├── encryptedProfileData (JSON: spiritualThemes,           │
│  │   faithJourneyNotes, scriptureComfort, etc.)             │
│  ├── faithJourneyStage (seeker/growing/mature)              │
│  ├── comfortScriptures []                                   │
│  └── struggleAreas []                                       │
│                                                             │
│  user_behavioral_patterns                                   │
│  ├── encryptedPatternsData (JSON: triggers,                 │
│  │   copingStrategies, isolationPatterns, etc.)             │
│  ├── identifiedTriggers []                                  │
│  └── crisisRisk (0-10)                                      │
│                                                             │
│  user_substance_profile                                     │
│  ├── encryptedProfileData (JSON: substanceMentions,         │
│  │   recoveryHistory, relapseRiskHistory, etc.)             │
│  ├── hasSubstanceHistory                                    │
│  ├── inRecovery                                             │
│  └── relapseRiskLevel                                       │
│                                                             │
│  user_relationships                                         │
│  ├── encryptedRelationshipData                              │
│  ├── relationshipType                                       │
│  └── relationshipQuality (1-10)                             │
│                                                             │
│  coaching_plans                                             │
│  ├── encryptedPlanData (JSON: full plan with milestones)    │
│  ├── primaryFocus []                                        │
│  ├── therapeuticMethods []                                  │
│  └── overallProgress (0-100)                                │
│                                                             │
│  conversation_insights                                      │
│  ├── encryptedInsights (detailed analysis)                  │
│  ├── emotionalThemes []                                     │
│  ├── spiritualThemes []                                     │
│  └── clinicalIndicators (depression, anxiety, etc.)         │
│                                                             │
│  user_interaction_memory                                    │
│  ├── encryptedMemoryData                                    │
│  ├── preferredCommunicationStyle                            │
│  └── effectiveInterventions []                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## How It Works

### 1. Learning Mode (Chat Mode)

When the user is in "Chat" mode:
- Conversations are **analyzed after every 5 messages**
- AI extracts: emotional themes, spiritual themes, behavioral patterns
- Updates psychological indicators (anxiety, depression, trauma)
- Identifies substance use indicators
- Maps relationship dynamics
- Learns communication preferences

**Analysis includes:**
- DSM-5 aligned mental health screening
- Biblical themes identification
- Crisis risk assessment
- Personal growth tracking

### 2. Coach Mode

When the user switches to "Coach" mode:
- AI has **full access** to the encrypted user profile
- Responses are **personalized** based on:
  - Known triggers and effective interventions
  - Spiritual journey stage
  - Preferred communication style
  - Response to scripture
  - Active therapeutic methods
  - Current coaching plan milestones

**Coach provides:**
- Relevant scripture references
- Specific therapeutic techniques (CBT/DBT/Mindfulness)
- Practical exercises from the user's plan
- Trauma-informed language when needed
- 12-step integration for recovery

### 3. Coaching Plan Generation

Based on accumulated profile data, the system generates a **12-week personalized plan**:

```javascript
{
  primaryFocus: ['anxiety_management', 'spiritual_growth'],
  therapeuticMethods: ['cbt', 'mindfulness', 'trauma_informed'],
  milestones: [
    {
      week: 1,
      title: 'Building Safety and Trust',
      technique: 'Safe Place Visualization',
      scripture: 'Psalm 91:1-2',
      exercise: 'Guided imagery with God as fortress'
    },
    // ... 12 weeks
  ],
  scriptureFocus: ['Philippians 4:6-7', 'Psalm 23', 'Isaiah 41:10'],
  riskLevel: 'moderate'
}
```

---

## Therapeutic Integration

### CBT (Cognitive Behavioral Therapy)
**Biblical Integration:** Romans 12:2 - "Transforming the mind"

**Techniques:**
- Thought challenging and restructuring
- Cognitive reframing
- Taking thoughts captive (2 Cor 10:5)

**When Used:**
- Depression symptoms
- Anxiety disorders
- Negative thought patterns

---

### DBT (Dialectical Behavior Therapy)
**Biblical Integration:** "Peace of God that transcends understanding" (Phil 4:7)

**Techniques:**
- Mindfulness skills (observe, describe, participate)
- Distress tolerance (TIPP, radical acceptance)
- Emotion regulation (check the facts, opposite action)
- Interpersonal effectiveness (DEAR MAN)

**When Used:**
- Emotional dysregulation
- Borderline traits
- Self-harm history

---

### Trauma-Informed Care
**Biblical Integration:** Psalm 147:3 - "He heals the brokenhearted"

**Techniques:**
- Grounding and stabilization
- Window of tolerance awareness
- Somatic experiencing basics
- Safe place visualization
- Trauma narrative processing (when ready)

**When Used:**
- PTSD/C-PTSD
- Childhood trauma
- Abuse history

---

### 12-Step Integration
**Biblical Integration:** Step 2 aligns with surrender to God

**Techniques:**
- Admitting powerlessness
- Surrender to Higher Power
- Moral inventory (Psalm 139:23-24)
- Amends making
- Continued spiritual growth

**When Used:**
- Addiction recovery
- Alcoholism
- Codependency

---

### Mindfulness
**Biblical Integration:** "Be still and know that I am God" (Psalm 46:10)

**Techniques:**
- Body scan meditation
- Breath awareness
- Loving-kindness meditation
- Urge surfing
- Grounding techniques (5-4-3-2-1)

**When Used:**
- Anxiety
- Addiction cravings
- Present-moment awareness

---

### ACT (Acceptance and Commitment Therapy)
**Biblical Integration:** Accepting suffering as part of Christian walk (1 Peter 4:12-13)

**Techniques:**
- Cognitive defusion
- Values clarification
- Committed action
- Self-as-context

**When Used:**
- Chronic conditions
- Values clarification
- Acceptance work

---

## API Endpoints

### Conversation Analysis
```http
POST /api/ai/analyze-conversation
{
  "messages": [...],
  "sessionId": "uuid"
}
```

### Coach Response (Full Profile)
```http
POST /api/ai/coach-response
{
  "message": "I'm feeling anxious today",
  "history": [...]
}

Response:
{
  "response": "...",
  "suggestedScripture": "Philippians 4:6-7",
  "recommendedExercise": "Box breathing",
  "technique": "CBT thought challenging"
}
```

### Generate Coaching Plan
```http
POST /api/ai/coaching-plan

Response:
{
  "success": true,
  "plan": {
    "id": "uuid",
    "primaryFocus": ["anxiety_management", "spiritual_growth"],
    "therapeuticMethods": ["cbt", "mindfulness"],
    "milestonesCount": 12
  }
}
```

### Get User Insights (Summary)
```http
GET /api/ai/user-insights

Response:
{
  "hasData": true,
  "summary": {
    "recentThemes": ["anxiety", "work_stress"],
    "spiritualThemes": ["trust", "surrender"],
    "progressIndicators": {
      "depressionImprovement": true,
      "spiritualGrowth": true
    }
  }
}
```

### Premium Curriculum
```http
POST /api/ai/curriculum
{
  "topic": "Anxiety and Faith"
}

Response:
{
  "content": "...",
  "exercises": [...],
  "scriptures": ["..."]
}
```

---

## Frontend Usage

### Mode Toggle
```tsx
// In Coach.tsx
const [chatMode, setChatMode] = useState<'spiritual' | 'general'>('spiritual');

// Toggle buttons
<button onClick={() => switchMode('spiritual')}>Coach</button>
<button onClick={() => switchMode('general')}>Chat</button>
```

### Automatic Analysis
```tsx
// After every 5 messages in spiritual mode
if (chatMode === 'spiritual' && messages.length % 5 === 0) {
  analyzeConversation(allMessages);
}
```

### Using Coach Response
```tsx
const { getCoachResponse } = useAI();

const result = await getCoachResponse(message, history);
// result.response - AI's personalized response
// result.suggestedScripture - Relevant Bible verse
// result.recommendedExercise - Practical exercise
// result.technique - Therapeutic method used
```

---

## Premium Curriculum Framework

The system supports premium content generation:

### Curriculum Modules
- **Mental Health**: Anxiety, Depression, Trauma
- **Spiritual Growth**: Prayer, Scripture study, Spiritual disciplines
- **Addiction Recovery**: 12-step work, relapse prevention
- **Relationships**: Boundaries, communication, healing

### Each Module Includes:
1. **Teaching Content** (Markdown)
2. **Therapeutic Exercises** (CBT worksheets, DBT skills)
3. **Spiritual Integration** (Scripture, prayer guides)
4. **Practical Application** (Homework, real-world practice)
5. **Progress Tracking** (Completion, reflections, insights)

---

## Security & Privacy

### Encryption
- All profile data encrypted with **AES-256-GCM**
- User-specific keys derived from master key
- Authenticated encryption prevents tampering

### Data Access
- Only accessible by the authenticated user
- App cannot decrypt without user's session
- No plaintext sensitive data in logs

### Crisis Protocol
- Crisis detection runs on every message
- High/critical risk immediately triggers 988 resources
- Crisis events logged with severity

---

## Files Created/Modified

### New Files:
1. `server/db/userProfileSchema.ts` - Database schema
2. `server/services/profileEncryption.ts` - Encryption layer
3. `server/services/conversationAnalysis.ts` - AI analysis engine
4. `server/services/comprehensiveCoaching.ts` - Coaching system
5. `COMPREHENSIVE_COACHING_SYSTEM.md` - This documentation

### Modified Files:
1. `server/db/index.ts` - Added new schema exports
2. `server/db/schema.ts` - Added relations
3. `server/routes/ai.ts` - New endpoints
4. `src/hooks/useAI.ts` - New methods
5. `src/pages/dashboard/Coach.tsx` - Mode toggle & integration

---

## Next Steps for Curriculum

To implement your premium curriculum offering:

1. **Create curriculum content** in `curriculumModules` table
2. **Set `isPremium: true`** for premium modules
3. **Implement subscription check** in `/api/ai/curriculum` endpoint
4. **Add progress tracking** UI for curriculum completion
5. **Create certificate generation** for completed tracks

---

## Theological Foundation

This system is designed as a **spiritual guide**, not a replacement for:
- Licensed therapists
- Pastoral counseling
- Medical professionals
- 12-step sponsors

It integrates clinical wisdom with biblical truth while respecting professional boundaries.

**Key Principles:**
- Scripture as foundation, therapy as tool
- Never diagnose - always encourage professional help
- Crisis situations always direct to 988
- Spiritual growth integrated with mental health
- User autonomy and consent central

---

## License & Ethics

- All therapeutic content evidence-based
- Scripture references from major translations
- Crisis protocols follow best practices
- Encryption meets healthcare standards
- User data never shared or sold
