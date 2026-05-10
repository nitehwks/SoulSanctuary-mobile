// =============================================================================
// COACHING FRAMEWORKS - Static data and configuration
// Integrates CBT, DBT, Mindfulness, 12-Step, and Trauma-Informed approaches
// with biblical wisdom and personalized scripture guidance
// =============================================================================

import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.FRONTEND_URL || 'https://soulsanctuary.app',
    'X-Title': 'SoulSanctuary',
  },
});

/** Check if API key is configured */
export const hasValidApiKey = !!process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.startsWith('sk-');

/** Model used for coaching-related AI completions */
export const COACHING_MODEL = 'anthropic/claude-3.5-sonnet';

export { openai };

// =============================================================================
// THERAPEUTIC FRAMEWORKS
// =============================================================================

/** Definition of a therapeutic framework with biblical integration */
export interface TherapeuticFramework {
  name: string;
  description: string;
  techniques: string[];
  biblicalIntegration: string;
  applicableConditions: string[];
}

/** Evidence-based therapeutic frameworks integrated with biblical wisdom */
export const THERAPEUTIC_FRAMEWORKS: Record<string, TherapeuticFramework> = {
  cbt: {
    name: 'Cognitive Behavioral Therapy (CBT)',
    description: 'Identifies and changes negative thought patterns and behaviors',
    techniques: [
      'Thought challenging and restructuring',
      'Behavioral activation',
      'Cognitive reframing',
      'Exposure therapy',
      'Activity scheduling',
    ],
    biblicalIntegration: 'Romans 12:2 - "Transforming the mind by renewing it". Taking thoughts captive (2 Cor 10:5).',
    applicableConditions: ['depression', 'anxiety', 'ptsd', 'ocd', 'phobias'],
  },
  dbt: {
    name: 'Dialectical Behavior Therapy (DBT)',
    description: 'Balances acceptance and change through mindfulness and skills training',
    techniques: [
      'Mindfulness skills (observe, describe, participate)',
      'Distress tolerance (TIPP, radical acceptance)',
      'Emotion regulation (check the facts, opposite action)',
      'Interpersonal effectiveness (DEAR MAN)',
    ],
    biblicalIntegration: 'Wise mind aligns with the "peace of God that transcends understanding" (Phil 4:7). Radical acceptance mirrors surrender to God\'s will.',
    applicableConditions: ['bpd', 'emotional_dysregulation', 'self_harm', 'suicidal_ideation'],
  },
  mindfulness: {
    name: 'Mindfulness-Based Therapy',
    description: 'Present-moment awareness and acceptance without judgment',
    techniques: [
      'Body scan meditation',
      'Breath awareness',
      'Loving-kindness meditation',
      'Urge surfing',
      'Grounding techniques (5-4-3-2-1)',
    ],
    biblicalIntegration: '"Be still and know that I am God" (Psalm 46:10). Present-moment awareness as form of prayer.',
    applicableConditions: ['anxiety', 'depression', 'addiction', 'chronic_pain'],
  },
  trauma_informed: {
    name: 'Trauma-Informed Care',
    description: 'Recognizes trauma impact and emphasizes safety, trust, and empowerment',
    techniques: [
      'Grounding and stabilization',
      'Window of tolerance awareness',
      'Somatic experiencing basics',
      'Safe place visualization',
      'Trauma narrative processing (when ready)',
    ],
    biblicalIntegration: 'Psalm 147:3 - "He heals the brokenhearted". God as refuge and fortress (Psalm 91).',
    applicableConditions: ['ptsd', 'complex_ptsd', 'childhood_trauma', 'abuse'],
  },
  twelve_step: {
    name: '12-Step Integration',
    description: 'Spiritual program for recovery from addiction',
    techniques: [
      'Admitting powerlessness',
      'Surrender to Higher Power',
      'Moral inventory',
      'Amends making',
      'Continued spiritual growth',
    ],
    biblicalIntegration: 'Step 2 (Higher Power) aligns with surrender to God. Step 4 (inventory) with Psalm 139:23-24.',
    applicableConditions: ['addiction', 'alcoholism', 'codependency'],
  },
  act: {
    name: 'Acceptance and Commitment Therapy (ACT)',
    description: 'Accepts difficult thoughts while committing to value-based action',
    techniques: [
      'Cognitive defusion',
      'Acceptance of internal experiences',
      'Values clarification',
      'Committed action',
      'Self-as-context',
    ],
    biblicalIntegration: 'Accepting suffering as part of the Christian walk (1 Peter 4:12-13). Living by values (Colossians 3:23).',
    applicableConditions: ['anxiety', 'depression', 'chronic_pain', 'ocd'],
  },
};

// =============================================================================
// BIBLICAL RESOURCE LIBRARY
// =============================================================================

/** A biblical scripture resource with therapeutic application notes */
export interface BiblicalResource {
  reference: string;
  text: string;
  theme: string;
  therapeuticApplication: string;
  context: string;
}

/** Library of biblical resources organized by therapeutic theme */
export const BIBLICAL_RESOURCES: BiblicalResource[] = [
  // Anxiety & Fear
  {
    reference: 'Philippians 4:6-7',
    text: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.',
    theme: 'anxiety',
    therapeuticApplication: 'Prayer and gratitude as anxiety management. The concept of a "peace that guards" like a soldier protects a city.',
    context: 'Paul writing from prison, teaching joy and peace despite circumstances',
  },
  {
    reference: 'Matthew 6:25-34',
    text: 'Therefore I tell you, do not worry about your life... Can any one of you by worrying add a single hour to your life?',
    theme: 'anxiety',
    therapeuticApplication: 'Cognitive reframing of worry. Focus on present moment (one day at a time).',
    context: 'Sermon on the Mount - Jesus teaching about trust in God\'s provision',
  },
  // Depression & Despair
  {
    reference: 'Psalm 42:11',
    text: 'Why, my soul, are you downcast? Why so disturbed within me? Put your hope in God, for I will yet praise him, my Savior and my God.',
    theme: 'depression',
    therapeuticApplication: 'Self-dialogue technique. Speaking truth to downcast emotions. Hope as action.',
    context: 'Psalmist expressing deep longing for God while in distress',
  },
  {
    reference: 'Isaiah 41:10',
    text: 'So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.',
    theme: 'depression',
    therapeuticApplication: 'Affirmation of presence and support. Countering isolation thoughts.',
    context: 'God\'s promise to Israel in exile',
  },
  // Trauma & Healing
  {
    reference: 'Psalm 147:3',
    text: 'He heals the brokenhearted and binds up their wounds.',
    theme: 'trauma',
    therapeuticApplication: 'Validation of pain. Hope for healing. God as healer.',
    context: 'Psalm praising God for His care and restoration',
  },
  {
    reference: 'Psalm 91:1-2',
    text: 'Whoever dwells in the shelter of the Most High will rest in the shadow of the Almighty. I will say of the Lord, "He is my refuge and my fortress, my God, in whom I trust."',
    theme: 'trauma',
    therapeuticApplication: 'Safe place visualization. Imagining God as fortress/shelter.',
    context: 'Assurance of God\'s protection',
  },
  // Addiction & Recovery
  {
    reference: '1 Corinthians 10:13',
    text: 'No temptation has overtaken you except what is common to mankind. And God is faithful; he will not let you be tempted beyond what you can bear. But when you are tempted, he will also provide a way out so that you can endure it.',
    theme: 'addiction',
    therapeuticApplication: 'Normalization of struggle. Hope for escape routes. God\'s faithfulness.',
    context: 'Paul teaching about temptation and God\'s provision',
  },
  {
    reference: 'James 5:16',
    text: 'Therefore confess your sins to each other and pray for each other so that you may be healed. The prayer of a righteous person is powerful and effective.',
    theme: 'addiction',
    therapeuticApplication: 'Power of community and confession. Breaking isolation.',
    context: 'James teaching on prayer and community',
  },
  // Identity & Self-Worth
  {
    reference: 'Ephesians 2:10',
    text: 'For we are God\'s handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do.',
    theme: 'identity',
    therapeuticApplication: 'Positive self-concept. Purpose and meaning. Countering worthlessness.',
    context: 'Paul on salvation by grace and our new identity',
  },
  {
    reference: 'Psalm 139:13-14',
    text: 'For you created my inmost being; you knit me together in my mother\'s womb. I praise you because I am fearfully and wonderfully made.',
    theme: 'identity',
    therapeuticApplication: 'Self-compassion. Body acceptance. Divine craftsmanship.',
    context: 'David\'s reflection on God\'s intimate knowledge of him',
  },
];

// =============================================================================
// COACHING TYPES
// =============================================================================

/** A personalized coaching plan for a user */
export interface CoachingPlan {
  id: string;
  userId: string;
  version: number;
  primaryFocus: string[];
  therapeuticMethods: string[];
  milestones: CoachingMilestone[];
  spiritualPractices: string[];
  scriptureFocus: string[];
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
}

/** A milestone within a coaching plan */
export interface CoachingMilestone {
  id: string;
  category: string;
  title: string;
  description: string;
  therapeuticMethod: string;
  scriptureSupport: string[];
  exercises: Exercise[];
  targetWeek: number;
  status: 'pending' | 'in_progress' | 'completed';
}

/** An exercise assigned as part of a coaching milestone */
export interface Exercise {
  name: string;
  type: 'worksheet' | 'meditation' | 'journal' | 'practical';
  description: string;
  duration: number; // minutes
  biblicalConnection?: string;
}

/** Context provided when generating a coach response */
export interface CoachContext {
  userId: string;
  message: string;
  conversationHistory: { role: 'user' | 'assistant'; content: string }[];
}
