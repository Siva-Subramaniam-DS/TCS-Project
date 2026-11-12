export type BoardRow = { name: string; city?: string; co2_kg: number; score: number; you?: boolean };

export function ImpactLeaderboard({ rows }: { rows: BoardRow[] }) {
  const ordered = [...rows].sort((a, b) => b.co2_kg - a.co2_kg);
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5">
        <p className="kicker text-sea">Community</p>
        <p className="text-xs text-[#5d6b63]">kg CO₂ modelled / year</p>
      </div>
      <table className="mt-3 w-full text-left text-sm">
        <tbody>
          {ordered.map((row, index) => (
            <tr key={row.name} className={row.you ? "bg-lime/60" : ""}>
              <td className="w-10 px-5 py-3 font-semibold">{index + 1}</td>
              <td className="py-3">
                <div className="font-semibold">{row.name}</div>
                {row.city && <div className="text-xs text-[#5d6b63]">{row.city}</div>}
              </td>
              <td className="px-3 py-3 text-right">{row.co2_kg.toLocaleString()}</td>
              <td className="px-5 py-3 text-right text-[#5d6b63]">{row.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
