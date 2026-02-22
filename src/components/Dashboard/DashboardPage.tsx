import { useState, useEffect } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { HabitWithStatus } from '../../lib/types';
import HabitItem from './HabitItem';
import ProgressCircle from './ProgressCircle';
import MotivationalPopup from './MotivationalPopup';
import MLPrediction from './MLPrediction';
import Recommendations from './Recommendations';
import confetti from 'canvas-confetti';

export default function DashboardPage() {
  const { user } = useAuth();
  const [habitName, setHabitName] = useState('');
  const [habits, setHabits] = useState<HabitWithStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [dailyProgress, setDailyProgress] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  useEffect(() => {
    if (user) {
      loadHabits();
    }
  }, [user]);

  const loadHabits = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];

    const { data: habitsData } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (habitsData) {
      const habitsWithStatus = await Promise.all(
        habitsData.map(async (habit) => {
          const { data: logData } = await supabase
            .from('habit_logs')
            .select('*')
            .eq('habit_id', habit.id)
            .eq('date', today)
            .maybeSingle();

          const { data: streakData } = await supabase
            .from('habit_logs')
            .select('date, status')
            .eq('habit_id', habit.id)
            .eq('status', true)
            .order('date', { ascending: false });

          let streak = 0;
          if (streakData && streakData.length > 0) {
            const dates = streakData.map(d => d.date);
            for (let i = 0; i < dates.length; i++) {
              const expectedDate = new Date();
              expectedDate.setDate(expectedDate.getDate() - i);
              const expectedDateStr = expectedDate.toISOString().split('T')[0];

              if (dates.includes(expectedDateStr)) {
                streak++;
              } else {
                break;
              }
            }
          }

          return {
            ...habit,
            status: logData?.status || false,
            streak,
          };
        })
      );

      setHabits(habitsWithStatus);
      calculateProgress(habitsWithStatus);
    }
  };

  const calculateProgress = (habitsList: HabitWithStatus[]) => {
    if (habitsList.length === 0) {
      setDailyProgress(0);
      return;
    }

    const completed = habitsList.filter((h) => h.status).length;
    const percentage = Math.round((completed / habitsList.length) * 100);
    setDailyProgress(percentage);

    if (percentage === 100 && habitsList.length > 0) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      setPopupMessage('Perfect Day! All habits completed!');
      setShowPopup(true);
    }
  };

  const handleAddHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitName.trim() || !user) return;

    setLoading(true);

    const { error } = await supabase
      .from('habits')
      .insert([{ user_id: user.id, name: habitName.trim() }]);

    if (!error) {
      setHabitName('');
      await loadHabits();
    }

    setLoading(false);
  };

  const handleToggleHabit = async (habitId: string, currentStatus: boolean) => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const newStatus = !currentStatus;

    const { data: existingLog } = await supabase
      .from('habit_logs')
      .select('id')
      .eq('habit_id', habitId)
      .eq('date', today)
      .maybeSingle();

    if (existingLog) {
      await supabase
        .from('habit_logs')
        .update({ status: newStatus })
        .eq('id', existingLog.id);
    } else {
      await supabase
        .from('habit_logs')
        .insert([
          {
            habit_id: habitId,
            user_id: user.id,
            date: today,
            status: newStatus,
          },
        ]);
    }

    await loadHabits();

    if (newStatus) {
      const motivationalMessages = [
        'Great job! Keep it up!',
        'You are on fire!',
        'Consistency is key!',
        'One step closer to your goals!',
        'Amazing progress!',
      ];
      const randomMessage =
        motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
      setPopupMessage(randomMessage);
      setShowPopup(true);
    }
  };

  const handleDeleteHabit = async (habitId: string) => {
    await supabase.from('habits').delete().eq('id', habitId);
    await loadHabits();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Track your daily habits</p>
        </div>
        <div className="flex items-center gap-2 text-purple-400">
          <Sparkles size={20} />
          <span className="font-semibold">AI-Powered</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4">Add New Habit</h2>
            <form onSubmit={handleAddHabit} className="flex gap-3">
              <input
                type="text"
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
                placeholder="Enter habit name..."
                className="input-field flex-1"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center gap-2"
              >
                <Plus size={20} />
                Add
              </button>
            </form>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <h2 className="text-xl font-semibold text-white mb-4">Today's Habits</h2>
            {habits.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                No habits yet. Add your first habit to get started!
              </p>
            ) : (
              <div className="space-y-3">
                {habits.map((habit) => (
                  <HabitItem
                    key={habit.id}
                    habit={habit}
                    onToggle={handleToggleHabit}
                    onDelete={handleDeleteHabit}
                  />
                ))}
              </div>
            )}
          </div>

          <MLPrediction />
        </div>

        <div className="space-y-6">
          <ProgressCircle percentage={dailyProgress} />
          <Recommendations />
        </div>
      </div>

      {showPopup && (
        <MotivationalPopup
          message={popupMessage}
          onClose={() => setShowPopup(false)}
        />
      )}
    </div>
  );
}
