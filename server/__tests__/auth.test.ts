import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import request from 'supertest';
import type { Express } from 'express';

// Mock OpenAI BEFORE importing ai service
class MockOpenAI {
  chat = {
    completions: {
      create: vi.fn().mockResolvedValue({
        choices: [{ message: { content: 'Test response' } }],
      }),
    },
  };
}

vi.mock('openai', () => {
  return {
    __esModule: true,
    default: MockOpenAI,
  };
});

// Mock Firebase Admin BEFORE importing notification service
vi.mock('firebase-admin', () => {
  return {
    initializeApp: vi.fn(),
    credential: {
      cert: vi.fn().mockReturnValue({}),
    },
    messaging: vi.fn().mockReturnValue({
      send: vi.fn().mockResolvedValue('message-id'),
    }),
    apps: [],
  };
});

// Mock the database before importing anything that uses it
vi.mock('../db', () => {
  const mockUsers: any[] = [];
  return {
    db: {
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{
            id: 'test-uuid-123',
            clerkId: 'user_test_123',
            email: 'test@example.com',
            name: 'Test User',
            createdAt: new Date(),
          }]),
        }),
      }),
      delete: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(true),
      }),
      query: {
        users: {
          findFirst: vi.fn().mockImplementation(({ where }: any) => {
            return Promise.resolve(mockUsers.find(u => u.clerkId === where.eq) || null);
          }),
        },
      },
      select: vi.fn().mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(mockUsers),
        }),
      }),
    },
  };
});

// Mock Clerk BEFORE any other imports
vi.mock('@clerk/clerk-sdk-node', () => {
  return {
    createClerkClient: vi.fn().mockImplementation(() => ({
      verifyToken: vi.fn().mockImplementation((token) => {
        if (token === 'invalid_token') {
          return Promise.reject(new Error('Invalid token'));
        }
        return Promise.resolve({
          sub: 'user_test_' + Date.now(),
          sid: 'session_' + Date.now(),
        });
      }),
      users: {
        deleteUser: vi.fn().mockResolvedValue(true),
      },
    })),
  };
});

// Mock notification service
vi.mock('../services/notification', () => {
  return {
    notificationService: {
      sendToUser: vi.fn().mockResolvedValue(true),
      sendToMultiple: vi.fn().mockResolvedValue(true),
    },
  };
});

// Mock AI service
vi.mock('../services/ai', () => {
  return {
    aiService: {
      generateResponse: vi.fn().mockResolvedValue({ text: 'Test response' }),
      analyzeCrisis: vi.fn().mockResolvedValue({ isCrisis: false }),
    },
  };
});

describe('Authentication', () => {
  let app: Express;
  let server: any;

  beforeAll(async () => {
    const express = await import('express');
    const { registerRoutes } = await import('../routes');
    
    app = express.default();
    app.use(express.default.json());
    server = await registerRoutes(app);
  });

  afterAll(async () => {
    if (server && typeof server.close === 'function') {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Unauthenticated Requests', () => {
    it('should require authentication for profile', async () => {
      const response = await request(app)
        .get('/api/user/profile');

      expect(response.status).toBe(401);
    });

    it('should require authentication for settings', async () => {
      const response = await request(app)
        .get('/api/user/settings');

      expect(response.status).toBe(401);
    });

    it('should require authentication to update settings', async () => {
      const response = await request(app)
        .patch('/api/user/settings')
        .send({ notificationsEnabled: false });

      expect(response.status).toBe(401);
    });

    it('should require authentication to delete account', async () => {
      const response = await request(app)
        .delete('/api/user');

      expect(response.status).toBe(401);
    });
  });

  describe('Protected Routes', () => {
    it('should protect mood endpoints', async () => {
      const response = await request(app)
        .get('/api/moods');

      expect(response.status).toBe(401);
    });

    it('should protect goal endpoints', async () => {
      const response = await request(app)
        .get('/api/goals');

      expect(response.status).toBe(401);
    });

    it('should protect memory endpoints', async () => {
      const response = await request(app)
        .get('/api/memories');

      expect(response.status).toBe(401);
    });

    it('should protect AI endpoints', async () => {
      const response = await request(app)
        .post('/api/ai/chat')
        .send({ message: 'test' });

      expect(response.status).toBe(401);
    });

    it('should protect crisis detection endpoints', async () => {
      const response = await request(app)
        .post('/api/crisis/detect')
        .send({ message: 'test' });

      expect(response.status).toBe(401);
    });
  });

  describe('FCM Token Management', () => {
    it('should require authentication for FCM token', async () => {
      const response = await request(app)
        .post('/api/user/fcm-token')
        .send({ fcmToken: 'test-fcm-token' });

      expect(response.status).toBe(401);
    });
  });

  describe('Authenticated Requests', () => {
    it('should reject invalid token', async () => {
      const response = await request(app)
        .get('/api/user/profile')
        .set('Authorization', 'Bearer invalid_token');

      expect(response.status).toBe(401);
    });
  });
});
