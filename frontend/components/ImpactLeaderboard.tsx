export type BoardRow = { name: string; city?: string; co2_kg: number; score: number; you?: boolean };

export function ImpactLeaderboard({ rows }: { rows: BoardRow[] }) {
  const ordered = [...rows].sort((a, b) => b.co2_kg - a.co2_kg);
  const top = ordered[0]?.co2_kg || 1;
  return (
    <div className="card overflow-hidden">
      <div className="px-5 pt-5">
        <p className="kicker text-sea">Community</p>
        <h2 className="mt-1 text-2xl">Who is moving the most carbon</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="mt-3 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[#eadfcd] text-xs text-[#55635b]">
              <th scope="col" className="w-10 py-2 pl-5 pr-2 font-medium">#</th>
              <th scope="col" className="py-2 font-medium">Investor</th>
              <th scope="col" className="px-3 py-2 text-right font-medium">kg CO₂</th>
              <th scope="col" className="py-2 pl-2 pr-5 text-right font-medium"><span className="sm:hidden">Score</span><span className="hidden sm:inline">Impact score</span></th>
            </tr>
          </thead>
          <tbody>
            {ordered.map((row, index) => (
              <tr key={row.name} className={`border-b border-[#f1e8d9] last:border-0 ${row.you ? "bg-lime/60" : ""}`}>
                <td className="py-3 pl-5 pr-2 font-semibold">{index + 1}</td>
                <td className="py-3">
                  <div className="font-semibold">{row.name}</div>
                  {row.city && <div className="text-xs text-[#55635b]">{row.city}</div>}
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <span className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-[#efe4d4] sm:block" aria-hidden="true">
                      <span className="block h-full rounded-full bg-leaf" style={{ width: `${(row.co2_kg / top) * 100}%` }} />
                    </span>
                    <span className="w-10 text-right">{row.co2_kg.toLocaleString()}</span>
                  </div>
                </td>
                <td className="py-3 pl-2 pr-5 text-right text-[#3d4f46]">{row.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
