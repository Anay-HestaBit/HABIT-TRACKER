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

const sanitizeHabitInput = (data = {}) => {
  const name = String(data.name || '').trim();
  const description = String(data.description || '').trim();
  const frequency = data.frequency === 'weekly' ? 'weekly' : 'daily';
  const color = /^#[0-9a-fA-F]{6}$/.test(data.color) ? data.color : '#8B5CF6';
  const icon = typeof data.icon === 'string' && data.icon.trim() ? data.icon.trim() : 'star';

  return { name, description, frequency, color, icon };
};

const getShieldCooldownMs = () => {
  const rawDays = Number.parseInt(process.env.STREAK_SHIELD_COOLDOWN_DAYS || '7', 10);
  const days = Number.isFinite(rawDays) && rawDays > 0 ? rawDays : 7;
  return days * 24 * 60 * 60 * 1000;
};

const refreshShieldAvailability = (user) => {
  if (!user?.streakShield) return;
  if (user.streakShield.available) return;

  const resetAt = user.streakShield.resetsAt
    ? new Date(user.streakShield.resetsAt)
    : null;

  if (resetAt && resetAt.getTime() <= Date.now()) {
    user.streakShield.available = true;
    user.streakShield.resetsAt = null;
  }
};

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
    const payload = sanitizeHabitInput(habitData);
    if (!payload.name) throw new Error('Habit name is required');
    logger.info(`Creating habit for user ${userId}: ${payload.name}`);
    const habit = await HabitRepository.create({ ...payload, userId });

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

  async createHabitsBulk(userId, habitsData) {
    if (!Array.isArray(habitsData) || habitsData.length === 0) {
      throw new Error('No habits provided');
    }

    if (habitsData.length > 10) {
      throw new Error('Too many habits in one request');
    }

    const user = await UserRepository.findById(userId);
    const initialHabitCount = await HabitRepository.countActive(userId);
    const createdHabits = [];

    for (const habitData of habitsData) {
      const payload = sanitizeHabitInput(habitData);
      if (!payload.name) {
        throw new Error('Habit name is required');
      }
      const habit = await HabitRepository.create({ ...payload, userId });
      createdHabits.push(habit);
    }

    const newlyUnlocked = [];
    if (initialHabitCount === 0 && createdHabits.length > 0) {
      this.addBadgeIfMissing(user, {
        name: 'Creator',
        description: 'Created your first habit!',
        icon: 'PlusCircle'
      }, newlyUnlocked);
    }

    if (newlyUnlocked.length > 0) {
      await user.save();
      logger.info(`Achievement Unlocked: Creator for user ${userId}`);
    }

    return { habits: createdHabits, newlyUnlockedBadges: newlyUnlocked };
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
    const habitPromise = habit.save();

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

    const userPromise = user.save();

    // Update or create daily progress record
    const progressPromise = (async () => {
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
    })();

    await Promise.all([habitPromise, userPromise, progressPromise]);

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

  async useStreakShield(habitId, userId) {
    logger.info(`Using streak shield for habit ${habitId} by user ${userId}`);
    const habit = await HabitRepository.findOneWithUser(habitId, userId);
    if (!habit) throw new Error('Habit not found');

    if (habit.isCompletedToday()) {
      throw new Error('Habit already completed today');
    }

    const user = await UserRepository.findById(userId);
    if (!user.streakShield) {
      user.streakShield = { available: true, lastUsed: null, resetsAt: null };
    }
    refreshShieldAvailability(user);

    if (!user?.streakShield?.available) {
      throw new Error('Streak shield not available');
    }

    const today = getUTCMidnight();
    const completionTime = new Date();

    habit.completions.push({
      date: today,
      completedAt: completionTime,
      shielded: true,
    });
    habit.streak = habit.calculateStreak();
    if (habit.streak > habit.longestStreak) {
      habit.longestStreak = habit.streak;
    }

    user.streakShield.available = false;
    user.streakShield.lastUsed = completionTime;
    user.streakShield.resetsAt = new Date(Date.now() + getShieldCooldownMs());

    const newlyUnlockedBadges = [];
    this.addBadgeIfMissing(user, {
      name: 'Streak Shield',
      description: 'Use your first streak shield.',
      icon: 'Shield',
    }, newlyUnlockedBadges);

    const progressPromise = (async () => {
      let progress = await ProgressRepository.findByUserAndDate(userId, today);
      if (!progress) {
        const activeHabitsCount = await HabitRepository.countActive(userId);
        progress = await ProgressRepository.create({
          userId,
          date: today,
          habitsCompleted: 1,
          totalHabits: activeHabitsCount,
          xpEarned: 0,
        });
      } else {
        progress.habitsCompleted += 1;
        await progress.save();
      }
    })();

    await Promise.all([habit.save(), user.save(), progressPromise]);

    return {
      habit,
      streakShield: user.streakShield,
      newlyUnlockedBadges,
    };
  }
}

module.exports = new HabitService();