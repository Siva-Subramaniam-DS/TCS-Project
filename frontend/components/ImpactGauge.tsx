"use client";

type Props = {
  label: string;
  value: number;
  unit: string;
  max: number;
  tone?: string;
  caption?: string;
};

const R = 72;
const ARC = `M18 96 A${R} ${R} 0 0 1 162 96`;
const LENGTH = Math.PI * R;

export function ImpactGauge({ label, value, unit, max, tone = "#1c7a4a", caption }: Props) {
  const pct = Math.max(0, Math.min(1, max === 0 ? 0 : value / max));
  const dash = LENGTH * pct;
  const shown = value >= 100 ? Math.round(value).toLocaleString() : value.toLocaleString(undefined, { maximumFractionDigits: 1 });

  return (
    <div className="card p-4 sm:p-5">
      <p className="kicker text-sea">{label}</p>
      <svg viewBox="0 0 180 112" className="mx-auto mt-1 w-full max-w-[220px]" role="img" aria-label={`${label}: ${shown} ${unit}`}>
        <path d={ARC} fill="none" stroke="#eadfcd" strokeWidth="12" strokeLinecap="round" />
        {dash > 0.5 && (
          <path
            d={ARC}
            fill="none"
            stroke={tone}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${LENGTH + 20}`}
            style={{ transition: "stroke-dasharray 0.9s cubic-bezier(0.16, 1, 0.3, 1)" }}
          />
        )}
        <text x="90" y="82" textAnchor="middle" fontFamily="Fraunces, Georgia, serif" fontSize="28" fill="#14241c">
          {shown}
        </text>
        <text x="90" y="102" textAnchor="middle" fontFamily="Outfit, sans-serif" fontSize="11" fill="#55635b">
          {unit}
        </text>
      </svg>
      {caption && <p className="mt-1 text-sm text-[#55635b]">{caption}</p>}
    </div>
  );
}
