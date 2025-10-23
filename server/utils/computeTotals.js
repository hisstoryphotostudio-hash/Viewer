// computeTotals.js - compute month series and month2 daily sales
const { colToIndex, parseAmount, uniqueCount } = require("./sheetHelper");

function computeClientSeries(rows, dateIdx, year) {
  const months = new Array(12).fill(0);
  if (!rows || rows.length <= 1) return months;
  const data = rows.slice(1);
  for (const r of data) {
    const raw = r[dateIdx];
    if (!raw) continue;
    const d = new Date(raw);
    if (isNaN(d)) continue;
    if (d.getFullYear() !== year) continue;
    months[d.getMonth()] += 1; // counting rows = clients
  }
  return months;
}

function computeSalesSeries(rows, dateIdx, amtIdx, year) {
  const months = new Array(12).fill(0);
  const dailyMap = {}; // yyyy-mm-dd -> amount
  if (!rows || rows.length <= 1) return { months, dailyMap };
  const data = rows.slice(1);
  for (const r of data) {
    const raw = r[dateIdx];
    const rawAmt = r[amtIdx];
    if (!raw || !rawAmt) continue;
    const d = new Date(raw);
    if (isNaN(d)) continue;
    const amt = parseAmount(rawAmt);
    if (d.getFullYear() === year) months[d.getMonth()] += amt;
    const key = d.toISOString().slice(0, 10);
    dailyMap[key] = (dailyMap[key] || 0) + amt;
  }
  return { months, dailyMap };
}

module.exports = { computeClientSeries, computeSalesSeries };
