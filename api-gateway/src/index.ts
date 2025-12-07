import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import { verifyToken } from './middleware/auth';
import { healthRoutes } from './routes/health.routes';
import { rateLimiter } from './middleware/rateLimiter';
import { requestId } from './middleware/requestId';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(requestId);
app.use(rateLimiter);

app.use('/health', healthRoutes);

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3002';
const GROUP_SERVICE_URL = process.env.GROUP_SERVICE_URL || 'http://localhost:3003';
const GAME_SERVICE_URL = process.env.GAME_SERVICE_URL || 'http://localhost:3004';
const TOURNAMENT_SERVICE_URL = process.env.TOURNAMENT_SERVICE_URL || 'http://localhost:3005';
const ANALYSIS_SERVICE_URL = process.env.ANALYSIS_SERVICE_URL || 'http://localhost:3006';
const RATING_SERVICE_URL = process.env.RATING_SERVICE_URL || 'http://localhost:3007';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3008';
const MATCHMAKING_SERVICE_URL = process.env.MATCHMAKING_SERVICE_URL || 'http://localhost:3009';
const STATISTICS_SERVICE_URL = process.env.STATISTICS_SERVICE_URL || 'http://localhost:3010';
const REPLAY_SERVICE_URL = process.env.REPLAY_SERVICE_URL || 'http://localhost:3011';
const CHAT_SERVICE_URL = process.env.CHAT_SERVICE_URL || 'http://localhost:3012';
const SEARCH_SERVICE_URL = process.env.SEARCH_SERVICE_URL || 'http://localhost:3013';
const REALTIME_SERVICE_URL = process.env.REALTIME_SERVICE_URL || 'http://localhost:3014';
const FILE_SERVICE_URL = process.env.FILE_SERVICE_URL || 'http://localhost:3015';
const FRIEND_SERVICE_URL = process.env.FRIEND_SERVICE_URL || 'http://localhost:3016';
const ADMIN_SERVICE_URL = process.env.ADMIN_SERVICE_URL || 'http://localhost:3017';
const ACTIVITY_SERVICE_URL = process.env.ACTIVITY_SERVICE_URL || 'http://localhost:3018';
const REPORT_SERVICE_URL = process.env.REPORT_SERVICE_URL || 'http://localhost:3019';
const TIMER_SERVICE_URL = process.env.TIMER_SERVICE_URL || 'http://localhost:3020';
const JOB_SERVICE_URL = process.env.JOB_SERVICE_URL || 'http://localhost:3021';
const EMAIL_SERVICE_URL = process.env.EMAIL_SERVICE_URL || 'http://localhost:3022';

const axiosInstance = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const response = await axiosInstance.post(`${AUTH_SERVICE_URL}/register`, req.body);
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const response = await axiosInstance.post(`${AUTH_SERVICE_URL}/login`, req.body);
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.get('/api/auth/verify', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.get(`${AUTH_SERVICE_URL}/verify`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.get('/api/users/me', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.get(`${USER_SERVICE_URL}/me`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.get('/api/users/:id', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.get(`${USER_SERVICE_URL}/${req.params.id}`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.put('/api/users/me', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.put(`${USER_SERVICE_URL}/me`, req.body, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.post('/api/groups', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.post(`${GROUP_SERVICE_URL}`, req.body, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.get('/api/groups', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.get(`${GROUP_SERVICE_URL}`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.get('/api/groups/:id', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.get(`${GROUP_SERVICE_URL}/${req.params.id}`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.put('/api/groups/:id', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.put(`${GROUP_SERVICE_URL}/${req.params.id}`, req.body, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.delete('/api/groups/:id', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.delete(`${GROUP_SERVICE_URL}/${req.params.id}`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.post('/api/groups/:id/members', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.post(`${GROUP_SERVICE_URL}/${req.params.id}/members`, req.body, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.get('/api/groups/:id/members', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.get(`${GROUP_SERVICE_URL}/${req.params.id}/members`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.delete('/api/groups/:id/members/:userId', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.delete(`${GROUP_SERVICE_URL}/${req.params.id}/members/${req.params.userId}`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.post('/api/games', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.post(`${GAME_SERVICE_URL}`, req.body, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.get('/api/games', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.get(`${GAME_SERVICE_URL}`, {
      headers: { Authorization: req.headers.authorization },
      params: req.query
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.get('/api/games/:id', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.get(`${GAME_SERVICE_URL}/${req.params.id}`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.post('/api/games/:id/move', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.post(`${GAME_SERVICE_URL}/${req.params.id}/move`, req.body, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.post('/api/games/:id/resign', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.post(`${GAME_SERVICE_URL}/${req.params.id}/resign`, req.body, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.post('/api/games/:id/join', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.post(`${GAME_SERVICE_URL}/${req.params.id}/join`, req.body, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.post('/api/tournaments', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.post(`${TOURNAMENT_SERVICE_URL}`, req.body, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.get('/api/tournaments', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.get(`${TOURNAMENT_SERVICE_URL}`, {
      headers: { Authorization: req.headers.authorization },
      params: req.query
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.get('/api/tournaments/my', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.get(`${TOURNAMENT_SERVICE_URL}/my`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.get('/api/tournaments/:id', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.get(`${TOURNAMENT_SERVICE_URL}/${req.params.id}`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.post('/api/tournaments/:id/join', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.post(`${TOURNAMENT_SERVICE_URL}/${req.params.id}/join`, req.body, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.post('/api/tournaments/:id/leave', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.post(`${TOURNAMENT_SERVICE_URL}/${req.params.id}/leave`, req.body, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.post('/api/tournaments/:id/start', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.post(`${TOURNAMENT_SERVICE_URL}/${req.params.id}/start`, req.body, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.post('/api/analysis/analyze', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.post(`${ANALYSIS_SERVICE_URL}/analyze`, req.body, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.get('/api/analysis/my', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.get(`${ANALYSIS_SERVICE_URL}/my`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.get('/api/analysis/:gameId', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.get(`${ANALYSIS_SERVICE_URL}/${req.params.gameId}`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.get('/api/ratings/leaderboard', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.get(`${RATING_SERVICE_URL}/leaderboard`, {
      headers: { Authorization: req.headers.authorization },
      params: req.query
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.get('/api/ratings/:userId?', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.get(`${RATING_SERVICE_URL}/${req.params.userId || ''}`, {
      headers: { Authorization: req.headers.authorization },
      params: req.query
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.post('/api/ratings/record', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.post(`${RATING_SERVICE_URL}/record`, req.body, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.get('/api/notifications', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.get(`${NOTIFICATION_SERVICE_URL}`, {
      headers: { Authorization: req.headers.authorization },
      params: req.query
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.get('/api/notifications/unread/count', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.get(`${NOTIFICATION_SERVICE_URL}/unread/count`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.put('/api/notifications/:id/read', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.put(`${NOTIFICATION_SERVICE_URL}/${req.params.id}/read`, req.body, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.put('/api/notifications/read/all', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.put(`${NOTIFICATION_SERVICE_URL}/read/all`, req.body, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.delete('/api/notifications/:id', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.delete(`${NOTIFICATION_SERVICE_URL}/${req.params.id}`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.post('/api/matchmaking/queue', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.post(`${MATCHMAKING_SERVICE_URL}/queue`, req.body, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.delete('/api/matchmaking/queue', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.delete(`${MATCHMAKING_SERVICE_URL}/queue`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.get('/api/matchmaking/queue/status', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.get(`${MATCHMAKING_SERVICE_URL}/queue/status`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.get('/api/statistics/global', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.get(`${STATISTICS_SERVICE_URL}/global`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.get('/api/statistics/:userId?', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.get(`${STATISTICS_SERVICE_URL}/${req.params.userId || ''}`, {
      headers: { Authorization: req.headers.authorization },
      params: req.query
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.get('/api/replay/my', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.get(`${REPLAY_SERVICE_URL}/my`, {
      headers: { Authorization: req.headers.authorization },
      params: req.query
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.get('/api/replay/:gameId', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.get(`${REPLAY_SERVICE_URL}/${req.params.gameId}`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.post('/api/chat', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.post(`${CHAT_SERVICE_URL}`, req.body, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.get('/api/chat/conversations', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.get(`${CHAT_SERVICE_URL}/conversations`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.get('/api/chat/conversations/:userId', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.get(`${CHAT_SERVICE_URL}/conversations/${req.params.userId}`, {
      headers: { Authorization: req.headers.authorization },
      params: req.query
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.get('/api/chat/unread/count', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.get(`${CHAT_SERVICE_URL}/unread/count`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.put('/api/chat/:messageId/read', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.put(`${CHAT_SERVICE_URL}/${req.params.messageId}/read`, req.body, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.get('/api/search', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.get(`${SEARCH_SERVICE_URL}`, {
      headers: { Authorization: req.headers.authorization },
      params: req.query
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.get('/api/search/users', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.get(`${SEARCH_SERVICE_URL}/users`, {
      headers: { Authorization: req.headers.authorization },
      params: req.query
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.post('/api/files', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.post(`${FILE_SERVICE_URL}`, req.body, {
      headers: { Authorization: req.headers.authorization },
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.get('/api/files/my', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.get(`${FILE_SERVICE_URL}/my`, {
      headers: { Authorization: req.headers.authorization },
      params: req.query
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.get('/api/files/:id', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.get(`${FILE_SERVICE_URL}/${req.params.id}`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.delete('/api/files/:id', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.delete(`${FILE_SERVICE_URL}/${req.params.id}`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.post('/api/friends/request', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.post(`${FRIEND_SERVICE_URL}/request`, req.body, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.get('/api/friends/requests', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.get(`${FRIEND_SERVICE_URL}/requests`, {
      headers: { Authorization: req.headers.authorization },
      params: req.query
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.put('/api/friends/requests/:id/accept', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.put(`${FRIEND_SERVICE_URL}/requests/${req.params.id}/accept`, req.body, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.delete('/api/friends/requests/:id', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.delete(`${FRIEND_SERVICE_URL}/requests/${req.params.id}`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.get('/api/friends/list', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.get(`${FRIEND_SERVICE_URL}/list`, {
      headers: { Authorization: req.headers.authorization },
      params: req.query
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.delete('/api/friends/:friendId', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.delete(`${FRIEND_SERVICE_URL}/${req.params.friendId}`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.post('/api/friends/block/:userId', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.post(`${FRIEND_SERVICE_URL}/block/${req.params.userId}`, req.body, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.get('/api/admin/stats', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.get(`${ADMIN_SERVICE_URL}/stats`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.post('/api/admin', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.post(`${ADMIN_SERVICE_URL}`, req.body, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.get('/api/admin', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.get(`${ADMIN_SERVICE_URL}`, {
      headers: { Authorization: req.headers.authorization },
      params: req.query
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.put('/api/admin/:id', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.put(`${ADMIN_SERVICE_URL}/${req.params.id}`, req.body, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.delete('/api/admin/:id', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.delete(`${ADMIN_SERVICE_URL}/${req.params.id}`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.get('/api/activity/my', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.get(`${ACTIVITY_SERVICE_URL}/my`, {
      headers: { Authorization: req.headers.authorization },
      params: req.query
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.get('/api/activity/feed', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.get(`${ACTIVITY_SERVICE_URL}/feed`, {
      headers: { Authorization: req.headers.authorization },
      params: req.query
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.get('/api/activity/user/:userId', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.get(`${ACTIVITY_SERVICE_URL}/user/${req.params.userId}`, {
      headers: { Authorization: req.headers.authorization },
      params: req.query
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.post('/api/reports', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.post(`${REPORT_SERVICE_URL}`, req.body, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.get('/api/reports/my', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.get(`${REPORT_SERVICE_URL}/my`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.get('/api/reports', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.get(`${REPORT_SERVICE_URL}`, {
      headers: { Authorization: req.headers.authorization },
      params: req.query
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.put('/api/reports/:id/status', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.put(`${REPORT_SERVICE_URL}/${req.params.id}/status`, req.body, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.get('/api/timers/:gameId', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.get(`${TIMER_SERVICE_URL}/${req.params.gameId}`, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.post('/api/timers/:gameId/start', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.post(`${TIMER_SERVICE_URL}/${req.params.gameId}/start`, req.body, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.post('/api/timers/:gameId/stop', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.post(`${TIMER_SERVICE_URL}/${req.params.gameId}/stop`, req.body, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.post('/api/timers/:gameId/pause', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.post(`${TIMER_SERVICE_URL}/${req.params.gameId}/pause`, req.body, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.post('/api/jobs', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.post(`${JOB_SERVICE_URL}`, req.body, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.get('/api/jobs', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.get(`${JOB_SERVICE_URL}`, {
      headers: { Authorization: req.headers.authorization },
      params: req.query
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.post('/api/jobs/:id/execute', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.post(`${JOB_SERVICE_URL}/${req.params.id}/execute`, req.body, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.post('/api/email', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.post(`${EMAIL_SERVICE_URL}`, req.body, {
      headers: { Authorization: req.headers.authorization }
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.get('/api/email', verifyToken, async (req, res) => {
  try {
    const response = await axiosInstance.get(`${EMAIL_SERVICE_URL}`, {
      headers: { Authorization: req.headers.authorization },
      params: req.query
    });
    res.status(response.status).json(response.data);
  } catch (error: any) {
    res.status(error.response?.status || 500).json(error.response?.data || { error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});

