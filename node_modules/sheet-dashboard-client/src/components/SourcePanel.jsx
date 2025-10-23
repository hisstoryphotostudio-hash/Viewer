import React, { useEffect, useState } from "react";
import {
  getAuthUrl,
  listSources,
  listSheets,
  getSheetTabs,
  saveSource,
  deleteSource,
  syncSource,
} from "../utils/api";
import Modal from "./Modal";

export default function SourcePanel() {
  const [sources, setSources] = useState([]);
  const [tokens, setTokens] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => fetchSources(), []);

  async function fetchSources() {
    const res = await fetch("/api/sources");
    const j = await res.json();
    setSources(j.sources || []);
  }

  async function connectGoogle() {
    const r = await fetch("/api/auth/url");
    const j = await r.json();
    window.open(j.url, "_blank");
  }

  async function removeSource(id) {
    await fetch(`/api/sources/${id}`, { method: "DELETE" });
    fetchSources();
  }

  async function manualSync(id) {
    await fetch(`/api/sources/sync/${id}`, { method: "POST" });
    fetchSources();
  }

  useEffect(() => {
    // read gsheet_tokens cookie if set
    try {
      const c = document.cookie
        .split(";")
        .map((s) => s.trim())
        .find((s) => s.startsWith("gsheet_tokens="));
      if (c) {
        const v = decodeURIComponent(c.split("=")[1]);
        setTokens(JSON.parse(v));
      }
    } catch (e) {}
  }, []);

  return (
    <div>
      <div className="header">
        <div className="h3">Sources</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn small" onClick={connectGoogle}>
            Connect Google
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            Add Source
          </button>
        </div>
      </div>

      <div>
        {sources.length === 0 && (
          <div style={{ padding: 12, color: "#6b7280" }}>
            No sources yet. Connect Google and add a source.
          </div>
        )}
        {sources.map((s) => (
          <div key={s.id} className="source-row">
            <div>
              <div style={{ fontWeight: 700 }}>{s.branchName}</div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                {s.spreadsheetId} / {s.clientSheet} / {s.salesSheet}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span
                className={`status ${s.syncStatus === "ok" ? "ok" : "err"}`}
              ></span>
              <button className="btn small" onClick={() => manualSync(s.id)}>
                Sync
              </button>
              <button className="btn small" onClick={() => removeSource(s.id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal
          tokens={tokens}
          onClose={() => {
            setShowModal(false);
            fetchSources();
          }}
        />
      )}
    </div>
  );
}
