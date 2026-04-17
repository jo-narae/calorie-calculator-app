'use client';

interface StatCardsProps {
  target: number;
  consumed: number;
}

export default function StatCards({ target, consumed }: StatCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-card-bg rounded-2xl p-4 shadow-sm">
        <div className="text-xl mb-1">🎯</div>
        <div className="text-[11px] text-text-muted mb-1">목표</div>
        <div className="text-[22px] font-bold text-orange-main">{target.toLocaleString()}</div>
      </div>
      <div className="bg-card-bg rounded-2xl p-4 shadow-sm">
        <div className="text-xl mb-1">🍽️</div>
        <div className="text-[11px] text-text-muted mb-1">섭취</div>
        <div className="text-[22px] font-bold text-green-dark">{consumed.toLocaleString()}</div>
      </div>
    </div>
  );
}
