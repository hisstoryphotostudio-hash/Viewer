import React, { useEffect, useState, useRef } from "react";
import SummaryTable from "./SummaryTable";
import SalesTable from "./SalesTable";
import ChartView from "./ChartView";
import Filters from "./Filters";
import { defaultYear, defaultMonth2 } from "../utils/dateUtils";
import { fetchData, listSources } from "../utils/api";

export default function DashboardPanel() {
  const [sources, setSources] = useState([]);
  const [branch, setBranch] = useState("");
  const [year, setYear] = useState(defaultYear());
  const [month2, setMonth2] = useState(defaultMonth2());
  const [data, setData] = useState(null);
  const [autoSync, setAutoSync] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => loadSources(), []);

  useEffect(() => {
    if (branch) loadData();
  }, [branch, year, month2]);

  useEffect(() => {
    if (autoSync) {
      timerRef.current = setInterval(() => {
        if (branch) loadData();
      }, 60_000); // 1 minute
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [branch, autoSync]);

  async function loadSources() {
    const r = await fetch("/api/sources");
    const j = await r.json();
    setSources(j.sources || []);
    if (!branch && j.sources && j.sources.length)
      setBranch(j.sources[0].branchName);
  }

  async function loadData() {
    if (!branch) return;
    const j = await fetch(
      `/api/data?branch=${encodeURIComponent(
        branch
      )}&year=${year}&month2=${month2}`
    );
    const res = await j.json();
    setData(res);
  }

  return (
    <div>
      <div className="header">
        <div className="h3">Dashboard</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select
            className="small"
            value={branch}
            onChange={(e) => setBranch(e.target.value)}
          >
            {Array.from(new Set(sources.map((s) => s.branchName))).map((b) => (
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
            {Array.from(
              { length: 4 },
              (_, i) => new Date().getFullYear() - i
            ).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <button className="btn" onClick={loadData}>
            Refresh
          </button>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={autoSync}
              onChange={(e) => setAutoSync(e.target.checked)}
            />
            Auto-sync
          </label>
        </div>
      </div>

      <SummaryTable data={data} />

      <div style={{ marginTop: 12 }}>
        <SalesTable data={data} />
      </div>

      <div style={{ marginTop: 12 }}>
        <ChartView data={data} />
      </div>
    </div>
  );
}
