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

  async reject(req, res, next) {
    try {
      const community = await CommunityService.rejectRequest(
        req.params.id,
        req.user._id,
        req.body?.userId
      );
      res.json({ message: 'Request rejected', community });
    } catch (error) {
      logger.error('Error rejecting request:', error);
      if (
        error.message === 'Community not found' ||
        error.message === 'Only the owner can reject requests' ||
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

  async removeMember(req, res, next) {
    try {
      const community = await CommunityService.removeMember(
        req.params.id,
        req.user._id,
        req.body?.userId
      );
      res.json({ message: 'Member removed', community });
    } catch (error) {
      logger.error('Error removing member:', error);
      if (
        error.message === 'Community not found' ||
        error.message === 'Only the owner can remove members' ||
        error.message === 'Owner cannot be removed' ||
        error.message === 'Member not found'
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
      const rawDays = Number.parseInt(req.query?.days || req.query?.range || '7', 10);
      const rangeDays = rawDays === 30 ? 30 : 7;
      const result = await CommunityService.getLeaderboard(req.params.id, req.user._id, rangeDays);
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

  async pinJournal(req, res, next) {
    try {
      const entry = await CommunityService.pinCommunityJournalEntry(
        req.params.id,
        req.user._id,
        req.params.entryId,
        true
      );
      res.json({ message: 'Entry pinned', entry });
    } catch (error) {
      logger.error('Error pinning journal entry:', error);
      if (
        error.message === 'Community not found' ||
        error.message === 'Only admins can moderate journal entries' ||
        error.message === 'Journal entry not found'
      ) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  async unpinJournal(req, res, next) {
    try {
      const entry = await CommunityService.pinCommunityJournalEntry(
        req.params.id,
        req.user._id,
        req.params.entryId,
        false
      );
      res.json({ message: 'Entry unpinned', entry });
    } catch (error) {
      logger.error('Error unpinning journal entry:', error);
      if (
        error.message === 'Community not found' ||
        error.message === 'Only admins can moderate journal entries' ||
        error.message === 'Journal entry not found'
      ) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  async hideJournal(req, res, next) {
    try {
      const entry = await CommunityService.hideCommunityJournalEntry(
        req.params.id,
        req.user._id,
        req.params.entryId,
        true
      );
      res.json({ message: 'Entry hidden', entry });
    } catch (error) {
      logger.error('Error hiding journal entry:', error);
      if (
        error.message === 'Community not found' ||
        error.message === 'Only admins can moderate journal entries' ||
        error.message === 'Journal entry not found'
      ) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  async unhideJournal(req, res, next) {
    try {
      const entry = await CommunityService.hideCommunityJournalEntry(
        req.params.id,
        req.user._id,
        req.params.entryId,
        false
      );
      res.json({ message: 'Entry restored', entry });
    } catch (error) {
      logger.error('Error unhiding journal entry:', error);
      if (
        error.message === 'Community not found' ||
        error.message === 'Only admins can moderate journal entries' ||
        error.message === 'Journal entry not found'
      ) {
        return res.status(400).json({ message: error.message });
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

  async chat(req, res, next) {
    try {
      const limit = Math.min(100, Number.parseInt(req.query?.limit || '50', 10));
      const result = await CommunityService.getChatMessages(req.params.id, req.user._id, limit);
      res.json(result);
    } catch (error) {
      logger.error('Error fetching chat messages:', error);
      if (
        error.message === 'Community not found' ||
        error.message === 'Not a community member'
      ) {
        return res.status(403).json({ message: error.message });
      }
      next(error);
    }
  }

  async sendChat(req, res, next) {
    try {
      const message = await CommunityService.createChatMessage(
        req.params.id,
        req.user._id,
        req.body?.content
      );
      res.status(201).json(message);
    } catch (error) {
      logger.error('Error sending chat message:', error);
      if (
        error.message === 'Community not found' ||
        error.message === 'Not a community member' ||
        error.message === 'Message content is required' ||
        error.message === 'You are muted in this community'
      ) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  async hideChat(req, res, next) {
    try {
      const message = await CommunityService.hideChatMessage(
        req.params.id,
        req.user._id,
        req.params.messageId,
        true
      );
      res.json({ message: 'Message hidden', messageItem: message });
    } catch (error) {
      logger.error('Error hiding chat message:', error);
      if (
        error.message === 'Community not found' ||
        error.message === 'Not a community member' ||
        error.message === 'Only admins can moderate chat' ||
        error.message === 'Message not found'
      ) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  async unhideChat(req, res, next) {
    try {
      const message = await CommunityService.hideChatMessage(
        req.params.id,
        req.user._id,
        req.params.messageId,
        false
      );
      res.json({ message: 'Message unhidden', messageItem: message });
    } catch (error) {
      logger.error('Error unhiding chat message:', error);
      if (
        error.message === 'Community not found' ||
        error.message === 'Not a community member' ||
        error.message === 'Only admins can moderate chat' ||
        error.message === 'Message not found'
      ) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  async deleteChat(req, res, next) {
    try {
      const message = await CommunityService.deleteChatMessage(
        req.params.id,
        req.user._id,
        req.params.messageId
      );
      res.json({ message: 'Message deleted', messageItem: message });
    } catch (error) {
      logger.error('Error deleting chat message:', error);
      if (
        error.message === 'Community not found' ||
        error.message === 'Not a community member' ||
        error.message === 'Only admins can moderate chat' ||
        error.message === 'Message not found'
      ) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  async muteMember(req, res, next) {
    try {
      const result = await CommunityService.muteMember(
        req.params.id,
        req.user._id,
        req.body?.userId,
        req.body?.minutes,
        req.body?.reason
      );
      res.json({ message: 'Member muted', mutedUntil: result.mutedUntil });
    } catch (error) {
      logger.error('Error muting member:', error);
      if (
        error.message === 'Community not found' ||
        error.message === 'Not a community member' ||
        error.message === 'Only admins can mute members' ||
        error.message === 'Owner cannot be muted'
      ) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }

  async unmuteMember(req, res, next) {
    try {
      await CommunityService.unmuteMember(
        req.params.id,
        req.user._id,
        req.body?.userId
      );
      res.json({ message: 'Member unmuted' });
    } catch (error) {
      logger.error('Error unmuting member:', error);
      if (
        error.message === 'Community not found' ||
        error.message === 'Not a community member' ||
        error.message === 'Only admins can mute members'
      ) {
        return res.status(400).json({ message: error.message });
      }
      next(error);
    }
  }
}

module.exports = new CommunityController();
