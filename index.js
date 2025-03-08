import fs from "fs";
import path, { dirname } from "path";
import { google } from "googleapis";
import express from "express";
import open from "open";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SCOPES = ["https://www.googleapis.com/auth/gmail.send"];
const TOKEN_PATH = path.join(__dirname, "token.json");

const app = express();
const PORT = 3000;


const credentials = JSON.parse(fs.readFileSync("credentials.json"));
const { client_secret, client_id, redirect_uris } = credentials.installed;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
    oAuth2Client.setCredentials(token);
    console.log("Token loaded from file.");
} else {
    getNewToken();
}

function getNewToken() {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: "offline",
        scope: SCOPES,
    });

    console.log("Authorize this app by visiting this URL:", authUrl);
    open(authUrl);
}

app.get("/oauth2callback", async (req, res) => {
    const { code } = req.query;
    try {
        const { tokens } = await oAuth2Client.getToken(code);
        
        
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
        oAuth2Client.setCredentials(tokens);

        res.send("Authentication successful! You can close this window.");
        console.log("Token stored.");
    } catch (error) {
        console.error("Error retrieving access token:", error);
        res.status(500).send("Error during authentication");
    }
});

app.listen(PORT, () => {
    console.log('Server running on http://localhost:${PORT}');
});