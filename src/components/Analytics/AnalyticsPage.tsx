import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { TrendingUp, Calendar, Award } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface MonthlyStats {
  totalProductivity: number;
  mostConsistent: string;
  leastConsistent: string;
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [weeklyData, setWeeklyData] = useState<number[]>([]);
  const [weekLabels, setWeekLabels] = useState<string[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats>({
    totalProductivity: 0,
    mostConsistent: 'N/A',
    leastConsistent: 'N/A',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user]);

  const loadAnalytics = async () => {
    if (!user) return;

    setLoading(true);

    const dates = [];
    const labels = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    }

    const { data: habitsData } = await supabase
      .from('habits')
      .select('id')
      .eq('user_id', user.id);

    const totalHabits = habitsData?.length || 0;

    const productivityData = await Promise.all(
      dates.map(async (date) => {
        if (totalHabits === 0) return 0;

        const { data: logsData } = await supabase
          .from('habit_logs')
          .select('status')
          .eq('user_id', user.id)
          .eq('date', date)
          .eq('status', true);

        const completed = logsData?.length || 0;
        return Math.round((completed / totalHabits) * 100);
      })
    );

    setWeeklyData(productivityData);
    setWeekLabels(labels);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    const { data: monthLogsData } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', thirtyDaysAgoStr);

    if (habitsData && monthLogsData) {
      const habitStats = habitsData.map((habit) => {
        const habitLogs = monthLogsData.filter((log) => log.habit_id === habit.id);
        const completed = habitLogs.filter((log) => log.status).length;
        const total = habitLogs.length;
        return {
          habitId: habit.id,
          percentage: total > 0 ? (completed / total) * 100 : 0,
        };
      });

      const totalDays = 30;
      const totalPossible = totalHabits * totalDays;
      const totalCompleted = monthLogsData.filter((log) => log.status).length;
      const overallProductivity =
        totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

      habitStats.sort((a, b) => b.percentage - a.percentage);

      const { data: mostConsistentHabit } = await supabase
        .from('habits')
        .select('name')
        .eq('id', habitStats[0]?.habitId)
        .maybeSingle();

      const { data: leastConsistentHabit } = await supabase
        .from('habits')
        .select('name')
        .eq('id', habitStats[habitStats.length - 1]?.habitId)
        .maybeSingle();

      setMonthlyStats({
        totalProductivity: overallProductivity,
        mostConsistent: mostConsistentHabit?.name || 'N/A',
        leastConsistent: leastConsistentHabit?.name || 'N/A',
      });
    }

    setLoading(false);
  };

  const chartData = {
    labels: weekLabels,
    datasets: [
      {
        label: 'Daily Productivity %',
        data: weeklyData,
        fill: true,
        borderColor: '#9333ea',
        backgroundColor: 'rgba(147, 51, 234, 0.1)',
        tension: 0.4,
        pointBackgroundColor: '#9333ea',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        borderColor: '#9333ea',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        },
        ticks: {
          color: '#94a3b8',
          callback: (value: number | string) => `${value}%`,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#94a3b8',
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <p className="text-gray-400">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <p className="text-gray-400 mt-1">Track your progress over time</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <TrendingUp className="text-purple-400" size={24} />
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Monthly Productivity</h3>
          </div>
          <p className="text-3xl font-bold text-white">{monthlyStats.totalProductivity}%</p>
        </div>

        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Award className="text-green-400" size={24} />
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Most Consistent</h3>
          </div>
          <p className="text-xl font-semibold text-white truncate">
            {monthlyStats.mostConsistent}
          </p>
        </div>

        <div className="glass-card p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Calendar className="text-orange-400" size={24} />
            </div>
            <h3 className="text-gray-400 text-sm font-medium">Needs Attention</h3>
          </div>
          <p className="text-xl font-semibold text-white truncate">
            {monthlyStats.leastConsistent}
          </p>
        </div>
      </div>

      <div className="glass-card p-6 rounded-xl">
        <h2 className="text-xl font-semibold text-white mb-6">Weekly Productivity Trend</h2>
        <div className="h-80">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}
