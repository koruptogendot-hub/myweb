import { readUsers } from './db.js';

export default function handler(req, res){
  if(req.method !== 'POST') return res.status(405).json({message:'Method Not Allowed'});
  const { email, password } = req.body;
  if(!email || !password) return res.status(400).json({message:'Email & password required'});

  const users = readUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if(!user) return res.status(401).json({message:'Invalid email or password'});

  // success: return minimal info; frontend will call checkAccess to get role/access
  return res.status(200).json({message:'Login successful'});
}
