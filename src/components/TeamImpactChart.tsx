"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { TeamType } from "@/types";

interface ChartDataPoint {
  team: TeamType;
  totalImpact: number;
  totalHoursLost: number;
  itemCount: number;
}

interface TeamImpactChartProps {
  data: ChartDataPoint[];
}

const TEAM_COLORS: Record<TeamType, string> = {
  Industrial: "#10b981", // Emerald
  Vehicle: "#0ea5e9", // Sky
  "UI-UX": "#f59e0b", // Amber
  CMF: "#a855f7", // Purple
};

export function TeamImpactChart({ data }: TeamImpactChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-[280px] w-full flex items-center justify-center bg-zinc-50 dark:bg-zinc-900/40 rounded-xl">
        <div className="text-xs text-zinc-400 font-mono animate-pulse">Loading Team Impact Chart...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-[280px] pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
          <XAxis
            dataKey="team"
            stroke="#71717a"
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: "#3f3f46", opacity: 0.2 }}
          />
          <YAxis
            stroke="#71717a"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            label={{
              value: "Impact Score",
              angle: -90,
              position: "insideLeft",
              fill: "#71717a",
              fontSize: 10,
              offset: 25,
            }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as ChartDataPoint;
                return (
                  <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 shadow-lg text-xs">
                    <p className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 mb-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ backgroundColor: TEAM_COLORS[item.team] }}
                      />
                      <span>{item.team} Design</span>
                    </p>
                    <p className="text-zinc-600 dark:text-zinc-300">
                      Total Impact Score: <span className="font-mono font-bold text-zinc-900 dark:text-zinc-50">{item.totalImpact}</span>
                    </p>
                    <p className="text-zinc-600 dark:text-zinc-300">
                      Lost Weekly Hours: <span className="font-mono font-bold text-zinc-900 dark:text-zinc-50">{item.totalHoursLost}h</span>
                    </p>
                    <p className="text-zinc-500 text-[11px] mt-1">
                      {item.itemCount} friction bottleneck{item.itemCount === 1 ? "" : "s"} logged
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="totalImpact" radius={[6, 6, 0, 0]}>
            {data.map((entry) => (
              <Cell key={`cell-${entry.team}`} fill={TEAM_COLORS[entry.team] || "#10b981"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
