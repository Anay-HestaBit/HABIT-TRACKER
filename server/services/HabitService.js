const HabitRepository = require('../repositories/HabitRepository');
const UserRepository = require('../repositories/UserRepository');
const ProgressRepository = require('../repositories/ProgressRepository');
const logger = require('../utils/logger');

// FIX: Consistent UTC midnight helper — same logic as Habit model
// Prevents timezone mismatch between server (local time) and client (UTC)
const getUTCMidnight = () => {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

const SEASONS = ['spring', 'summer', 'autumn', 'winter'];

const getNextSeason = (current) => {
  const idx = SEASONS.indexOf(current);
  const nextIdx = idx === -1 ? 0 : (idx + 1) % SEASONS.length;
  return SEASONS[nextIdx];
};

class HabitService {
  addBadgeIfMissing(user, badge, newlyUnlocked) {
    const exists = user.badges.some(b => b.name === badge.name);
    if (!exists) {
      user.badges.push(badge);
      newlyUnlocked.push(badge);
      return true;
    }
    return false;
  }

  async getTotalCompletions(userId) {
    const result = await HabitRepository.model.aggregate([
      { $match: { userId } },
      { $project: { count: { $size: '$completions' } } },
      { $group: { _id: null, total: { $sum: '$count' } } },
    ]);
    return result[0]?.total || 0;
  }

  async getUserHabits(userId) {
    logger.info(`Fetching habits for user: ${userId}`);
    return HabitRepository.findActiveByUserId(userId);
  }

  async createHabit(userId, habitData) {
    logger.info(`Creating habit for user ${userId}: ${habitData.name}`);
    const habit = await HabitRepository.create({ ...habitData, userId });

    const user = await UserRepository.findById(userId);
    const newlyUnlocked = [];
    this.addBadgeIfMissing(user, {
      name: 'Creator',
      description: 'Created your first habit!',
      icon: 'PlusCircle'
    }, newlyUnlocked);
    if (newlyUnlocked.length > 0) {
      await user.save();
      logger.info(`Achievement Unlocked: Creator for user ${userId}`);
    }

    return { habit, newlyUnlockedBadges: newlyUnlocked };
  }

  async updateHabit(habitId, userId, habitData) {
    const habit = await HabitRepository.findOneWithUser(habitId, userId);
    if (!habit) throw new Error('Habit not found');
    Object.assign(habit, habitData);
    return habit.save();
  }

  async deleteHabit(habitId, userId) {
    const habit = await HabitRepository.findOneWithUser(habitId, userId);
    if (!habit) throw new Error('Habit not found');
    habit.isActive = false;
    return habit.save();
  }

  async completeHabit(habitId, userId) {
    logger.info(`Completing habit ${habitId} for user ${userId}`);
    const habit = await HabitRepository.findOneWithUser(habitId, userId);
    if (!habit) throw new Error('Habit not found');

    if (habit.isCompletedToday()) {
      throw new Error('Habit already completed today');
    }

    // FIX: Use UTC midnight so the stored date matches what the client checks.
    // Old code: new Date().setHours(0,0,0,0) → local midnight → wrong UTC date in non-UTC timezones
    const today = getUTCMidnight();
    const completionTime = new Date();

    habit.completions.push({ date: today, completedAt: completionTime });
    habit.streak = habit.calculateStreak();
    if (habit.streak > habit.longestStreak) {
      habit.longestStreak = habit.streak;
    }
    await habit.save();

    const xpReward = 10 + (habit.streak * 2);
    const user = await UserRepository.findById(userId);
    user.xp += xpReward;

    const newLevel = Math.floor(user.xp / 1000) + 1;
    let leveledUp = false;
    if (newLevel > user.level) {
      user.level = newLevel;
      user.worldState.treeLevel = newLevel;
      user.worldState.branches += 1;
      user.worldState.leaves += 5;
      leveledUp = true;
      logger.info(`User ${userId} leveled up to ${newLevel}`);
    }

    // Keep world visuals evolving even between level-ups.
    user.worldState.treeLevel = user.level;
    user.worldState.leaves = Math.min((user.worldState.leaves || 0) + 1, 200);
    if (habit.streak > 0 && habit.streak % 7 === 0) {
      user.worldState.season = getNextSeason(user.worldState.season);
    }
    if (user.level >= 10) {
      user.worldState.flowers = Math.max(user.worldState.flowers || 0, 5);
    }
    if (user.level >= 15) {
      user.worldState.fruits = Math.max(user.worldState.fruits || 0, 3);
    }
    if (user.level >= 20) {
      user.worldState.glowIntensity = Math.max(user.worldState.glowIntensity || 0, 0.35);
    }

    const newlyUnlockedBadges = [];

    // Unlock Day One achievement
    this.addBadgeIfMissing(user, {
      name: 'Day One',
      description: 'Completed your first habit!',
      icon: 'Zap'
    }, newlyUnlockedBadges);

    // Unlock Consistency Pro (7-day streak)
    if (habit.streak >= 7) {
      this.addBadgeIfMissing(user, {
        name: 'Consistency Pro',
        description: 'Maintained a 7-day streak!',
        icon: 'Flame'
      }, newlyUnlockedBadges);
    }

    if (newLevel >= 5) {
      this.addBadgeIfMissing(user, {
        name: 'World Builder',
        description: 'Reach World Level 5.',
        icon: 'Star'
      }, newlyUnlockedBadges);
    }

    const hour = completionTime.getHours();
    if (hour < 8) {
      this.addBadgeIfMissing(user, {
        name: 'Early Bird',
        description: 'Complete a habit before 8 AM.',
        icon: 'Sun'
      }, newlyUnlockedBadges);
    }
    if (hour >= 22) {
      this.addBadgeIfMissing(user, {
        name: 'Night Owl',
        description: 'Complete a habit after 10 PM.',
        icon: 'Moon'
      }, newlyUnlockedBadges);
    }

    const totalCompletions = await this.getTotalCompletions(userId);
    if (totalCompletions >= 30) {
      this.addBadgeIfMissing(user, {
        name: 'Habit Master',
        description: 'Complete 30 total habits.',
        icon: 'Trophy'
      }, newlyUnlockedBadges);
    }

    await user.save();

    // Update or create daily progress record
    let progress = await ProgressRepository.findByUserAndDate(userId, today);
    if (!progress) {
      const activeHabitsCount = await HabitRepository.countActive(userId);
      progress = await ProgressRepository.create({
        userId,
        date: today,
        habitsCompleted: 1,
        totalHabits: activeHabitsCount,
        xpEarned: xpReward
      });
    } else {
      progress.habitsCompleted += 1;
      progress.xpEarned += xpReward;
      await progress.save();
    }

    return {
      habit,
      xpEarned: xpReward,
      leveledUp,
      newLevel: user.level,
      newXP: user.xp,
      worldState: user.worldState,
      newlyUnlockedBadges
    };
  }
}

module.exports = new HabitService();