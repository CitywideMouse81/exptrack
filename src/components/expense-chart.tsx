"use client";

import { useMemo } from "react";
import { useFinance } from "@/context/finance-context";
import { formatINR } from "@/lib/format";

const DEFAULT_COLORS = [
  "#e11d48",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#6366f1",
  "#a855f7",
  "#ec4899",
];

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, start: number, end: number) {
  const startPt = polarToCartesian(cx, cy, r, end);
  const endPt = polarToCartesian(cx, cy, r, start);
  const largeArc = end - start > 180 ? 1 : 0;
  return `M ${startPt.x} ${startPt.y} A ${r} ${r} 0 ${largeArc} 0 ${endPt.x} ${endPt.y} L ${cx} ${cy} Z`;
}

export function ExpenseChart() {
  const { categoryTotals } = useFinance();

  const slices = useMemo(
    () => categoryTotals.filter((item) => item.type === "expense" && item.total > 0),
    [categoryTotals]
  );
  const total = slices.reduce((sum, item) => sum + item.total, 0);

  // Pure arc angle calculations without render mutation
  const arcs = useMemo(() => {
    return slices.map((item, index) => {
      const precedingTotal = slices
        .slice(0, index)
        .reduce((sum, previous) => sum + previous.total, 0);
      const portion = total === 0 ? 0 : (item.total / total) * 360;
      const start = total === 0 ? 0 : (precedingTotal / total) * 360;
      const end = start + Math.max(portion, 0.4);
      return {
        ...item,
        start,
        end,
        color: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length],
      };
    });
  }, [slices, total]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300">
      <div className="mb-5 flex items-baseline justify-between border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Spending by Category
          </h2>
          <p className="text-xs text-slate-400">
            Ranked breakdown for selected month
          </p>
        </div>
        <span className="font-mono text-xs font-semibold text-slate-700">
          {formatINR(total)}
        </span>
      </div>

      {slices.length === 0 ? (
        <p className="py-10 text-center text-xs text-slate-400">
          No expense transactions recorded for this month.
        </p>
      ) : (
        <div className="space-y-6">
          {/* Donut Visualization */}
          <div className="flex justify-center">
            <svg viewBox="0 0 180 180" className="h-40 w-40 shrink-0">
              {arcs.length === 1 ? (
                <circle cx="90" cy="90" r="70" fill={arcs[0].color} />
              ) : (
                arcs.map((arc) => (
                  <path
                    key={arc.categoryId}
                    d={arcPath(90, 90, 70, arc.start, arc.end)}
                    fill={arc.color}
                  />
                ))
              )}
              <circle cx="90" cy="90" r="42" fill="white" />
              <text
                x="90"
                y="85"
                textAnchor="middle"
                className="fill-slate-400 text-[10px] font-medium"
              >
                Total Spent
              </text>
              <text
                x="90"
                y="103"
                textAnchor="middle"
                className="fill-slate-900 text-[12px] font-bold"
              >
                {formatINR(total)}
              </text>
            </svg>
          </div>

          {/* YNAB-Style Stack-Ranked Horizontal Bars */}
          <div className="space-y-3 pt-2">
            {arcs.map((item) => (
              <div key={item.categoryId} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-slate-800">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.name}</span>
                  </span>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-[11px] text-slate-400">
                      {item.percentage}%
                    </span>
                    <span className="font-semibold text-slate-900">
                      {formatINR(item.total)}
                    </span>
                  </div>
                </div>

                {/* Progress Track */}
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(item.percentage, 2)}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
