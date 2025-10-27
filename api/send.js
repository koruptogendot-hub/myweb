import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";

const GMAILS = [
  { email:"gmail1@example.com", appPassword:"APP_PASS_1" },
  { email:"gmail2@example.com", appPassword:"APP_PASS_2" },
  { email:"gmail3@example.com", appPassword:"APP_PASS_3" },
  { email:"gmail4@example.com", appPassword:"APP_PASS_4" },
  { email:"gmail5@example.com", appPassword:"APP_PASS_5" },
  { email:"gmail6@example.com", appPassword:"APP_PASS_6" },
  { email:"gmail7@example.com", appPassword:"APP_PASS_7" },
  { email:"gmail8@example.com", appPassword:"APP_PASS_8" },
  { email:"gmail9@example.com", appPassword:"APP_PASS_9" },
  { email:"gmail10@example.com", appPassword:"APP_PASS_10" }
];

function readUsers(){
  const dbPath = path.join(process.cwd(),"users.json");
  if(!fs.existsSync(dbPath)) return [];
  try{
    const raw = fs.readFileSync(dbPath,"utf8");
    return JSON.parse(raw || "[]");
  } catch(e){ return []; }
}

export default async function handler(req,res){
  if(req.method !== "POST") return res.status(405).json({ message:"Method Not Allowed" });
  try{
    const { requesterEmail, gmailIndex, number } = req.body;
    if(!requesterEmail) return res.status(400).json({message:"requesterEmail required"});
    if(gmailIndex===undefined) return res.status(400).json({message:"gmailIndex required"});
    if(!number) return res.status(400).json({message:"number required"});

    const idx = Number(gmailIndex);
    if(idx<0 || idx>9) return res.status(400).json({message:"gmailIndex must be 0..9"});

    const users = readUsers();
    const user = users.find(u=>u.email===requesterEmail);
    if(!user) return res.status(403).json({ message:"Requester not registered" });
    const isOwner = requesterEmail==="admin@admin.id";
    if(!isOwner && !user.access) return res.status(403).json({ message:"Access denied. Admin must grant access first." });

    const account = GMAILS[idx];
    if(!account || !account.email || !account.appPassword) return res.status(500).json({message:"SMTP account not configured"});

    const from = account.email;
    const to = `${number}@example.com`; // ganti sesuai kebutuhan
    const subject = `Verification from ${from}`;
    const text = `HI THIS NUMBER ${number} Please Check The Number`;

    const transporter = nodemailer.createTransport({
      service:"gmail",
      auth:{ user:account.email, pass:account.appPassword }
    });

    const info = await transporter.sendMail({ from, to, subject, text });
    return res.status(200).json({ message:"Sent", messageId:info.messageId });
  } catch(err){
    console.error(err);
    return res.status(500).json({ message:"FAILED TO SEND EMAIL", error: String(err.message) });
  }
}
    // avoid leaking sensitive info; return friendly message and include err.message for debugging
    return res.status(500).json({ message: "Failed to send email", error: String(err && err.message) });
  }
}
