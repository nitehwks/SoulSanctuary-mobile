import { Router } from 'express';
import chatRouter from './chat';
import insightsRouter from './insights';
import coachingRouter from './coaching';

const router = Router();

// Mount sub-routers
router.use('/', chatRouter);
router.use('/', insightsRouter);
router.use('/', coachingRouter);

export default router;
