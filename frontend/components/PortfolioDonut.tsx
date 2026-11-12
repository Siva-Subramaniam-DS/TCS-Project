"use client";

import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#1c7a4a", "#1d6a72", "#c9841a", "#14241c", "#c4543a", "#8eaf3a"];

type Slice = { name: string; value: number };

export function PortfolioDonut({ slices }: { slices: Slice[] }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!slices.length) {
    return <div className="card grid h-[280px] place-items-center text-sm text-[#5d6b63]">No holdings yet.</div>;
  }
  return (
    <div className="card h-[320px] p-4">
      <p className="kicker px-2 text-sea">Allocation</p>
      {ready && (
        <ResponsiveContainer width="100%" height="86%">
          <PieChart>
            <Pie data={slices} dataKey="value" nameKey="name" innerRadius={68} outerRadius={100} paddingAngle={3} stroke="#fffaf2">
              {slices.map((slice, index) => (
                <Cell key={slice.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `${value}%`} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
