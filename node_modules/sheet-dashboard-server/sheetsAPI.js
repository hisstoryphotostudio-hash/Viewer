// sheetsAPI.js - wrappers around Google Sheets & Drive (using tokens per connection)
const { google } = require("googleapis");
const { createOAuth2Client } = require("./googleAuth");

function clientFromTokens(tokens) {
  const client = createOAuth2Client();
  client.setCredentials(tokens);
  return client;
}

async function listSpreadsheets(tokens) {
  const client = clientFromTokens(tokens);
  const drive = google.drive({ version: "v3", auth: client });
  const res = await drive.files.list({
    q: "mimeType='application/vnd.google-apps.spreadsheet'",
    pageSize: 200,
    fields: "files(id, name)",
  });
  return res.data.files || [];
}

async function getSheetNames(tokens, spreadsheetId) {
  const client = clientFromTokens(tokens);
  const sheets = google.sheets({ version: "v4", auth: client });
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  return (meta.data.sheets || []).map((s) => s.properties.title);
}

async function getSheetRange(tokens, spreadsheetId, sheetName, range = "A:Z") {
  const client = clientFromTokens(tokens);
  const sheets = google.sheets({ version: "v4", auth: client });
  const fullRange = `${sheetName}!${range}`;
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: fullRange,
  });
  return res.data.values || [];
}

module.exports = { listSpreadsheets, getSheetNames, getSheetRange };
