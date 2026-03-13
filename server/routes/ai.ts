import { Router } from 'express';
import OpenAI from 'openai';

const router = Router();

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    'HTTP-Referer': process.env.FRONTEND_URL,
    'X-Title': 'SoulSanctuary',
  },
});

router.post('/mood-insight', async (req, res) => {
  const { entries } = req.body;
  
  const completion = await openai.chat.completions.create({
    model: 'anthropic/claude-3.5-sonnet',
    messages: [
      {
        role: 'system',
        content: 'You are a compassionate mental health AI. Provide brief, insightful observations about mood patterns. Be supportive but not clinical.'
      },
      {
        role: 'user',
        content: `Analyze these mood entries and provide a gentle insight: ${JSON.stringify(entries)}`
      }
    ],
  });
  
  res.json({
    insight: completion.choices[0].message.content,
    suggestions: ['Practice deep breathing', 'Take a walk', 'Journal your thoughts'],
  });
});

router.post('/goal-coach', async (req, res) => {
  const { goal } = req.body;
  
  const completion = await openai.chat.completions.create({
    model: 'anthropic/claude-3.5-sonnet',
    messages: [
      {
        role: 'system',
        content: 'You are a motivational coach. Provide encouraging, actionable advice for achieving goals. Keep it under 2 sentences.'
      },
      {
        role: 'user',
        content: `Coach me on this goal: ${JSON.stringify(goal)}`
      }
    ],
  });
  
  res.json({
    insight: completion.choices[0].message.content,
    suggestions: ['Break it into smaller steps', 'Celebrate small wins'],
  });
});

router.post('/chat', async (req, res) => {
  const { message, history } = req.body;
  
  const completion = await openai.chat.completions.create({
    model: 'anthropic/claude-3.5-sonnet',
    messages: [
      {
        role: 'system',
        content: 'You are a supportive wellness companion. Provide empathetic, helpful responses. Never provide medical advice. If user indicates crisis, direct to professional help.'
      },
      ...history.map((h: any) => ({ role: h.role, content: h.content })),
      { role: 'user', content: message }
    ],
  });
  
  res.json({ response: completion.choices[0].message.content });
});

export default router;
