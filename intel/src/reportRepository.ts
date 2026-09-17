import type { IntelDatabase } from './db/types';
import type { DbStatement } from './db/types';
export class ReportRepository{
  constructor(private db:IntelDatabase){}
  existing(commentId:string,reporter:string,category:string){return this.db.first<{id:string}>('SELECT id FROM comment_reports WHERE comment_id=? AND reporter_user_id=? AND category=? LIMIT 1',[commentId,reporter,category]);}
  insert(id:string,commentId:string,reporter:string,category:string,now:number){return this.db.execute('INSERT INTO comment_reports(id,comment_id,reporter_user_id,category,status,eligible,created_at) VALUES(?,?,?,?,?,?,?)',[id,commentId,reporter,category,'OPEN',1,now]);}
  openCount(commentId:string,category:string){return this.db.first<{n:number}>("SELECT COUNT(*) n FROM comment_reports WHERE comment_id=? AND category=? AND eligible=1 AND status='OPEN'",[commentId,category]);}
  pending(commentId:string,category:string){return this.db.first<{id:string}>("SELECT id FROM moderation_queue WHERE comment_id=? AND trigger_category=? AND status='PENDING' LIMIT 1",[commentId,category]);}
  escalate(v:{queueId:string;commentId:string;category:string;count:number;now:number;auditId:string}){const q:DbStatement[]=[{sql:"UPDATE comments SET visibility_status='AUTO_HIDDEN' WHERE id=? AND visibility_status='VISIBLE'",args:[v.commentId]},{sql:"INSERT INTO moderation_queue(id,comment_id,trigger_category,trigger_count,status,created_at) VALUES(?,?,?,?,?,?)",args:[v.queueId,v.commentId,v.category,v.count,'PENDING',v.now]},{sql:'INSERT INTO audit_events(id,actor_user_id,event_type,object_type,object_id,payload_json,created_at) VALUES(?,?,?,?,?,?,?)',args:[v.auditId,null,'COMMENT_AUTO_HIDDEN','COMMENT',v.commentId,JSON.stringify({category:v.category,count:v.count,queueId:v.queueId}),v.now]}];return this.db.batch(q);}
}
