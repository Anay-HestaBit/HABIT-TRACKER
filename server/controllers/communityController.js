const CommunityService = require('../services/CommunityService');
const logger = require('../utils/logger');

class CommunityController {
  async list(req, res, next) {
    try {
      const result = await CommunityService.listCommunities(req.user._id);
      res.json(result);
    } catch (error) {
      logger.error('Error listing communities:', error);
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const community = await CommunityService.createCommunity(req.user._id, req.body);
      res.status(201).json(community);
    } catch (error) {
      logger.error('Error creating community:', error);
      if (error.message === 'Community name is required') {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  async joinByCode(req, res, next) {
    try {
      const community = await CommunityService.requestJoinByCode(req.user._id, req.body?.code);
      res.json({ message: 'Join request sent', communityId: community._id });
    } catch (error) {
      logger.error('Error requesting join:', error);
      if (
        error.message === 'Invite code is required' ||
        error.message === 'Community not found' ||
        error.message === 'Already a community member'
      ) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  async get(req, res, next) {
    try {
      const community = await CommunityService.getCommunity(req.params.id, req.user._id);
      res.json(community);
    } catch (error) {
      logger.error('Error fetching community:', error);
      if (
        error.message === 'Community not found' ||
        error.message === 'Not a community member'
      ) {
        return res.status(403).json({ message: error.message });
      }
      next(error);
    }
  }

  async approve(req, res, next) {
    try {
      const community = await CommunityService.approveRequest(
        req.params.id,
        req.user._id,
        req.body?.userId
      );
      res.json({ message: 'Request approved', community });
    } catch (error) {
      logger.error('Error approving request:', error);
      if (
        error.message === 'Community not found' ||
        error.message === 'Only the owner can approve requests' ||
        error.message === 'Request not found'
      ) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  async updateRole(req, res, next) {
    try {
      const community = await CommunityService.updateMemberRole(
        req.params.id,
        req.user._id,
        req.body?.userId,
        req.body?.role
      );
      res.json({ message: 'Role updated', community });
    } catch (error) {
      logger.error('Error updating role:', error);
      if (
        error.message === 'Community not found' ||
        error.message === 'Only the owner can update roles' ||
        error.message === 'Member not found' ||
        error.message === 'Owner role cannot be changed'
      ) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  async leave(req, res, next) {
    try {
      await CommunityService.leaveCommunity(req.params.id, req.user._id);
      res.json({ message: 'Left community successfully' });
    } catch (error) {
      logger.error('Error leaving community:', error);
      if (
        error.message === 'Community not found' ||
        error.message === 'Owner cannot leave the community'
      ) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  async habits(req, res, next) {
    try {
      const result = await CommunityService.getCommunityHabits(req.params.id, req.user._id);
      res.json(result);
    } catch (error) {
      logger.error('Error fetching community habits:', error);
      if (
        error.message === 'Community not found' ||
        error.message === 'Not a community member'
      ) {
        return res.status(403).json({ message: error.message });
      }
      next(error);
    }
  }

  async createHabit(req, res, next) {
    try {
      const result = await CommunityService.createCommunityHabit(req.params.id, req.user._id, req.body);
      res.status(201).json(result);
    } catch (error) {
      logger.error('Error creating community habit:', error);
      if (
        error.message === 'Community not found' ||
        error.message === 'Not a community member' ||
        error.message === 'Habit name is required'
      ) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  async completeHabit(req, res, next) {
    try {
      const result = await CommunityService.completeCommunityHabit(
        req.params.id,
        req.params.habitId,
        req.user._id
      );
      res.json(result);
    } catch (error) {
      logger.error('Error completing community habit:', error);
      if (
        error.message === 'Community not found' ||
        error.message === 'Not a community member' ||
        error.message === 'Habit not found' ||
        error.message === 'Habit already completed today'
      ) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  async useShield(req, res, next) {
    try {
      const result = await CommunityService.useCommunityShield(
        req.params.id,
        req.params.habitId,
        req.user._id
      );
      res.json(result);
    } catch (error) {
      logger.error('Error using community shield:', error);
      if (
        error.message === 'Community not found' ||
        error.message === 'Not a community member' ||
        error.message === 'Habit not found' ||
        error.message === 'Habit already completed today' ||
        error.message === 'Community shield not available'
      ) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  async leaderboard(req, res, next) {
    try {
      const result = await CommunityService.getLeaderboard(req.params.id, req.user._id);
      res.json(result);
    } catch (error) {
      logger.error('Error fetching community leaderboard:', error);
      if (
        error.message === 'Community not found' ||
        error.message === 'Not a community member'
      ) {
        return res.status(403).json({ message: error.message });
      }
      next(error);
    }
  }

  async journal(req, res, next) {
    try {
      const result = await CommunityService.getCommunityJournal(req.params.id, req.user._id);
      res.json(result);
    } catch (error) {
      logger.error('Error fetching community journal:', error);
      if (
        error.message === 'Community not found' ||
        error.message === 'Not a community member'
      ) {
        return res.status(403).json({ message: error.message });
      }
      next(error);
    }
  }

  async createJournal(req, res, next) {
    try {
      const entry = await CommunityService.createCommunityJournalEntry(req.params.id, req.user._id, req.body);
      res.status(201).json(entry);
    } catch (error) {
      logger.error('Error creating community journal:', error);
      if (
        error.message === 'Community not found' ||
        error.message === 'Not a community member'
      ) {
        return res.status(403).json({ message: error.message });
      }
      next(error);
    }
  }
}

module.exports = new CommunityController();
