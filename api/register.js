import { readUsers, writeUsers } from './db.js';

export default function handler(req, res){
  if(req.method !== 'POST') return res.status(405).json({message:'Method Not Allowed'});
  const { email, password } = req.body;
  if(!email || !password) return res.status(400).json({message:'Email & password required'});

  const users = readUsers();
  if(users.find(u => u.email === email)) return res.status(400).json({message:'Email already registered'});

  // default role user; admin already in users.json initial file
  users.push({ email, password, role: 'user', access: false });
  writeUsers(users);
  return res.status(200).json({message:'Register successful'});
}
