// helper: mapping column letters -> index & parsing
function colToIndex(col) {
  if (!col) return -1;
  if (/^[A-Z]$/i.test(col)) return col.toUpperCase().charCodeAt(0) - 65;
  return -1;
}

function parseAmount(v) {
  if (v === undefined || v === null) return 0;
  const s = String(v).replace(/[^0-9.-]+/g, "");
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

function uniqueCount(arr) {
  const s = new Set(arr.filter(Boolean));
  return s.size;
}

module.exports = { colToIndex, parseAmount, uniqueCount };
