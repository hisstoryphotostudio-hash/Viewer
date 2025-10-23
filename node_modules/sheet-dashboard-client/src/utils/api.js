// simple wrapper for backend
const BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000/api";

export async function getAuthUrl() {
  const r = await fetch(`${BASE}/auth/url`);
  return r.json();
}
export async function listSources() {
  const r = await fetch(`${BASE}/sources`);
  return r.json();
}
export async function saveSource(payload) {
  const r = await fetch(`${BASE}/sources`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return r.json();
}
export async function deleteSource(id) {
  const r = await fetch(`${BASE}/sources/${id}`, { method: "DELETE" });
  return r.json();
}
export async function listSheets(tokens) {
  const r = await fetch(`${BASE}/sheets/list`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tokens }),
  });
  return r.json();
}
export async function getSheetTabs(tokens, spreadsheetId) {
  const r = await fetch(`${BASE}/sheets/tabs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tokens, spreadsheetId }),
  });
  return r.json();
}
export async function fetchData(branch, year, month2) {
  const r = await fetch(
    `${BASE}/data?branch=${encodeURIComponent(
      branch
    )}&year=${year}&month2=${month2}`
  );
  return r.json();
}
export async function syncSource(id) {
  const r = await fetch(`${BASE}/sources/sync/${id}`, { method: "POST" });
  return r.json();
}
