import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';
import { verifyToken } from './middleware/auth';
import { healthRoutes } from './routes/health.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/health', healthRoutes);

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3002';
const GROUP_SERVICE_URL = process.env.GROUP_SERVICE_URL || 'http://localhost:3003';
const GAME_SERVICE_URL = process.env.GAME_SERVICE_URL || 'http://localhost:3004';
const TOURNAMENT_SERVICE_URL = process.env.TOURNAMENT_SERVICE_URL || 'http://localhost:3005';
const ANALYSIS_SERVICE_URL = process.env.ANALYSIS_SERVICE_URL || 'http://localhost:3006';

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

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});

