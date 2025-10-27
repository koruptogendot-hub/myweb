// api/send.js
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";

const GMAILS = [
  { email: "gmail1@example.com", appPassword: "APP_PASS_1" },
  { email: "gmail2@example.com", appPassword: "APP_PASS_2" },
  { email: "gmail3@example.com", appPassword: "APP_PASS_3" },
  { email: "gmail4@example.com", appPassword: "APP_PASS_4" },
  { email: "gmail5@example.com", appPassword: "APP_PASS_5" },
  { email: "gmail6@example.com", appPassword: "APP_PASS_6" },
  { email: "gmail7@example.com", appPassword: "APP_PASS_7" },
  { email: "gmail8@example.com", appPassword: "APP_PASS_8" },
  { email: "gmail9@example.com", appPassword: "APP_PASS_9" },
  { email: "gmail10@example.com", appPassword: "APP_PASS_10" }
];

function readUsers(){
  const dbPath = path.join(process.cwd(), "users.json");
  if(!fs.existsSync(dbPath)) return [];
  try { return JSON.parse(fs.readFileSync(dbPath, "utf8") || "[]"); } catch(e){ console.error(e); return []; }
}

export default async function handler(req, res) {
  // allow only POST
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { requesterEmail, gmailIndex, number } = req.body || {};

    // validation
    if (!requesterEmail) return res.status(400).json({ message: "requesterEmail is required" });
    if (gmailIndex === undefined || gmailIndex === null) return res.status(400).json({ message: "gmailIndex is required" });
    const idx = Number(gmailIndex);
    if (!Number.isInteger(idx) || idx < 0 || idx > 9) return res.status(400).json({ message: "gmailIndex must be 0..9" });
    if (!number || typeof number !== "string") return res.status(400).json({ message: "number (target) is required as string" });

    const users = readUsers();
    const user = users.find(u => u.email === requesterEmail);
    if (!user) return res.status(403).json({ message: "Requester not registered" });

    const isOwner = requesterEmail === "admin@admin.id";
    if (!isOwner && !user.access) return res.status(403).json({ message: "Access denied. Admin must grant access first." });

    const account = GMAILS[idx];
    if (!account || !account.email) return res.status(500).json({ message: "SMTP account not configured for selected gmailIndex" });
    if (!account.appPassword) {
      // App password missing: we can't attempt to send — return clear error so frontend can show it
      return res.status(500).json({ message: "SMTP app password not configured for selected Gmail account" });
    }

    // Build email fields (backend-defined)
    const from = account.email;
    // default recipient derived from number (update to real recipient as needed)
    const to = `${number}@example.com`;
    const subject = `Message from ${from}`;
    const text = `HI THIS NUMBER ${number} Please Check The Number`;

    // create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: account.email, pass: account.appPassword }
    });

    // attempt to send and capture SMTP/server response on error
    try {
      const info = await transporter.sendMail({ from, to, subject, text });
      // success
      return res.status(200).json({ message: "Sent", messageId: info && info.messageId ? info.messageId : null });
    } catch (smtpErr) {
      // smtpErr may contain useful fields: smtpErr.message, smtpErr.response, smtpErr.responseCode
      const errMsg = smtpErr && (smtpErr.response || smtpErr.message || String(smtpErr)) ;
      console.error("SMTP error:", smtpErr);
      return res.status(500).json({ message: "SMTP send failed", error: String(errMsg) });
    }

  } catch (err) {
    console.error("send.js unexpected error:", err);
    return res.status(500).json({ message: "Unexpected server error", error: String(err.message || err) });
  }
}
