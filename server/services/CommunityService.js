const crypto = require('crypto');
const Community = require('../models/Community');
const CommunityHabit = require('../models/CommunityHabit');
const User = require('../models/User');
const CommunityReflection = require('../models/CommunityReflection');
const logger = require('../utils/logger');
const { encryptText, decryptText } = require('../utils/journalCrypto');

const SEASONS = ['spring', 'summer', 'autumn', 'winter'];

const getNextSeason = (current) => {
  const idx = SEASONS.indexOf(current);
  const nextIdx = idx === -1 ? 0 : (idx + 1) % SEASONS.length;
  return SEASONS[nextIdx];
};

const getUTCMidnight = () => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

const sanitizeHabitInput = (data = {}) => {
  const name = String(data.name || '').trim();
  const description = String(data.description || '').trim();
  const frequency = data.frequency === 'weekly' ? 'weekly' : 'daily';
  const color = /^#[0-9a-fA-F]{6}$/.test(data.color) ? data.color : '#8B5CF6';
  const icon = typeof data.icon === 'string' && data.icon.trim() ? data.icon.trim() : 'star';

  return { name, description, frequency, color, icon };
};

const generateInviteCode = () => {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
};

const getShieldCooldownMs = () => {
  const rawDays = Number.parseInt(process.env.COMMUNITY_SHIELD_COOLDOWN_DAYS || '7', 10);
  const days = Number.isFinite(rawDays) && rawDays > 0 ? rawDays : 7;
  return days * 24 * 60 * 60 * 1000;
};

const refreshShieldAvailability = (community) => {
  if (!community?.streakShield) return;
  if (community.streakShield.available) return;

  const resetAt = community.streakShield.resetsAt
    ? new Date(community.streakShield.resetsAt)
    : null;

  if (resetAt && resetAt.getTime() <= Date.now()) {
    community.streakShield.available = true;
    community.streakShield.resetsAt = null;
  }
};

class CommunityService {
  addBadgeIfMissing(community, badge, newlyUnlocked) {
    const exists = community.badges.some(b => b.name === badge.name);
    if (!exists) {
      community.badges.push(badge);
      newlyUnlocked.push(badge);
      return true;
    }
    return false;
  }

  isMember(community, userId) {
    return community.members.some(m => String(m.userId) === String(userId));
  }

  isOwner(community, userId) {
    return String(community.owner) === String(userId);
  }

  isAdmin(community, userId) {
    return community.members.some(m =>
      String(m.userId) === String(userId) && (m.role === 'admin' || m.role === 'owner')
    );
  }

  async createCommunity(userId, data) {
    const name = String(data.name || '').trim();
    const description = String(data.description || '').trim();
    if (!name) throw new Error('Community name is required');

    let inviteCode = generateInviteCode();
    let exists = await Community.findOne({ inviteCode });
    while (exists) {
      inviteCode = generateInviteCode();
      exists = await Community.findOne({ inviteCode });
    }

    const community = await Community.create({
      name,
      description,
      owner: userId,
      inviteCode,
      members: [{ userId, role: 'owner' }],
    });

    logger.info(`Community created: ${community._id} by ${userId}`);
    return community;
  }

  async listCommunities(userId) {
    const communities = await Community.find({
      'members.userId': userId,
    }).sort('-createdAt');

    const pending = await Community.find({
      'pendingRequests.userId': userId,
    }).select('name inviteCode pendingRequests');

    return { communities, pending };
  }

  async requestJoinByCode(userId, codeRaw) {
    const code = String(codeRaw || '').trim().toUpperCase();
    if (!code) throw new Error('Invite code is required');

    const community = await Community.findOne({ inviteCode: code });
    if (!community) throw new Error('Community not found');

    if (this.isMember(community, userId)) {
      throw new Error('Already a community member');
    }

    const alreadyPending = community.pendingRequests.some(r => String(r.userId) === String(userId));
    if (!alreadyPending) {
      community.pendingRequests.push({ userId });
      await community.save();
    }

    return community;
  }

  async approveRequest(communityId, ownerId, userIdToApprove) {
    const community = await Community.findById(communityId);
    if (!community) throw new Error('Community not found');
    if (!this.isOwner(community, ownerId)) throw new Error('Only the owner can approve requests');

    const pendingIndex = community.pendingRequests.findIndex(r => String(r.userId) === String(userIdToApprove));
    if (pendingIndex === -1) throw new Error('Request not found');

    community.pendingRequests.splice(pendingIndex, 1);
    if (!this.isMember(community, userIdToApprove)) {
      community.members.push({ userId: userIdToApprove, role: 'member' });
    }

    await community.save();
    return community;
  }

  async updateMemberRole(communityId, ownerId, targetUserId, role) {
    const community = await Community.findById(communityId);
    if (!community) throw new Error('Community not found');
    if (!this.isOwner(community, ownerId)) throw new Error('Only the owner can update roles');

    const normalizedRole = role === 'admin' ? 'admin' : 'member';
    const member = community.members.find(m => String(m.userId) === String(targetUserId));
    if (!member) throw new Error('Member not found');
    if (member.role === 'owner') throw new Error('Owner role cannot be changed');

    member.role = normalizedRole;
    await community.save();
    return community;
  }

  async leaveCommunity(communityId, userId) {
    const community = await Community.findById(communityId);
    if (!community) throw new Error('Community not found');

    if (this.isOwner(community, userId)) {
      throw new Error('Owner cannot leave the community');
    }

    community.members = community.members.filter(m => String(m.userId) !== String(userId));
    await community.save();
    return community;
  }

  async getCommunity(communityId, userId) {
    const community = await Community.findById(communityId)
      .populate('members.userId', 'username fullName profilePicUrl')
      .populate('pendingRequests.userId', 'username fullName profilePicUrl');

    if (!community) throw new Error('Community not found');
    if (!this.isMember(community, userId)) throw new Error('Not a community member');

    if (!community.streakShield) {
      community.streakShield = { available: true, lastUsed: null, resetsAt: null };
    }
    const before = community.streakShield.available;
    refreshShieldAvailability(community);
    if (before !== community.streakShield.available) {
      await community.save();
    }

    return community;
  }

  async getCommunityHabits(communityId, userId) {
    const community = await this.getCommunity(communityId, userId);
    const habits = await CommunityHabit.find({ communityId: community._id, isActive: true }).sort('-createdAt');
    return { community, habits };
  }

  async createCommunityHabit(communityId, userId, habitData) {
    const community = await this.getCommunity(communityId, userId);
    const payload = sanitizeHabitInput(habitData);
    if (!payload.name) throw new Error('Habit name is required');

    const habit = await CommunityHabit.create({
      communityId: community._id,
      ...payload,
    });

    const newlyUnlockedBadges = [];
    this.addBadgeIfMissing(community, {
      name: 'Community Builder',
      description: 'Created the first community habit.',
      icon: 'Users',
    }, newlyUnlockedBadges);

    if (newlyUnlockedBadges.length > 0) {
      await community.save();
    }

    return { community, habit, newlyUnlockedBadges };
  }

  async completeCommunityHabit(communityId, habitId, userId) {
    const community = await this.getCommunity(communityId, userId);
    const habit = await CommunityHabit.findOne({ _id: habitId, communityId: community._id });
    if (!habit) throw new Error('Habit not found');

    if (habit.isCompletedToday(userId)) {
      throw new Error('Habit already completed today');
    }

    const today = getUTCMidnight();
    const completionTime = new Date();

    habit.completions.push({ userId, date: today, completedAt: completionTime, shielded: false });
    habit.streak = habit.calculateStreak();
    if (habit.streak > habit.longestStreak) {
      habit.longestStreak = habit.streak;
    }

    const xpReward = 10 + habit.streak;
    community.xp += xpReward;

    const newLevel = Math.floor(community.xp / 800) + 1;
    if (newLevel > community.level) {
      community.level = newLevel;
      community.worldState.treeLevel = newLevel;
      community.worldState.branches += 1;
      community.worldState.leaves += 5;
    }

    community.worldState.treeLevel = community.level;
    community.worldState.leaves = Math.min((community.worldState.leaves || 0) + 1, 200);
    if (habit.streak > 0 && habit.streak % 7 === 0) {
      community.worldState.season = getNextSeason(community.worldState.season);
    }
    if (community.level >= 10) {
      community.worldState.flowers = Math.max(community.worldState.flowers || 0, 5);
    }
    if (community.level >= 15) {
      community.worldState.fruits = Math.max(community.worldState.fruits || 0, 3);
    }
    if (community.level >= 20) {
      community.worldState.glowIntensity = Math.max(community.worldState.glowIntensity || 0, 0.35);
    }

    const newlyUnlockedBadges = [];
    this.addBadgeIfMissing(community, {
      name: 'Teamwork',
      description: 'Complete your first community habit.',
      icon: 'Sparkles',
    }, newlyUnlockedBadges);

    if (community.level >= 5) {
      this.addBadgeIfMissing(community, {
        name: 'Community Level 5',
        description: 'Reach community level 5.',
        icon: 'Star',
      }, newlyUnlockedBadges);
    }

    await Promise.all([habit.save(), community.save()]);

    return {
      habit,
      community,
      xpEarned: xpReward,
      newlyUnlockedBadges,
    };
  }

  async useCommunityShield(communityId, habitId, userId) {
    const community = await this.getCommunity(communityId, userId);
    const habit = await CommunityHabit.findOne({ _id: habitId, communityId: community._id });
    if (!habit) throw new Error('Habit not found');

    if (habit.isCompletedToday(userId)) {
      throw new Error('Habit already completed today');
    }

    if (!community.streakShield) {
      community.streakShield = { available: true, lastUsed: null, resetsAt: null };
    }
    refreshShieldAvailability(community);

    if (!community.streakShield.available) {
      throw new Error('Community shield not available');
    }

    const today = getUTCMidnight();
    const completionTime = new Date();

    habit.completions.push({
      userId,
      date: today,
      completedAt: completionTime,
      shielded: true,
    });
    habit.streak = habit.calculateStreak();
    if (habit.streak > habit.longestStreak) {
      habit.longestStreak = habit.streak;
    }

    community.streakShield.available = false;
    community.streakShield.lastUsed = completionTime;
    community.streakShield.resetsAt = new Date(Date.now() + getShieldCooldownMs());

    const newlyUnlockedBadges = [];
    this.addBadgeIfMissing(community, {
      name: 'Community Shield',
      description: 'Use a community streak shield.',
      icon: 'Shield',
    }, newlyUnlockedBadges);

    await Promise.all([habit.save(), community.save()]);

    return {
      habit,
      community,
      newlyUnlockedBadges,
    };
  }

  async getLeaderboard(communityId, userId) {
    const community = await this.getCommunity(communityId, userId);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const leaderboard = await CommunityHabit.aggregate([
      { $match: { communityId: community._id } },
      { $unwind: '$completions' },
      {
        $group: {
          _id: '$completions.userId',
          totalCompletions: { $sum: 1 },
          last7Completions: {
            $sum: {
              $cond: [{ $gte: ['$completions.date', sevenDaysAgo] }, 1, 0]
            }
          },
          lastCompletedAt: { $max: '$completions.completedAt' },
        }
      },
      { $sort: { last7Completions: -1, totalCompletions: -1 } },
      { $limit: 10 },
    ]);

    const userIds = leaderboard.map(entry => entry._id);
    const users = await User.find({ _id: { $in: userIds } })
      .select('username fullName profilePicUrl');
    const userMap = new Map(users.map(u => [String(u._id), u]));

    const mapped = leaderboard.map(entry => ({
      user: userMap.get(String(entry._id)) || { _id: entry._id, username: 'Member' },
      totalCompletions: entry.totalCompletions,
      last7Completions: entry.last7Completions,
      lastCompletedAt: entry.lastCompletedAt,
    }));

    return { community, leaderboard: mapped, memberCount: userIds.length };
  }

  async getCommunityJournal(communityId, userId) {
    const community = await this.getCommunity(communityId, userId);
    const reflections = await CommunityReflection.find({ communityId: community._id })
      .populate('userId', 'username fullName profilePicUrl')
      .sort('-date');
    const entries = reflections.map(reflection => ({
      ...reflection.toObject(),
      content: decryptText(reflection.content),
    }));

    return { community, entries };
  }

  async createCommunityJournalEntry(communityId, userId, data) {
    const community = await this.getCommunity(communityId, userId);
    const encryptedContent = encryptText(String(data.content || ''));
    const payload = {
      communityId: community._id,
      userId,
      content: encryptedContent,
      mood: data.mood || 'okay',
      date: data.date ? new Date(data.date) : new Date(),
    };

    const reflection = await CommunityReflection.create(payload);
    return {
      ...reflection.toObject(),
      content: decryptText(reflection.content),
    };
  }
}

module.exports = new CommunityService();
