export function GoalMilestone({
  title,
  detail,
  progress,
  emoji,
}: {
  title: string;
  detail: string;
  progress: number;
  emoji: string;
}) {
  const pct = Math.max(0, Math.min(100, Math.round(progress * 100)));
  return (
    <article className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg">{emoji}</p>
          <h3 className="mt-1 text-xl">{title}</h3>
          <p className="mt-1 text-sm text-[#5d6b63]">{detail}</p>
        </div>
        <span className="serif text-2xl">{pct}%</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#efe4d4]">
        <div className="h-full rounded-full bg-leaf" style={{ width: `${pct}%` }} />
      </div>
    </article>
  );
}
