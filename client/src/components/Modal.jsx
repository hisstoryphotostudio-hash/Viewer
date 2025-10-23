import React, { useEffect, useState } from "react";
import { listSheets, getSheetTabs, saveSource } from "../utils/api";

export default function Modal({ tokens, onClose }) {
  const [step, setStep] = useState(1);
  const [spreadsheets, setSpreadsheets] = useState([]);
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [tabs, setTabs] = useState([]);
  const [clientSheet, setClientSheet] = useState("");
  const [salesSheet, setSalesSheet] = useState("");
  const [branchName, setBranchName] = useState("");
  const [mapping, setMapping] = useState({
    clientDate: "Date",
    clientName: "Client Name",
    clientStatus: "Status",
    salesDate: "Date",
    salesAmount: "Total Sales",
  });

  useEffect(() => {
    async function load() {
      if (tokens) {
        const r = await fetch("/api/sheets/list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tokens }),
        });
        const j = await r.json();
        setSpreadsheets(j.files || []);
      }
    }
    load();
  }, [tokens]);

  async function chooseSpreadsheet(id) {
    setSpreadsheetId(id);
    const r = await fetch("/api/sheets/tabs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tokens, spreadsheetId: id }),
    });
    const j = await r.json();
    setTabs(j.tabs || []);
    setStep(2);
  }

  async function save() {
    const payload = {
      tokens,
      branchName,
      spreadsheetId,
      clientSheet,
      salesSheet,
      mapping,
    };
    await fetch("/api/sources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    onClose();
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Add Google Sheet Source</h3>
        {step === 1 && (
          <div>
            <div>Step 1 - Choose Spreadsheet</div>
            <div style={{ maxHeight: 220, overflow: "auto" }}>
              {spreadsheets.map((s) => (
                <div
                  key={s.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: 8,
                  }}
                >
                  <div>{s.name}</div>
                  <button
                    className="btn small"
                    onClick={() => chooseSpreadsheet(s.id)}
                  >
                    Select
                  </button>
                </div>
              ))}
              {!spreadsheets.length && (
                <div style={{ padding: 8, color: "#6b7280" }}>
                  No spreadsheets found. Make sure you granted access.
                </div>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div>Step 2 - Choose tabs</div>
            <div style={{ marginTop: 8 }}>
              <div>Client Sheet</div>
              <select
                className="small"
                value={clientSheet}
                onChange={(e) => setClientSheet(e.target.value)}
              >
                <option value="">-- select client sheet --</option>
                {tabs.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <div style={{ marginTop: 8 }}>Sales Sheet</div>
              <select
                className="small"
                value={salesSheet}
                onChange={(e) => setSalesSheet(e.target.value)}
              >
                <option value="">-- select sales sheet --</option>
                {tabs.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <div style={{ marginTop: 8 }}>
                <button className="btn btn-primary" onClick={() => setStep(3)}>
                  Next
                </button>
                <button className="btn" onClick={() => setStep(1)}>
                  Back
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div>Step 3 - Branch name & mapping</div>
            <input
              className="small"
              placeholder="Branch name"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
            />
            <div style={{ marginTop: 8, fontSize: 13, color: "#6b7280" }}>
              Column mapping (auto default names are suggested — adjust if
              headers differ)
            </div>
            <div style={{ marginTop: 8 }}>
              <div>Client Date column header</div>
              <input
                className="small"
                value={mapping.clientDate}
                onChange={(e) =>
                  setMapping({ ...mapping, clientDate: e.target.value })
                }
              />
              <div>Client Name header</div>
              <input
                className="small"
                value={mapping.clientName}
                onChange={(e) =>
                  setMapping({ ...mapping, clientName: e.target.value })
                }
              />
              <div>Sales Date header</div>
              <input
                className="small"
                value={mapping.salesDate}
                onChange={(e) =>
                  setMapping({ ...mapping, salesDate: e.target.value })
                }
              />
              <div>Sales Amount header</div>
              <input
                className="small"
                value={mapping.salesAmount}
                onChange={(e) =>
                  setMapping({ ...mapping, salesAmount: e.target.value })
                }
              />
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button className="btn btn-primary" onClick={save}>
                Save Source
              </button>
              <button className="btn" onClick={() => setStep(2)}>
                Back
              </button>
              <button className="btn" onClick={onClose}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
