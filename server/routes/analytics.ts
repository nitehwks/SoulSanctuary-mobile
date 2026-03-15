import { Router } from 'express';
import { db } from '../db';
import { moods, goals, memories, users } from '../db/schema';
import { eq, sql, and, gte } from 'drizzle-orm';

const router = Router();

/**
 * GET /api/analytics/moods
 * Get 30-day mood trend data
 */
router.get('/moods', async (req: any, res) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, req.auth.userId),
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const data = await db
      .select({
        date: sql<string>`DATE(${moods.timestamp})`,
        mood: sql<number>`ROUND(AVG(${moods.mood})::numeric, 1)`,
      })
      .from(moods)
      .where(
        and(
          eq(moods.userId, user.id),
          gte(moods.timestamp, thirtyDaysAgo)
        )
      )
      .groupBy(sql`DATE(${moods.timestamp})`)
      .orderBy(sql`DATE(${moods.timestamp})`);

    res.json(data);
  } catch (error) {
    console.error('Mood analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch mood analytics' });
  }
});

/**
 * GET /api/analytics/summary
 * Get summary statistics for the dashboard
 */
router.get('/summary', async (req: any, res) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, req.auth.userId),
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get date ranges
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    // Average mood (last 30 days)
    const [avgMoodResult] = await db
      .select({
        average: sql<number | null>`ROUND(AVG(${moods.mood})::numeric, 1)`,
        count: sql<number>`COUNT(*)`,
      })
      .from(moods)
      .where(
        and(
          eq(moods.userId, user.id),
          gte(moods.timestamp, thirtyDaysAgo)
        )
      );

    // Goals completed
    const [goalsResult] = await db
      .select({
        total: sql<number>`COUNT(*)`,
        completed: sql<number>`COUNT(CASE WHEN ${goals.status} = 'completed' THEN 1 END)`,
      })
      .from(goals)
      .where(eq(goals.userId, user.id));

    // Journal entries (memories)
    const [memoriesResult] = await db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(memories)
      .where(
        and(
          eq(memories.userId, user.id),
          gte(memories.timestamp, thirtyDaysAgo)
        )
      );

    // Calculate streak (consecutive days with mood entries)
    const streakDays = await calculateStreak(user.id);

    // Weekly trend (last 7 days average)
    const [weeklyResult] = await db
      .select({
        average: sql<number | null>`ROUND(AVG(${moods.mood})::numeric, 1)`,
      })
      .from(moods)
      .where(
        and(
          eq(moods.userId, user.id),
          gte(moods.timestamp, sevenDaysAgo)
        )
      );

    // Emotion distribution
    const emotionData = await db
      .select({
        emotions: moods.emotions,
      })
      .from(moods)
      .where(
        and(
          eq(moods.userId, user.id),
          gte(moods.timestamp, thirtyDaysAgo)
        )
      );

    const emotionCounts: Record<string, number> = {};
    emotionData.forEach((entry: any) => {
      const emotions = entry.emotions || [];
      emotions.forEach((emotion: string) => {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      });
    });

    const topEmotions = Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([emotion, count]) => ({ emotion, count }));

    res.json({
      averageMood: avgMoodResult?.average || 0,
      totalMoodEntries: avgMoodResult?.count || 0,
      goalsCompleted: goalsResult?.completed || 0,
      totalGoals: goalsResult?.total || 0,
      journalEntries: memoriesResult?.count || 0,
      streakDays: streakDays,
      weeklyTrend: weeklyResult?.average || 0,
      topEmotions: topEmotions,
    });
  } catch (error) {
    console.error('Summary analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch summary analytics' });
  }
});

/**
 * GET /api/analytics/emotions
 * Get emotion distribution
 */
router.get('/emotions', async (req: any, res) => {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, req.auth.userId),
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const emotionData = await db
      .select({
        emotions: moods.emotions,
      })
      .from(moods)
      .where(
        and(
          eq(moods.userId, user.id),
          gte(moods.timestamp, thirtyDaysAgo)
        )
      );

    const emotionCounts: Record<string, number> = {};
    emotionData.forEach((entry: any) => {
      const emotions = entry.emotions || [];
      emotions.forEach((emotion: string) => {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      });
    });

    const chartData = Object.entries(emotionCounts).map(([emotion, count]) => ({
      emotion,
      count,
    }));

    res.json(chartData);
  } catch (error) {
    console.error('Emotion analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch emotion analytics' });
  }
});

/**
 * Calculate current streak of consecutive days with mood entries
 */
async function calculateStreak(userId: string): Promise<number> {
  try {
    // Get all mood dates for the user, ordered by date
    const moodDates = await db
      .select({
        date: sql<string>`DATE(${moods.timestamp})`,
      })
      .from(moods)
      .where(eq(moods.userId, userId))
      .groupBy(sql`DATE(${moods.timestamp})`)
      .orderBy(sql`DATE(${moods.timestamp}) DESC`);

    if (moodDates.length === 0) {
      return 0;
    }

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Check if there's an entry for today or yesterday to start the streak
    const dateStrings = moodDates.map((d: any) => d.date);
    const todayStr = currentDate.toISOString().split('T')[0];
    
    const yesterday = new Date(currentDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Streak is valid if there's an entry today or yesterday
    if (!dateStrings.includes(todayStr) && !dateStrings.includes(yesterdayStr)) {
      return 0;
    }

    // Count consecutive days
    for (let i = 0; i < dateStrings.length; i++) {
      const entryDate = new Date(dateStrings[i]);
      entryDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(currentDate);
      expectedDate.setDate(expectedDate.getDate() - i);

      if (entryDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else if (i === 0 && entryDate.getTime() === yesterday.getTime()) {
        // If no entry today but there is one yesterday, start from yesterday
        streak++;
        currentDate = yesterday;
      } else {
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error('Failed to calculate streak:', error);
    return 0;
  }
}

export default router;
