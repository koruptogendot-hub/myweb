import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'users.json');

export function readUsers(){
  if(!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify([]));
  }
  const raw = fs.readFileSync(DB_PATH, 'utf8');
  try { return JSON.parse(raw || '[]'); } catch(e){ return []; }
}

export function writeUsers(users){
  fs.writeFileSync(DB_PATH, JSON.stringify(users, null, 2));
}
