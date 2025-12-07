import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Tournament } from '../models/tournament.model';

export const createTournament = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, description, format, timeControl, maxParticipants, startDate, prizePool } = req.body;

    const tournament = new Tournament({
      name,
      description,
      organizerId: userId,
      format,
      timeControl,
      maxParticipants,
      startDate: new Date(startDate),
      prizePool,
      status: 'upcoming',
      participants: [],
      rounds: [],
      currentRound: 0,
    });

    await tournament.save();

    res.status(201).json({
      success: true,
      data: {
        id: tournament._id.toString(),
        name: tournament.name,
        description: tournament.description,
        format: tournament.format,
        timeControl: tournament.timeControl,
        maxParticipants: tournament.maxParticipants,
        status: tournament.status,
        organizerId: tournament.organizerId,
        startDate: tournament.startDate,
        prizePool: tournament.prizePool,
        participantsCount: tournament.participants.length,
        createdAt: tournament.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getTournaments = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;

    const query: any = {};

    if (status) {
      query.status = status;
    }

    const tournaments = await Tournament.find(query).sort({ startDate: -1 }).limit(50);

    res.json({
      success: true,
      data: tournaments.map((tournament) => ({
        id: tournament._id.toString(),
        name: tournament.name,
        description: tournament.description,
        format: tournament.format,
        timeControl: tournament.timeControl,
        maxParticipants: tournament.maxParticipants,
        status: tournament.status,
        organizerId: tournament.organizerId,
        participantsCount: tournament.participants.length,
        currentRound: tournament.currentRound,
        startDate: tournament.startDate,
        endDate: tournament.endDate,
        prizePool: tournament.prizePool,
        createdAt: tournament.createdAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getTournament = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const tournament = await Tournament.findById(id);

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    res.json({
      success: true,
      data: {
        id: tournament._id.toString(),
        name: tournament.name,
        description: tournament.description,
        format: tournament.format,
        timeControl: tournament.timeControl,
        maxParticipants: tournament.maxParticipants,
        status: tournament.status,
        organizerId: tournament.organizerId,
        participants: tournament.participants,
        rounds: tournament.rounds,
        currentRound: tournament.currentRound,
        startDate: tournament.startDate,
        endDate: tournament.endDate,
        prizePool: tournament.prizePool,
        createdAt: tournament.createdAt,
        updatedAt: tournament.updatedAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const joinTournament = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const tournament = await Tournament.findById(id);

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    if (tournament.status !== 'upcoming' && tournament.status !== 'registration') {
      return res.status(400).json({ error: 'Tournament is not accepting registrations' });
    }

    if (tournament.participants.length >= tournament.maxParticipants) {
      return res.status(400).json({ error: 'Tournament is full' });
    }

    const alreadyParticipating = tournament.participants.some((p) => p.userId === userId);
    if (alreadyParticipating) {
      return res.status(400).json({ error: 'Already registered for this tournament' });
    }

    tournament.participants.push({
      userId,
      score: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      joinedAt: new Date(),
    });

    if (tournament.status === 'upcoming') {
      tournament.status = 'registration';
    }

    await tournament.save();

    res.json({
      success: true,
      data: {
        id: tournament._id.toString(),
        participantsCount: tournament.participants.length,
        status: tournament.status,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const leaveTournament = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const tournament = await Tournament.findById(id);

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    if (tournament.status === 'active' || tournament.status === 'finished') {
      return res.status(400).json({ error: 'Cannot leave tournament that has started' });
    }

    tournament.participants = tournament.participants.filter((p) => p.userId !== userId);

    if (tournament.participants.length === 0 && tournament.status === 'registration') {
      tournament.status = 'upcoming';
    }

    await tournament.save();

    res.json({
      success: true,
      data: {
        id: tournament._id.toString(),
        participantsCount: tournament.participants.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const startTournament = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const tournament = await Tournament.findById(id);

    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    if (tournament.organizerId !== userId) {
      return res.status(403).json({ error: 'Only organizer can start tournament' });
    }

    if (tournament.status !== 'registration' && tournament.status !== 'upcoming') {
      return res.status(400).json({ error: 'Tournament cannot be started' });
    }

    if (tournament.participants.length < 2) {
      return res.status(400).json({ error: 'Need at least 2 participants to start' });
    }

    tournament.status = 'active';
    tournament.currentRound = 1;

    await tournament.save();

    res.json({
      success: true,
      data: {
        id: tournament._id.toString(),
        status: tournament.status,
        currentRound: tournament.currentRound,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMyTournaments = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const tournaments = await Tournament.find({
      $or: [
        { organizerId: userId },
        { 'participants.userId': userId },
      ],
    }).sort({ startDate: -1 }).limit(50);

    res.json({
      success: true,
      data: tournaments.map((tournament) => ({
        id: tournament._id.toString(),
        name: tournament.name,
        format: tournament.format,
        timeControl: tournament.timeControl,
        status: tournament.status,
        isOrganizer: tournament.organizerId === userId,
        isParticipant: tournament.participants.some((p) => p.userId === userId),
        currentRound: tournament.currentRound,
        startDate: tournament.startDate,
        endDate: tournament.endDate,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

