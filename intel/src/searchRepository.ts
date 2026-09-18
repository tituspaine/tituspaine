import type { IntelDatabase } from './db/types';
export type SearchHit={object_type:string;object_id:string;investigation_id:string|null;title:string|null;body:string|null;slug:string|null;rank:number};
export class SearchRepository{
  constructor(private db:IntelDatabase){}
  search(match:string,limit=40,type=''){const n=Math.min(60,Math.max(1,limit));const filter=type?` AND s.object_type=?`:'';const args:any[]=[match];if(type)args.push(type);args.push(n);return this.db.execute<SearchHit>(`SELECT s.object_type,s.object_id,s.investigation_id,s.title,s.body,i.slug,bm25(search_index) rank FROM search_index s LEFT JOIN investigations i ON i.id=s.investigation_id WHERE search_index MATCH ? AND (s.investigation_id IS NULL OR i.published_at IS NOT NULL)${filter} ORDER BY rank,s.object_type,s.object_id LIMIT ?`,args);}
}
