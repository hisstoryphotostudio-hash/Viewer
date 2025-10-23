// routes.js - main express router for API
const express = require("express");
const fs = require("fs");
const path = require("path");
const { generateAuthUrl, getTokensFromCode } = require("./googleAuth");
const sheetsAPI = require("./sheetsAPI");
const {
  computeClientSeries,
  computeSalesSeries,
} = require("./utils/computeTotals");
const { colToIndex } = require("./utils/sheetHelper");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();
const DATA_FILE = path.join(__dirname, "data", "sources.json");

function loadSources() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8") || "[]");
  } catch (e) {
    return [];
  }
}
function saveSources(s) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(s, null, 2));
}

/**
 * AUTH
 */
router.get("/auth/url", async (req, res) => {
  const url = await generateAuthUrl();
  res.json({ url });
});

// OAuth callback - exchanges code and returns tokens to front-end as cookie
router.get("/auth/callback", async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) return res.status(400).send("Missing code");
    const tokens = await getTokensFromCode(code);
    // send tokens as JSON to user (front-end can POST to save sources). Alternatively set cookie
    res.json({ tokens });
  } catch (err) {
    console.error(err);
    res.status(500).send("Auth failed");
  }
});

/**
 * LIST spreadsheets (requires tokens from frontend)
 */
router.post("/sheets/list", async (req, res) => {
  const tokens = req.body.tokens;
  if (!tokens) return res.status(400).json({ error: "Missing tokens" });
  try {
    const files = await sheetsAPI.listSpreadsheets(tokens);
    res.json({ files });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET sheet tabs
 */
router.post("/sheets/tabs", async (req, res) => {
  const { tokens, spreadsheetId } = req.body;
  if (!tokens || !spreadsheetId)
    return res.status(400).json({ error: "Missing tokens or spreadsheetId" });
  try {
    const tabs = await sheetsAPI.getSheetNames(tokens, spreadsheetId);
    res.json({ tabs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * SAVE source mapping: expects tokens + branchName + spreadsheetId + clientSheet + salesSheet + mapping
 */
router.post("/sources", (req, res) => {
  const {
    tokens,
    branchName,
    spreadsheetId,
    clientSheet,
    salesSheet,
    mapping,
  } = req.body;
  if (
    !tokens ||
    !branchName ||
    !spreadsheetId ||
    !clientSheet ||
    !salesSheet ||
    !mapping
  ) {
    return res.status(400).json({ error: "Missing fields" });
  }
  const sources = loadSources();
  const id = `${branchName}__${uuidv4().slice(0, 8)}`;
  const obj = {
    id,
    branchName,
    spreadsheetId,
    clientSheet,
    salesSheet,
    mapping,
    tokens,
    syncStatus: "ok",
    createdAt: new Date().toISOString(),
  };
  sources.push(obj);
  saveSources(sources);
  res.json({ ok: true, source: obj });
});

/**
 * LIST saved sources
 */
router.get("/sources", (req, res) => {
  const sources = loadSources();
  res.json({ sources });
});

/**
 * DELETE source by id
 */
router.delete("/sources/:id", (req, res) => {
  const id = req.params.id;
  let sources = loadSources();
  sources = sources.filter((s) => s.id !== id);
  saveSources(sources);
  res.json({ ok: true });
});

/**
 * SYNC single source now (manual)
 */
router.post("/sources/sync/:id", async (req, res) => {
  const id = req.params.id;
  const sources = loadSources();
  const src = sources.find((s) => s.id === id);
  if (!src) return res.status(404).json({ error: "Source not found" });

  try {
    // get client rows and sales rows
    const clientRows = await sheetsAPI.getSheetRange(
      src.tokens,
      src.spreadsheetId,
      src.clientSheet,
      "A:Z"
    );
    const salesRows = await sheetsAPI.getSheetRange(
      src.tokens,
      src.spreadsheetId,
      src.salesSheet,
      "A:Z"
    );
    // respond with raw arrays
    res.json({ clientRows, salesRows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * DASHBOARD data: aggregated per branch; query params: branch, year, month2
 * month2 default current month (1-12)
 * returns clientSeries[12], salesSeries[12], month2SalesPerDay[]
 */
router.get("/data", async (req, res) => {
  try {
    const branch = req.query.branch;
    const year = parseInt(req.query.year || new Date().getFullYear());
    const month2 = parseInt(req.query.month2 || new Date().getMonth() + 1);
    if (!branch) return res.status(400).json({ error: "Missing branch" });

    const sources = loadSources();
    const src = sources.find((s) => s.branchName === branch);
    if (!src) return res.status(400).json({ error: "No source for branch" });

    // compute indexes
    // date mapping keys might be column letters (A) or header names; mapping fields: clientDate, clientName, clientStatus, salesDate, salesAmount
    const clientRows = await sheetsAPI.getSheetRange(
      src.tokens,
      src.spreadsheetId,
      src.clientSheet,
      "A:Z"
    );
    const salesRows = await sheetsAPI.getSheetRange(
      src.tokens,
      src.spreadsheetId,
      src.salesSheet,
      "A:Z"
    );

    // figure column indices: if mapping contains A/B letters use colToIndex else find in header row
    const clientHeader = clientRows[0] || [];
    const salesHeader = salesRows[0] || [];

    function getIndex(mappingKey, headerRow) {
      const val = src.mapping[mappingKey];
      if (!val) return -1;
      if (/^[A-Z]$/i.test(val)) return colToIndex(val);
      return headerRow.indexOf(val);
    }

    const cDateIdx = getIndex("clientDate", clientHeader);
    const cNameIdx = getIndex("clientName", clientHeader);
    // const cStatusIdx = getIndex('clientStatus', clientHeader);

    const sDateIdx = getIndex("salesDate", salesHeader);
    const sAmtIdx = getIndex("salesAmount", salesHeader);

    // compute client series
    const clientSeries = computeClientSeries(
      clientRows,
      cDateIdx >= 0 ? cDateIdx : 0,
      year
    );

    // compute sales
    const salesObj = computeSalesSeries(
      salesRows,
      sDateIdx >= 0 ? sDateIdx : 0,
      sAmtIdx >= 0 ? sAmtIdx : 1,
      year
    );
    const salesSeries = salesObj.months;
    const dailyMap = salesObj.dailyMap;

    // month & month2
    const month = month2 === 1 ? 12 : month2 - 1;
    // month2 sales per day
    const month2Year = year; // we assume same year (no cross-year handling here)
    const month2SalesPerDay = Object.keys(dailyMap)
      .filter((d) => {
        const dt = new Date(d);
        return dt.getFullYear() === month2Year && dt.getMonth() + 1 === month2;
      })
      .sort()
      .map((k) => ({ date: k, amount: dailyMap[k] }));

    res.json({
      branch,
      month,
      month2,
      months: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      clientSeries,
      salesSeries,
      month2SalesPerDay,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
