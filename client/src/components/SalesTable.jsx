import React from "react";
export default function SalesTable({ data }) {
  return (
    <div style={{ background: "#fff", padding: 12, borderRadius: 10 }}>
      <h4>Total Sales — per day (Month2)</h4>
      <table className="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {data &&
          data.month2SalesPerDay &&
          data.month2SalesPerDay.length > 0 ? (
            data.month2SalesPerDay.map((r) => (
              <tr key={r.date}>
                <td>{r.date}</td>
                <td>₱{Math.round(r.amount * 100) / 100}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={2}>No daily records for this month</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
