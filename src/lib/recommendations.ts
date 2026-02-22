import { Recommendation } from './types';

interface Habit {
  id: string;
  name: string;
}

interface HabitLog {
  habit_id: string;
  status: boolean;
  date: string;
}

export function generateRecommendations(
  habits: Habit[],
  logs: HabitLog[]
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  if (habits.length === 0) {
    return [
      {
        type: 'info',
        message: 'Start by adding your first habit to begin tracking!',
      },
    ];
  }

  const habitStats = habits.map((habit) => {
    const habitLogs = logs.filter((log) => log.habit_id === habit.id);
    const completed = habitLogs.filter((log) => log.status).length;
    const total = habitLogs.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;

    let currentStreak = 0;
    const sortedLogs = habitLogs
      .filter((log) => log.status)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (sortedLogs.length > 0) {
      for (let i = 0; i < sortedLogs.length; i++) {
        const expectedDate = new Date();
        expectedDate.setDate(expectedDate.getDate() - i);
        const expectedDateStr = expectedDate.toISOString().split('T')[0];

        if (sortedLogs[i]?.date === expectedDateStr) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    return {
      habit,
      percentage,
      total,
      completed,
      streak: currentStreak,
    };
  });

  const totalLogs = logs.length;
  const totalCompleted = logs.filter((log) => log.status).length;
  const overallProductivity = totalLogs > 0 ? (totalCompleted / totalLogs) * 100 : 0;

  if (overallProductivity < 50 && totalLogs > 10) {
    recommendations.push({
      type: 'warning',
      message:
        'Your overall productivity is below 50%. Consider breaking down your habits into smaller, more manageable tasks.',
    });
  }

  const lowPerformingHabits = habitStats.filter(
    (stat) => stat.percentage < 40 && stat.total >= 5
  );
  if (lowPerformingHabits.length > 0) {
    const habitName = lowPerformingHabits[0].habit.name;
    recommendations.push({
      type: 'warning',
      message: `"${habitName}" is frequently missed. Try scheduling it at a different time of day when you have more energy.`,
    });
  }

  const highStreakHabits = habitStats.filter((stat) => stat.streak >= 7);
  if (highStreakHabits.length > 0) {
    const habitName = highStreakHabits[0].habit.name;
    recommendations.push({
      type: 'success',
      message: `Amazing ${highStreakHabits[0].streak}-day streak on "${habitName}"! Keep up the excellent work!`,
    });
  }

  if (overallProductivity >= 80 && totalLogs > 10) {
    recommendations.push({
      type: 'success',
      message: 'Outstanding performance! You are maintaining excellent consistency across all habits.',
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      type: 'info',
      message: 'Keep tracking your habits to receive personalized recommendations!',
    });
  }

  return recommendations.slice(0, 3);
}
