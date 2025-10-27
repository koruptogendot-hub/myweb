import { readUsers } from './db.js';

export default function handler(req, res){
  if(req.method !== 'GET') return res.status(405).json({message:'Method Not Allowed'});
  const users = readUsers();
  // Do not leak passwords in production; here included for admin UI convenience
  const safe = users.map(u => ({ email: u.email, role: u.role || 'user', access: !!u.access }));
  return res.status(200).json(safe);
}
