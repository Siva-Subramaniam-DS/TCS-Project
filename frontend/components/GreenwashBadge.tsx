const COPY = {
  verified: { text: "Verified", className: "bg-[#e5f6ea] text-leaf" },
  misleading: { text: "Misleading", className: "bg-[#fff1d6] text-amber" },
  false: { text: "False", className: "bg-[#fde4de] text-clay" },
} as const;

export function GreenwashBadge({ status, confidence }: { status: string; confidence?: number }) {
  const key = (status in COPY ? status : "misleading") as keyof typeof COPY;
  const item = COPY[key];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${item.className}`}>
      {item.text}
      {confidence != null && <span className="font-medium opacity-70">{Math.round(confidence * 100)}%</span>}
    </span>
  );
}
