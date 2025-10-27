import { readUsers } from './db.js';

export default function handler(req, res){
  if(req.method !== 'POST') return res.status(405).json({message:'Method Not Allowed'});
  const { email } = req.body;
  if(!email) return res.status(400).json({message:'Email required'});

  const users = readUsers();
  const user = users.find(u => u.email === email);
  if(!user) return res.status(404).json({message:'User not found'});

  // if admin email -> ensure owner role
  if(user.email === 'admin@admin.id') user.role = 'owner';

  return res.status(200).json({ access: !!user.access, role: user.role || 'user' });
}
