import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function ChartView({ data }) {
  const chartData = data
    ? data.months.map((m, i) => ({
        month: m,
        clients: data.clientSeries[i] || 0,
        sales: data.salesSeries[i] || 0,
      }))
    : [];
  return (
    <div className="chart-container" style={{ height: 360 }}>
      <h4 style={{ marginBottom: 8 }}>
        This Year: Client Count vs Total Sales
      </h4>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={chartData}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="clients"
            name="Clients"
            stroke="#2b6ef6"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="sales"
            name="Sales"
            stroke="#2ba96b"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
