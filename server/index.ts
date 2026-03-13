import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import moodRoutes from './routes/moods';
import goalRoutes from './routes/goals';
import memoryRoutes from './routes/memories';
import aiRoutes from './routes/ai';
import crisisRoutes from './routes/crisis';
import analyticsRoutes from './routes/analytics';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Protected routes
app.use('/api/moods', ClerkExpressRequireAuth(), moodRoutes);
app.use('/api/goals', ClerkExpressRequireAuth(), goalRoutes);
app.use('/api/memories', ClerkExpressRequireAuth(), memoryRoutes);
app.use('/api/ai', ClerkExpressRequireAuth(), aiRoutes);
app.use('/api/crisis', ClerkExpressRequireAuth(), crisisRoutes);
app.use('/api/analytics', ClerkExpressRequireAuth(), analyticsRoutes);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
