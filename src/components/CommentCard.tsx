'use client';

interface CommentCardProps {
  remaining: number;
  total: number;
}

function getMessage(remaining: number, total: number): { emoji: string; text: string } {
  if (total === 0) return { emoji: '👋', text: '오늘도 건강한 하루 보내���요!' };

  const ratio = remaining / total;

  if (remaining <= 0) {
    return { emoji: '😅', text: '오늘은 좀 넘었어요. 내일 가볍게 시작해봐요!' };
  }
  if (ratio <= 0.1) {
    return { emoji: '🔥', text: '거의 다 왔어요, 간식은 참아볼까요?' };
  }
  if (ratio <= 0.3) {
    return { emoji: '⚡', text: '잘하고 있어요, 저녁은 가볍게!' };
  }
  if (ratio <= 0.7) {
    return { emoji: '💪', text: '잘하고 있어요, 저녁은 600kcal 이내로!' };
  }
  return { emoji: '🌿', text: '여유 있어요, 든든하게 드세요!' };
}

export default function CommentCard({ remaining, total }: CommentCardProps) {
  const { emoji, text } = getMessage(remaining, total);

  return (
    <div className="px-5 py-4 bg-gradient-to-br from-[#FFF8E1] to-[#F1F8E9] rounded-2xl">
      <span className="text-lg mr-2">{emoji}</span>
      <span className="text-sm text-text-secondary">{text}</span>
    </div>
  );
}
