import type { IntelDatabase } from './db/types';
export type SearchHit={object_type:string;object_id:string;investigation_id:string|null;title:string|null;body:string|null;slug:string|null;rank:number};
export class SearchRepository{
  constructor(private db:IntelDatabase){}
  search(match:string,limit=40,type=''){const filter=type?` AND s.object_type=?`:'';const args:any[]=[match];if(type)args.push(type);args.push(limit);return this.db.execute<SearchHit>(`SELECT s.object_type,s.object_id,s.investigation_id,s.title,s.body,i.slug,bm25(search_index) rank FROM search_index s LEFT JOIN investigations i ON i.id=s.investigation_id WHERE search_index MATCH ?${filter} ORDER BY rank,s.object_type,s.object_id LIMIT ?`,args);}
}
