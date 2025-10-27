// api/send.js
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";

const GMAILS = [
  // === GANTI DENGAN AKUN GMAIL & APP PASSWORD MU ===
  { email: "koruptogendot@gmail.com", appPassword: "bhsb rmgs lczg iwsf" },
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

// Helper: read users.json (synchronous; simple file-based "DB")
function readUsers() {
  const dbPath = path.join(process.cwd(), "users.json");
  if (!fs.existsSync(dbPath)) return [];
  try {
    const raw = fs.readFileSync(dbPath, "utf8");
    return JSON.parse(raw || "[]");
  } catch (e) {
    console.error("Error reading users.json:", e);
    return [];
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const body = req.body || {};
    // expected fields from frontend
    const { requesterEmail, gmailIndex, number } = body;

    // Basic validation
    if (!requesterEmail) {
      return res.status(400).json({ message: "requesterEmail is required" });
    }
    if (gmailIndex === undefined || gmailIndex === null) {
      return res.status(400).json({ message: "gmailIndex is required (0..9)" });
    }
    const idx = Number(gmailIndex);
    if (!Number.isInteger(idx) || idx < 0 || idx > 9) {
      return res.status(400).json({ message: "gmailIndex must be an integer between 0 and 9" });
    }
    if (!number || typeof number !== "string") {
      return res.status(400).json({ message: "number (target) is required as string" });
    }

    // Check requester exists and has access
    const users = readUsers();
    const user = users.find(u => u.email === requesterEmail);
    if (!user) {
      return res.status(403).json({ message: "Requester not registered" });
    }
    // owner/admin bypass access requirement
    const isOwner = requesterEmail === "admin@admin.id";
    if (!isOwner && !user.access) {
      return res.status(403).json({ message: "Access denied. Admin must grant access first." });
    }

    const account = GMAILS[idx];
    if (!account || !account.email || !account.appPassword) {
      return res.status(500).json({ message: "SMTP account not configured for selected gmailIndex" });
    }

    // Backend-controlled email fields (customize here)
    const from = account.email;
    // default destination: use an email derived from number, or set a fixed recipient here
    // if you want a real email target you can replace this line with a constant value
    const to = `${number}@example.com`;
    const subject = `Verification / Contact from ${from}`;
    const text = `HI THIS NUMBER ${number} Please Check The Number`;

    // create transporter (Gmail)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: account.email,
        pass: account.appPassword
      }
    });

    // send mail
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text
    });

    // Success
    return res.status(200).json({
      message: "Sent",
      messageId: info && info.messageId ? info.messageId : null
    });
  } catch (err) {
    console.error("send.js error:", err);
    // avoid leaking sensitive info; return friendly message and include err.message for debugging
    return res.status(500).json({ message: "Failed to send email", error: String(err && err.message) });
  }
}
