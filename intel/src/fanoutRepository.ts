import type { IntelDatabase } from './db/types';

export class FanoutRepository{
 constructor(private db:IntelDatabase){}
 enqueue(investigationId:string,updateId:string,excludeUserId:string|undefined,now:number){
  return this.db.execute("INSERT OR IGNORE INTO notification_fanout_jobs(id,investigation_id,update_id,exclude_user_id,status,created_at,updated_at) VALUES(?,?,?,?, 'PENDING',?,?)",[crypto.randomUUID(),investigationId,updateId,excludeUserId||null,now,now]);
 }
 async drain(maxBatches=5,batchSize=100){
  let delivered=0,completed=0;
  const owner=crypto.randomUUID(),take=Math.min(200,Math.max(10,batchSize));
  for(let batch=0;batch<Math.min(10,Math.max(1,maxBatches));batch++){
   const now=Date.now(),candidate=await this.db.first<any>("SELECT id FROM notification_fanout_jobs WHERE status<>'DONE' AND attempts<8 AND (lease_expires_at IS NULL OR lease_expires_at<?) ORDER BY created_at,id LIMIT 1",[now]);
   if(!candidate)break;
   await this.db.execute("UPDATE notification_fanout_jobs SET status='RUNNING',lease_owner=?,lease_expires_at=?,attempts=attempts+1,last_error=NULL,updated_at=? WHERE id=? AND status<>'DONE' AND attempts<8 AND (lease_expires_at IS NULL OR lease_expires_at<?)",[owner,now+60_000,now,candidate.id,now]);
   const job=await this.db.first<any>("SELECT id,investigation_id,update_id,exclude_user_id,cursor_user_id FROM notification_fanout_jobs WHERE id=? AND lease_owner=? LIMIT 1",[candidate.id,owner]);
   if(!job)continue;
   const rows=await this.db.execute<any>("SELECT user_id FROM investigation_follows WHERE investigation_id=? AND user_id>? ORDER BY user_id LIMIT ?",[job.investigation_id,job.cursor_user_id||'',take]);
   if(!rows.rows.length){await this.db.execute("UPDATE notification_fanout_jobs SET status='DONE',lease_owner=NULL,lease_expires_at=NULL,updated_at=? WHERE id=? AND lease_owner=?",[Date.now(),job.id,owner]);completed++;continue;}
   const recipients=rows.rows.filter((x:any)=>x.user_id!==job.exclude_user_id);
   if(recipients.length)try{await this.db.batch(recipients.map((x:any)=>({sql:"INSERT OR IGNORE INTO notifications(id,user_id,type,investigation_id,update_id,created_at) VALUES(?,?,?,?,?,?)",args:[job.id+'-'+x.user_id,x.user_id,'FOLLOWED_INVESTIGATION_UPDATE',job.investigation_id,job.update_id,Date.now()]})));}catch(error){const message=(error instanceof Error?error.message:String(error)).slice(0,500);await this.db.execute("UPDATE notification_fanout_jobs SET status='PENDING',lease_owner=NULL,lease_expires_at=NULL,last_error=?,updated_at=? WHERE id=? AND lease_owner=?",[message,Date.now(),job.id,owner]);continue;}
   delivered+=recipients.length;
   const cursor=rows.rows.at(-1).user_id,done=rows.rows.length<take;
   await this.db.execute("UPDATE notification_fanout_jobs SET cursor_user_id=?,status=?,lease_owner=NULL,lease_expires_at=NULL,updated_at=? WHERE id=? AND lease_owner=?",[cursor,done?'DONE':'RUNNING',Date.now(),job.id,owner]);
   if(done)completed++;
  }
  return{delivered,completed};
 }
}
