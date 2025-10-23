import React from "react";

export default function SummaryTable({ data }) {
  if (!data)
    return (
      <div className="card-stats">
        <div className="stat">Loading...</div>
      </div>
    );
  const prevIdx = data.month - 1;
  const curIdx = data.month2 - 1;
  return (
    <div
      style={{
        marginTop: 12,
        padding: 12,
        background: "#fff",
        borderRadius: 10,
      }}
    >
      <table className="table">
        <thead>
          <tr>
            <th>Data Type</th>
            <th>Month (Previous)</th>
            <th>Month2 (Current)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>Total Clients</strong>
            </td>
            <td>{data.clientSeries[prevIdx] || 0}</td>
            <td>{data.clientSeries[curIdx] || 0}</td>
          </tr>
          <tr>
            <td>
              <strong>Total Sales (₱)</strong>
            </td>
            <td>₱{Math.round((data.salesSeries[prevIdx] || 0) * 100) / 100}</td>
            <td>₱{Math.round((data.salesSeries[curIdx] || 0) * 100) / 100}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
