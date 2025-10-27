import nodemailer from 'nodemailer';
import { readUsers } from './db.js';

const GMAILS = [
  { email: 'gmail1@example.com', appPassword: 'APP_PASS_1' },
  { email: 'gmail2@example.com', appPassword: 'APP_PASS_2' },
  { email: 'gmail3@example.com', appPassword: 'APP_PASS_3' },
  { email: 'gmail4@example.com', appPassword: 'APP_PASS_4' },
  { email: 'gmail5@example.com', appPassword: 'APP_PASS_5' },
  { email: 'gmail6@example.com', appPassword: 'APP_PASS_6' },
  { email: 'gmail7@example.com', appPassword: 'APP_PASS_7' },
  { email: 'gmail8@example.com', appPassword: 'APP_PASS_8' },
  { email: 'gmail9@example.com', appPassword: 'APP_PASS_9' },
  { email: 'gmail10@example.com', appPassword: 'APP_PASS_10' }
];

export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).json({message:'Method Not Allowed'});
  const { requesterEmail, gmailIndex, to, subject, text, number } = req.body;

  if(!requesterEmail) return res.status(400).json({message:'Requester email required'});
  // ensure requester exists and has access
  const users = readUsers();
  const user = users.find(u => u.email === requesterEmail);
  if(!user) return res.status(403).json({message:'Requester not registered'});
  if(!user.access && user.email !== 'admin@admin.id') return res.status(403).json({message:'Access denied'});

  // validate required fields
  if(gmailIndex == null) return res.status(400).json({message:'Gmail index required'});
  if(!to) return res.status(400).json({message:'Destination email (to) required'});
  if(!subject) return res.status(400).json({message:'Subject required'});
  if(!text) return res.status(400).json({message:'Text required'});

  const idx = Number(gmailIndex);
  const account = GMAILS[idx];
  if(!account) return res.status(400).json({message:'Invalid Gmail selection'});

  // create transporter with app password
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: account.email, pass: account.appPassword }
  });

  try {
    const info = await transporter.sendMail({
      from: account.email,
      to,
      subject,
      text
    });
    return res.status(200).json({ message: 'Sent', messageId: info.messageId });
  } catch(err) {
    console.error('send error', err);
    return res.status(500).json({ message: 'Failed to send', error: err.message });
  }
}
