import type { IntelDatabase } from './db/types';
import type { DbStatement } from './db/types';

export type OriginalUpdate={id:string;investigation_id:string;title:string|null;content:string};
export class CorrectionRepository{
  constructor(private db:IntelDatabase){}
  original(id:string){return this.db.first<OriginalUpdate>('SELECT id,investigation_id,title,content FROM investigation_updates WHERE id=?',[id]);}
  publish(statements:DbStatement[]){return this.db.batch(statements);}
  investigationSlug(id:string){return this.db.first<{slug:string}>('SELECT slug FROM investigations WHERE id=?',[id]);}
}
