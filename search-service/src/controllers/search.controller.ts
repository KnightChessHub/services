import { Response } from 'express';
import axios from 'axios';
import { AuthRequest } from '../middleware/auth';

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3002';
const GAME_SERVICE_URL = process.env.GAME_SERVICE_URL || 'http://localhost:3004';
const TOURNAMENT_SERVICE_URL = process.env.TOURNAMENT_SERVICE_URL || 'http://localhost:3005';
const GROUP_SERVICE_URL = process.env.GROUP_SERVICE_URL || 'http://localhost:3003';

export const searchAll = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { q, type, limit = 20 } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Query parameter q is required' });
    }

    const searchType = type as string | undefined;
    const results: any = {
      users: [],
      games: [],
      tournaments: [],
      groups: [],
    };

    if (!searchType || searchType === 'users') {
      try {
        const usersResponse = await axios.get(`${USER_SERVICE_URL}`, {
          headers: { Authorization: req.headers.authorization },
        });
        if (usersResponse.data.success) {
          results.users = (usersResponse.data.data || [])
            .filter((user: any) =>
              user.username?.toLowerCase().includes(q.toLowerCase()) ||
              user.email?.toLowerCase().includes(q.toLowerCase())
            )
            .slice(0, Number(limit));
        }
      } catch (error) {
        console.error('User search error:', error);
      }
    }

    if (!searchType || searchType === 'games') {
      try {
        const gamesResponse = await axios.get(`${GAME_SERVICE_URL}`, {
          headers: { Authorization: req.headers.authorization },
        });
        if (gamesResponse.data.success) {
          results.games = (gamesResponse.data.data || [])
            .filter((game: any) => game.id?.includes(q))
            .slice(0, Number(limit));
        }
      } catch (error) {
        console.error('Game search error:', error);
      }
    }

    if (!searchType || searchType === 'tournaments') {
      try {
        const tournamentsResponse = await axios.get(`${TOURNAMENT_SERVICE_URL}`, {
          headers: { Authorization: req.headers.authorization },
        });
        if (tournamentsResponse.data.success) {
          results.tournaments = (tournamentsResponse.data.data || [])
            .filter((tournament: any) =>
              tournament.name?.toLowerCase().includes(q.toLowerCase()) ||
              tournament.description?.toLowerCase().includes(q.toLowerCase())
            )
            .slice(0, Number(limit));
        }
      } catch (error) {
        console.error('Tournament search error:', error);
      }
    }

    if (!searchType || searchType === 'groups') {
      try {
        const groupsResponse = await axios.get(`${GROUP_SERVICE_URL}`, {
          headers: { Authorization: req.headers.authorization },
        });
        if (groupsResponse.data.success) {
          results.groups = (groupsResponse.data.data || [])
            .filter((group: any) =>
              group.name?.toLowerCase().includes(q.toLowerCase()) ||
              group.description?.toLowerCase().includes(q.toLowerCase())
            )
            .slice(0, Number(limit));
        }
      } catch (error) {
        console.error('Group search error:', error);
      }
    }

    res.json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const searchUsers = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { q, limit = 20 } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Query parameter q is required' });
    }

    try {
      const usersResponse = await axios.get(`${USER_SERVICE_URL}`, {
        headers: { Authorization: req.headers.authorization },
      });

      if (usersResponse.data.success) {
        const users = (usersResponse.data.data || [])
          .filter((user: any) =>
            user.username?.toLowerCase().includes(q.toLowerCase()) ||
            user.email?.toLowerCase().includes(q.toLowerCase())
          )
          .slice(0, Number(limit));

        res.json({
          success: true,
          data: users,
        });
      } else {
        res.json({
          success: true,
          data: [],
        });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

