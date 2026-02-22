import { useEffect, useState } from 'react';
import { Brain, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { predictHabitCompletion } from '../../lib/mlModel';

export default function MLPrediction() {
  const { user } = useAuth();
  const [prediction, setPrediction] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPrediction();
    }
  }, [user]);

  const loadPrediction = async () => {
    if (!user) return;

    setLoading(true);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    const { data: logsData } = await supabase
      .from('habit_logs')
      .select('date, status')
      .eq('user_id', user.id)
      .gte('date', thirtyDaysAgoStr)
      .order('date', { ascending: true });

    if (logsData && logsData.length > 0) {
      const probability = predictHabitCompletion(logsData);
      setPrediction(probability);
    } else {
      setPrediction(null);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="glass-card p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="text-purple-400" size={24} />
          <h2 className="text-xl font-semibold text-white">AI Prediction</h2>
        </div>
        <p className="text-gray-400">Analyzing your habits...</p>
      </div>
    );
  }

  if (prediction === null) {
    return (
      <div className="glass-card p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="text-purple-400" size={24} />
          <h2 className="text-xl font-semibold text-white">AI Prediction</h2>
        </div>
        <p className="text-gray-400">
          Track habits for a few more days to see AI predictions.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 rounded-xl border-2 border-purple-500/30">
      <div className="flex items-center gap-3 mb-4">
        <Brain className="text-purple-400" size={24} />
        <h2 className="text-xl font-semibold text-white">AI Prediction</h2>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <p className="text-gray-300 mb-2">Tomorrow's Completion Likelihood:</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-purple-400">{prediction}%</span>
            <TrendingUp className="text-green-400" size={20} />
          </div>
        </div>
        <div className="w-20 h-20">
          <svg viewBox="0 0 100 100" className="transform -rotate-90">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="rgba(148, 163, 184, 0.2)"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#a855f7"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(prediction / 100) * 251.2} 251.2`}
              className="transition-all duration-1000"
            />
          </svg>
        </div>
      </div>
      <p className="text-sm text-gray-400 mt-4">
        Based on your last 30 days of habit tracking data.
      </p>
    </div>
  );
}
