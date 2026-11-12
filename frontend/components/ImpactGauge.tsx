"use client";

type Props = {
  label: string;
  value: number;
  unit: string;
  max: number;
  tone?: string;
  caption?: string;
};

export function ImpactGauge({ label, value, unit, max, tone = "#1c7a4a", caption }: Props) {
  const pct = Math.max(0, Math.min(1, max === 0 ? 0 : value / max));
  const radius = 68;
  const length = Math.PI * radius;
  const dash = length * pct;
  const shown = value >= 100 ? Math.round(value).toLocaleString() : value.toLocaleString(undefined, { maximumFractionDigits: 1 });

  return (
    <div className="card p-5">
      <p className="kicker text-sea">{label}</p>
      <svg viewBox="0 0 180 118" className="mt-1 w-full">
        <path d="M18 96 A72 72 0 0 1 162 96" fill="none" stroke="#eadfcd" strokeWidth="12" strokeLinecap="round" />
        <path
          d="M18 96 A72 72 0 0 1 162 96"
          fill="none"
          stroke={tone}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${length}`}
        />
        <text x="90" y="82" textAnchor="middle" fontFamily="Fraunces, Georgia, serif" fontSize="26" fill="#14241c">
          {shown}
        </text>
        <text x="90" y="102" textAnchor="middle" fontFamily="Outfit, sans-serif" fontSize="11" fill="#5d6b63">
          {unit}
        </text>
      </svg>
      {caption && <p className="mt-1 text-sm text-[#5d6b63]">{caption}</p>}
    </div>
  );
}
