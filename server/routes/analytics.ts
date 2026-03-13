import { Router } from 'express';
import { db } from '../db';
import { moods } from '../db/schema';
import { eq, sql } from 'drizzle-orm';

const router = Router();

router.get('/moods', async (req: any, res) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const data = await db.select({
    date: sql`DATE(${moods.timestamp})`,
    mood: sql`AVG(${moods.mood})`,
  })
  .from(moods)
  .where(eq(moods.userId, req.auth.userId))
  .groupBy(sql`DATE(${moods.timestamp})`)
  .orderBy(sql`DATE(${moods.timestamp})`);
  
  res.json(data);
});

export default router;
