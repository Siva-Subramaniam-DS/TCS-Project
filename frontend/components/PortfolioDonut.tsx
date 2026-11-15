"use client";

import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#1c7a4a", "#1d6a72", "#c9841a", "#14241c", "#c4543a", "#8eaf3a"];

type Slice = { name: string; value: number };

export function PortfolioDonut({ slices }: { slices: Slice[] }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!slices.length) {
    return <div className="card grid h-[280px] place-items-center text-sm text-[#55635b]">No holdings yet.</div>;
  }
  return (
    <div className="card p-4">
      <p className="kicker px-1 text-sea">Allocation</p>
      <div className="relative h-[200px]">
        {ready && (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={slices} dataKey="value" nameKey="name" innerRadius={62} outerRadius={92} paddingAngle={2} stroke="#fffaf2" strokeWidth={2}>
                {slices.map((slice, index) => (
                  <Cell key={slice.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `${value}%`}
                contentStyle={{ borderRadius: 12, border: "1px solid #eadfcd", background: "#fffaf2", fontSize: 13 }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="serif text-2xl leading-none">{slices.length}</p>
            <p className="mt-1 text-[11px] text-[#55635b]">funds</p>
          </div>
        </div>
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 px-1 text-sm">
        {slices.map((slice, index) => (
          <li key={slice.name} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: COLORS[index % COLORS.length] }} />
            <span className="mono text-xs">{slice.name}</span>
            <span className="num ml-auto text-[#55635b]">{Math.round(slice.value)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
