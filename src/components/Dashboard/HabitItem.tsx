import { Trash2, Flame } from 'lucide-react';
import { HabitWithStatus } from '../../lib/types';

interface HabitItemProps {
  habit: HabitWithStatus;
  onToggle: (habitId: string, currentStatus: boolean) => void;
  onDelete: (habitId: string) => void;
}

export default function HabitItem({ habit, onToggle, onDelete }: HabitItemProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800/70 transition-all group">
      <button
        onClick={() => onToggle(habit.id, habit.status || false)}
        className="relative w-6 h-6 flex-shrink-0"
      >
        <div
          className={`w-6 h-6 rounded-md border-2 transition-all duration-300 ${
            habit.status
              ? 'bg-purple-600 border-purple-600 scale-110'
              : 'border-gray-400 hover:border-purple-400'
          }`}
        >
          {habit.status && (
            <svg
              className="w-full h-full text-white animate-checkmark"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>
      </button>

      <div className="flex-1">
        <p
          className={`font-medium transition-all ${
            habit.status ? 'text-gray-400 line-through' : 'text-white'
          }`}
        >
          {habit.name}
        </p>
        {habit.streak !== undefined && habit.streak > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <Flame size={14} className="text-orange-500" />
            <span className="text-xs text-orange-500 font-semibold">
              {habit.streak} day streak
            </span>
          </div>
        )}
      </div>

      <button
        onClick={() => onDelete(habit.id)}
        className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-400 transition-all"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}
