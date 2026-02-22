import { useEffect, useState } from 'react';
import { Lightbulb, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Recommendation } from '../../lib/types';
import { generateRecommendations } from '../../lib/recommendations';

export default function Recommendations() {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadRecommendations();
    }
  }, [user]);

  const loadRecommendations = async () => {
    if (!user) return;

    setLoading(true);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    const { data: habitsData } = await supabase
      .from('habits')
      .select('id, name')
      .eq('user_id', user.id);

    const { data: logsData } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', thirtyDaysAgoStr);

    if (habitsData && logsData) {
      const recs = generateRecommendations(habitsData, logsData);
      setRecommendations(recs);
    }

    setLoading(false);
  };

  const getIcon = (type: Recommendation['type']) => {
    switch (type) {
      case 'warning':
        return <AlertCircle size={20} className="text-yellow-400" />;
      case 'success':
        return <CheckCircle size={20} className="text-green-400" />;
      case 'info':
        return <Info size={20} className="text-blue-400" />;
    }
  };

  const getBgColor = (type: Recommendation['type']) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/30';
      case 'success':
        return 'bg-green-500/10 border-green-500/30';
      case 'info':
        return 'bg-blue-500/10 border-blue-500/30';
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-6 rounded-xl">
        <div className="flex items-center gap-3 mb-4">
          <Lightbulb className="text-yellow-400" size={24} />
          <h2 className="text-xl font-semibold text-white">Smart Tips</h2>
        </div>
        <p className="text-gray-400">Generating recommendations...</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 rounded-xl">
      <div className="flex items-center gap-3 mb-4">
        <Lightbulb className="text-yellow-400" size={24} />
        <h2 className="text-xl font-semibold text-white">Smart Tips</h2>
      </div>
      {recommendations.length === 0 ? (
        <p className="text-gray-400">Keep tracking to get personalized tips!</p>
      ) : (
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getBgColor(rec.type)}`}
            >
              <div className="flex items-start gap-3">
                {getIcon(rec.type)}
                <p className="text-sm text-gray-200 flex-1">{rec.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
