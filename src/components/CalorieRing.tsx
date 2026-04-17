'use client';

interface CalorieRingProps {
  remaining: number;
  total: number;
  consumed: number;
}

export default function CalorieRing({ remaining, total, consumed }: CalorieRingProps) {
  const ratio = Math.min(consumed / total, 1.5);
  const isOver = consumed > total;

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - circumference * Math.min(ratio, 1);

  return (
    <div className="relative w-[180px] h-[180px] mx-auto">
      <svg width="180" height="180" viewBox="0 0 180 180" className="-rotate-90">
        {/* 트랙 */}
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="#e0e0d0"
          strokeWidth="12"
        />
        {/* 채우기 */}
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke={isOver ? 'url(#grad-over)' : 'url(#grad-normal)'}
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
        <defs>
          <linearGradient id="grad-normal" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#66BB6A" />
            <stop offset="100%" stopColor="#FFA726" />
          </linearGradient>
          <linearGradient id="grad-over" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#EF5350" />
            <stop offset="100%" stopColor="#FF7043" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={`text-[44px] font-extrabold leading-none ${
            isOver ? 'text-red-warn' : 'text-green-dark'
          }`}
        >
          {remaining}
        </span>
        <span className="text-xs text-text-muted mt-1">kcal 남음</span>
      </div>
    </div>
  );
}
