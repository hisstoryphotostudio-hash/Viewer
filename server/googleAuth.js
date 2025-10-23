// googleAuth.js - helper to create OAuth2 client and exchange code
const { google } = require("googleapis");
require("dotenv").config();

function createOAuth2Client(redirectUri) {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri || process.env.OAUTH_REDIRECT_URI
  );
  return client;
}

async function generateAuthUrl(state = "") {
  const client = createOAuth2Client();
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/spreadsheets.readonly",
      "https://www.googleapis.com/auth/drive.metadata.readonly",
    ],
    state,
  });
}

async function getTokensFromCode(code) {
  const client = createOAuth2Client();
  const r = await client.getToken(code);
  return r.tokens; // includes refresh_token (if consent)
}

module.exports = { createOAuth2Client, generateAuthUrl, getTokensFromCode };
