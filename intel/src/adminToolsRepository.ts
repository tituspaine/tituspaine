import type { IntelDatabase } from './db/types';
export class AdminToolsRepository{
  constructor(private db:IntelDatabase){}
  investigations(limit=100){const n=Math.min(100,Math.max(1,limit));return this.db.execute<{id:string;title:string}>('SELECT id,title FROM investigations ORDER BY updated_at DESC,id DESC LIMIT ?',[n]);}
  entities(limit=200){const n=Math.min(200,Math.max(1,limit));return this.db.execute<{id:string;canonical_name:string}>('SELECT id,canonical_name FROM entities ORDER BY updated_at DESC,id DESC LIMIT ?',[n]);}
}
