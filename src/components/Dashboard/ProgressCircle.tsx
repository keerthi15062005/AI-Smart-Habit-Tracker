interface ProgressCircleProps {
  percentage: number;
}

export default function ProgressCircle({ percentage }: ProgressCircleProps) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="glass-card p-6 rounded-xl">
      <h2 className="text-xl font-semibold text-white mb-6">Daily Progress</h2>
      <div className="flex flex-col items-center">
        <div className="relative">
          <svg className="transform -rotate-90" width="180" height="180">
            <circle
              cx="90"
              cy="90"
              r={radius}
              stroke="rgba(148, 163, 184, 0.2)"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="90"
              cy="90"
              r={radius}
              stroke="url(#gradient)"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9333ea" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-bold text-white">{percentage}%</div>
              <div className="text-sm text-gray-400 mt-1">Complete</div>
            </div>
          </div>
        </div>
        <div className="mt-6 text-center">
          <p className="text-gray-300">
            {percentage === 100
              ? 'Perfect! All habits completed!'
              : percentage >= 70
              ? 'Great progress today!'
              : percentage >= 40
              ? 'Keep going, you can do it!'
              : 'Start completing your habits!'}
          </p>
        </div>
      </div>
    </div>
  );
}
