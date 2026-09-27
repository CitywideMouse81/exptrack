"use client";

import { useMemo } from "react";
import { useFinance } from "@/context/finance-context";
import { formatINR } from "@/lib/format";

const COLORS = [
  "#e11d48",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#6366f1",
  "#a855f7",
  "#64748b",
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
    [categoryTotals],
  );
  const total = slices.reduce((sum, item) => sum + item.total, 0);

  const arcs = slices.map((item, index) => {
    const precedingTotal = slices
      .slice(0, index)
      .reduce((sum, previous) => sum + previous.total, 0);
    const portion = total === 0 ? 0 : (item.total / total) * 360;
    const start = total === 0 ? 0 : (precedingTotal / total) * 360;
    const end = start + Math.max(portion, 0.4);
    return { ...item, start, end, color: COLORS[index % COLORS.length] };
  });

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-900">Spending by category</h2>
        <p className="text-sm text-slate-500">Expenses only for the selected month</p>
      </div>

      {slices.length === 0 ? (
        <p className="py-10 text-center text-sm text-slate-500">
          No expenses this month yet.
        </p>
      ) : (
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <svg viewBox="0 0 180 180" className="h-44 w-44 shrink-0">
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
            <circle cx="90" cy="90" r="38" fill="white" />
            <text
              x="90"
              y="86"
              textAnchor="middle"
              className="fill-slate-500"
              fontSize="10"
            >
              Spent
            </text>
            <text
              x="90"
              y="104"
              textAnchor="middle"
              className="fill-slate-900"
              fontSize="11"
              fontWeight="600"
            >
              {formatINR(total)}
            </text>
          </svg>

          <ul className="w-full space-y-2">
            {arcs.map((arc) => (
              <li key={arc.categoryId} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2 text-slate-700">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: arc.color }}
                  />
                  {arc.name}
                </span>
                <span className="font-medium text-slate-900">{formatINR(arc.total)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
