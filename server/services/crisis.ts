import { db } from '../db';
import { crisisEvents, users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { sendPushNotification, sendToMultipleUsers } from './notification';
import { detectCrisis } from './ai';

interface CrisisAlert {
  isCrisis: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  trigger: string;
  resources: CrisisResource[];
}

interface CrisisResource {
  type: 'hotline' | 'text' | 'chat' | 'local';
  name: string;
  contact: string;
  description: string;
  available: string;
}

const CRISIS_RESOURCES: CrisisResource[] = [
  {
    type: 'hotline',
    name: '988 Suicide & Crisis Lifeline',
    contact: '988',
    description: '24/7 free and confidential support for people in distress',
    available: '24/7'
  },
  {
    type: 'text',
    name: 'Crisis Text Line',
    contact: 'Text HOME to 741741',
    description: 'Free 24/7 support via text message',
    available: '24/7'
  },
  {
    type: 'chat',
    name: '988 Lifeline Chat',
    contact: '988lifeline.org/chat',
    description: 'Online chat with crisis counselor',
    available: '24/7'
  },
  {
    type: 'hotline',
    name: 'SAMHSA National Helpline',
    contact: '1-800-662-4357',
    description: 'Treatment referral and information service',
    available: '24/7'
  }
];

/**
 * Analyze mood data for crisis indicators
 */
export async function analyzeMoodForCrisis(moodData: {
  mood: number;
  note?: string;
  emotions: string[];
}): Promise<CrisisAlert | null> {
  // Check for critical mood scores
  if (moodData.mood <= 1) {
    // Very low mood - check note content for crisis indicators
    const note = moodData.note || '';
    const crisisDetection = await detectCrisis(note);
    
    if (crisisDetection.isCrisis) {
      return {
        isCrisis: true,
        severity: crisisDetection.severity,
        trigger: note,
        resources: getResourcesForSeverity(crisisDetection.severity)
      };
    }
  }

  // Check for concerning emotion patterns
  const concerningEmotions = ['hopeless', 'worthless', 'empty', 'numb', 'trapped'];
  const hasConcerningEmotions = moodData.emotions.some(e => 
    concerningEmotions.includes(e.toLowerCase())
  );

  if (hasConcerningEmotions && moodData.mood <= 2) {
    return {
      isCrisis: true,
      severity: 'medium',
      trigger: `Emotions: ${moodData.emotions.join(', ')}`,
      resources: getResourcesForSeverity('medium')
    };
  }

  return null;
}

/**
 * Get appropriate resources based on severity
 */
function getResourcesForSeverity(severity: string): CrisisResource[] {
  switch (severity) {
    case 'critical':
    case 'high':
      return CRISIS_RESOURCES; // All resources
    case 'medium':
      return CRISIS_RESOURCES.slice(0, 3); // Phone, text, chat
    case 'low':
      return CRISIS_RESOURCES.slice(0, 2); // Phone, text
    default:
      return CRISIS_RESOURCES.slice(0, 1);
  }
}

/**
 * Notify emergency contacts about a crisis
 */
export async function notifyEmergencyContacts(
  userId: string,
  severity: string
): Promise<void> {
  try {
    // Get user's emergency contacts
    const contacts = await db.query.emergencyContacts.findMany({
      where: (contacts, { and, eq }) => and(
        eq(contacts.userId, userId),
        eq(contacts.notifyOnCrisis, true)
      ),
    });

    if (contacts.length === 0) {
      console.log(`No emergency contacts found for user ${userId}`);
      return;
    }

    // Get user details
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    const userName = user?.name || 'Someone you care about';

    // Send notifications to all contacts
    const contactUserIds = contacts.map(c => c.userId);
    
    await sendToMultipleUsers(
      contactUserIds,
      '🚨 Crisis Alert',
      `${userName} may be experiencing a mental health crisis. Severity: ${severity}. Please reach out to them.`,
      {
        type: 'crisis',
        severity,
        userId,
        timestamp: new Date().toISOString()
      }
    );

    // Send email if we had email service
    // await sendEmailToContacts(contacts, userName, severity);

    console.log(`Emergency contacts notified for user ${userId}`);
  } catch (error) {
    console.error('Failed to notify emergency contacts:', error);
    throw error;
  }
}

/**
 * Log a crisis event
 */
export async function logCrisisEvent(
  userId: string,
  severity: string,
  trigger: string,
  response: string,
  resourcesAccessed: string[] = []
): Promise<void> {
  await db.insert(crisisEvents).values({
    userId,
    severity: severity as any,
    trigger,
    response,
    resourcesAccessed,
    resolved: false,
  });
}

/**
 * Get crisis resources
 */
export function getCrisisResources(): CrisisResource[] {
  return CRISIS_RESOURCES;
}

/**
 * Handle immediate crisis intervention
 * This is called when a user indicates they're in crisis
 */
export async function handleCrisisIntervention(
  userId: string,
  context?: { note?: string; mood?: number }
): Promise<{
  resources: CrisisResource[];
  message: string;
  actions: string[];
}> {
  // Analyze severity
  let severity: string = 'medium';
  
  if (context?.mood && context.mood <= 1) {
    severity = 'high';
  }
  
  if (context?.note) {
    const detection = await detectCrisis(context.note);
    if (detection.isCrisis) {
      severity = detection.severity;
    }
  }

  // Log the crisis event
  await logCrisisEvent(
    userId,
    severity,
    context?.note || 'User initiated crisis intervention',
    'auto_triggered',
    []
  );

  // Notify emergency contacts for high/critical severity
  if (severity === 'high' || severity === 'critical') {
    await notifyEmergencyContacts(userId, severity).catch(err => {
      console.error('Failed to notify emergency contacts:', err);
    });
  }

  // Send push notification to user with resources
  await sendPushNotification(
    userId,
    'You\'re not alone',
    'Crisis support resources are available. Tap to see options.',
    {
      type: 'crisis_support',
      severity,
      timestamp: new Date().toISOString()
    }
  ).catch(err => {
    console.error('Failed to send crisis notification:', err);
  });

  return {
    resources: getResourcesForSeverity(severity),
    message: getCrisisMessage(severity),
    actions: getRecommendedActions(severity)
  };
}

/**
 * Get appropriate crisis message based on severity
 */
function getCrisisMessage(severity: string): string {
  switch (severity) {
    case 'critical':
      return 'We\'re very concerned about you. Please reach out to one of these resources immediately - they\'re here to help 24/7.';
    case 'high':
      return 'It sounds like you\'re going through a really difficult time. These resources can provide immediate support.';
    case 'medium':
      return 'We care about you. These resources are available if you need someone to talk to.';
    default:
      return 'Remember, it\'s okay to ask for help. These resources are here when you need them.';
  }
}

/**
 * Get recommended actions based on severity
 */
function getRecommendedActions(severity: string): string[] {
  const baseActions = [
    'Take slow, deep breaths',
    'Reach out to someone you trust',
    'Move to a safe, comfortable space'
  ];

  if (severity === 'critical' || severity === 'high') {
    return [
      'Call or text a crisis line now',
      'Stay with someone you trust',
      'Remove anything that could be used to harm yourself',
      ...baseActions
    ];
  }

  return baseActions;
}

/**
 * Mark crisis event as resolved
 */
export async function resolveCrisisEvent(eventId: string): Promise<void> {
  await db.update(crisisEvents)
    .set({ 
      resolved: true,
    })
    .where(eq(crisisEvents.id, eventId));
}

/**
 * Get user's crisis history
 */
export async function getCrisisHistory(userId: string): Promise<any[]> {
  return db.query.crisisEvents.findMany({
    where: eq(crisisEvents.userId, userId),
    orderBy: (events, { desc }) => [desc(events.timestamp)],
  });
}
