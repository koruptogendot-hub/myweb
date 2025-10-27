// api/send.js
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { number, gmailIndex } = req.body;

    if (!number) {
      return res.status(400).json({ message: "Number is required" });
    }
    if (gmailIndex === undefined || gmailIndex < 0 || gmailIndex > 9) {
      return res.status(400).json({ message: "Invalid Gmail index" });
    }

    // DAFTAR 10 GMAIL + APP PASSWORD
    const gmailAccounts = [
      { user: "koruptogendot@gmail.com", pass: "bhsb rmgs lczg iwsf" },
      { user: "gmail2@example.com", pass: "app_password2" },
      { user: "gmail3@example.com", pass: "app_password3" },
      { user: "gmail4@example.com", pass: "app_password4" },
      { user: "gmail5@example.com", pass: "app_password5" },
      { user: "gmail6@example.com", pass: "app_password6" },
      { user: "gmail7@example.com", pass: "app_password7" },
      { user: "gmail8@example.com", pass: "app_password8" },
      { user: "gmail9@example.com", pass: "app_password9" },
      { user: "gmail10@example.com", pass: "app_password10" },
    ];

    const { user, pass } = gmailAccounts[gmailIndex];

    // Buat transporter Nodemailer
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587, // STARTTLS
      secure: false, // gunakan TLS
      auth: { user, pass },
    });

    // User tinggal isi TO, SUBJECT, TEXT sesuai kebutuhan
    const mailOptions = {
      from: user,
      to: "target@example.com",       // Ganti sesuai kebutuhan
      subject: "Your Subject Here",   // Ganti sesuai kebutuhan
      text: `HI THIS MY NUMBER ${number} Please Check The number`, // Pakai ${number} dari input
    };

    // Kirim email
    const info = await transporter.sendMail(mailOptions);

    return res.status(200).json({
      message: "Email sent successfully",
      messageId: info.messageId,
    });
  } catch (err) {
    console.error("Failed to send email:", err);
    return res.status(500).json({
      message: "Failed to send email",
      error: err.message,
    });
  }
}
