const ICONS = {
  sprout: <path d="M10 17V9m0 0C10 5.5 7.5 3.5 3.5 3.5 3.5 7 6 9 10 9Zm0 0c0-2.8 2-4.5 6.5-4.5 0 3.3-2.5 5-6.5 5" />,
  globe: (
    <>
      <circle cx="10" cy="10" r="7" />
      <path d="M3 10h14M10 3c2 2 3 4.3 3 7s-1 5-3 7c-2-2-3-4.3-3-7s1-5 3-7Z" />
    </>
  ),
  link: <path d="M8.5 11.5a3 3 0 0 0 4.2 0l2.6-2.6a3 3 0 0 0-4.2-4.2l-.8.8M11.5 8.5a3 3 0 0 0-4.2 0l-2.6 2.6a3 3 0 0 0 4.2 4.2l.8-.8" />,
};

export function GoalMilestone({
  title,
  detail,
  progress,
  icon,
}: {
  title: string;
  detail: string;
  progress: number;
  icon: keyof typeof ICONS;
}) {
  const pct = Math.max(0, Math.min(100, Math.round(progress * 100)));
  const done = pct >= 100;
  return (
    <article className="card grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-3 p-4">
      <span className={`grid h-10 w-10 place-items-center rounded-full ${done ? "bg-leaf text-white" : "bg-lime text-ink"}`}>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          {ICONS[icon]}
        </svg>
      </span>
      <div className="min-w-0">
        <h3 className="text-lg leading-tight">{title}</h3>
        <p className="mt-0.5 text-sm text-[#55635b]">{detail}</p>
      </div>
      <span className="serif text-xl">{done ? "Done" : `${pct}%`}</span>
      <div
        className="col-span-3 h-1.5 overflow-hidden rounded-full bg-[#efe4d4]"
        role="progressbar"
        aria-label={title}
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="h-full rounded-full bg-leaf" style={{ width: `${pct}%` }} />
      </div>
    </article>
  );
}
