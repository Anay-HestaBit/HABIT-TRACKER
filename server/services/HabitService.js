const HabitRepository = require('../repositories/HabitRepository');
const UserRepository = require('../repositories/UserRepository');
const ProgressRepository = require('../repositories/ProgressRepository');
const logger = require('../utils/logger');

class HabitService {
  async getUserHabits(userId) {
    logger.info(`Fetching habits for user: ${userId}`);
    return HabitRepository.findActiveByUserId(userId);
  }

  async createHabit(userId, habitData) {
    logger.info(`Creating habit for user ${userId}: ${habitData.name}`);
    const habit = await HabitRepository.create({ ...habitData, userId });

    // Unlock "Creator" Achievement
    const user = await UserRepository.findById(userId);
    const hasCreator = user.badges.some(b => b.name === 'Creator');
    if (!hasCreator) {
      user.badges.push({
        name: 'Creator',
        description: 'Created your first habit!',
        icon: 'PlusCircle'
      });
      await user.save();
      logger.info(`Achievement Unlocked: Creator for user ${userId}`);
    }
    
    return habit;
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    habit.completions.push({ date: today });
    habit.streak = habit.calculateStreak();
    if (habit.streak > habit.longestStreak) {
      habit.longestStreak = habit.streak;
    }
    await habit.save();

    const xpReward = 10 + (habit.streak * 2);
    const user = await UserRepository.findById(userId);
    user.xp += xpReward;
    
    const newLevel = Math.floor(user.xp / 100) + 1;
    let leveledUp = false;
    if (newLevel > user.level) {
      user.level = newLevel;
      user.worldState.treeLevel = newLevel;
      user.worldState.branches += 1;
      user.worldState.leaves += 5;
      leveledUp = true;
      logger.info(`User ${userId} leveled up to ${newLevel}`);
    }
    await user.save();

    // Unlock Achievements
    const hasDayOne = user.badges.some(b => b.name === 'Day One');
    if (!hasDayOne) {
      user.badges.push({
        name: 'Day One',
        description: 'Completed your first habit!',
        icon: 'Zap'
      });
      await user.save();
      logger.info(`Achievement Unlocked: Day One for user ${userId}`);
    }

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
      worldState: user.worldState
    };
  }
}

module.exports = new HabitService();
