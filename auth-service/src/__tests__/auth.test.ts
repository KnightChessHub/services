import request from 'supertest';
import express from 'express';
import { authRoutes } from '../routes/auth.routes';
import { errorHandler } from '../middleware/errorHandler';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use(errorHandler);

describe('Auth Service', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          username: 'testuser',
          password: 'password123',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
    });

    it('should reject duplicate email', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@example.com',
          username: 'user1',
          password: 'password123',
        });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'duplicate@example.com',
          username: 'user2',
          password: 'password123',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'login@example.com',
          username: 'loginuser',
          password: 'password123',
        });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
    });
  });
});

