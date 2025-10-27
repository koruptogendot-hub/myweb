import { readUsers, writeUsers } from './db.js';

export default function handler(req, res){
  if(req.method !== 'POST') return res.status(405).json({message:'Method Not Allowed'});
  const { email } = req.body;
  if(!email) return res.status(400).json({message:'Email required'});

  const users = readUsers();
  const u = users.find(x => x.email === email);
  if(!u) return res.status(404).json({message:'User not found'});
  u.access = true;
  writeUsers(users);
  return res.status(200).json({message:`✅ Access granted for ${email}`});
}
