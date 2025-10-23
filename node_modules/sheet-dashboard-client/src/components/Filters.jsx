import React from "react";

export default function Filters({
  branches,
  branch,
  setBranch,
  month2,
  setMonth2,
  year,
  setYear,
}) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <select
        className="small"
        value={branch}
        onChange={(e) => setBranch(e.target.value)}
      >
        {branches.map((b) => (
          <option key={b} value={b}>
            {b}
          </option>
        ))}
      </select>
      <select
        className="small"
        value={month2}
        onChange={(e) => setMonth2(Number(e.target.value))}
      >
        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
      <select
        className="small"
        value={year}
        onChange={(e) => setYear(Number(e.target.value))}
      >
        {Array.from({ length: 4 }, (_, i) => new Date().getFullYear() - i).map(
          (y) => (
            <option key={y} value={y}>
              {y}
            </option>
          )
        )}
      </select>
    </div>
  );
}
