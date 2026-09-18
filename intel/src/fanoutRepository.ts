import type { IntelDatabase } from './db/types';

export class FanoutRepository{
 constructor(private db:IntelDatabase){}
 enqueue(investigationId:string,updateId:string,excludeUserId:string|undefined,now:number){
  return this.db.execute("INSERT OR IGNORE INTO notification_fanout_jobs(id,investigation_id,update_id,exclude_user_id,status,created_at,updated_at) VALUES(?,?,?,?, 'PENDING',?,?)",[crypto.randomUUID(),investigationId,updateId,excludeUserId||null,now,now]);
 }
 async drain(maxBatches=5,batchSize=100){
  let delivered=0,completed=0;
  for(let batch=0;batch<Math.min(10,Math.max(1,maxBatches));batch++){
   const job=await this.db.first<any>("SELECT id,investigation_id,update_id,exclude_user_id,cursor_user_id FROM notification_fanout_jobs WHERE status<>'DONE' ORDER BY created_at,id LIMIT 1");
   if(!job)break;
   await this.db.execute("UPDATE notification_fanout_jobs SET status='RUNNING',updated_at=? WHERE id=?",[Date.now(),job.id]);
   const rows=await this.db.execute<any>("SELECT user_id FROM investigation_follows WHERE investigation_id=? AND user_id>? ORDER BY user_id LIMIT ?",[job.investigation_id,job.cursor_user_id||'',Math.min(200,Math.max(10,batchSize))]);
   if(!rows.rows.length){await this.db.execute("UPDATE notification_fanout_jobs SET status='DONE',updated_at=? WHERE id=?",[Date.now(),job.id]);completed++;continue;}
   const recipients=rows.rows.filter((x:any)=>x.user_id!==job.exclude_user_id);
   if(recipients.length)await this.db.batch(recipients.map((x:any)=>({sql:"INSERT OR IGNORE INTO notifications(id,user_id,type,investigation_id,update_id,created_at) VALUES(?,?,?,?,?,?)",args:[job.id+'-'+x.user_id,x.user_id,'FOLLOWED_INVESTIGATION_UPDATE',job.investigation_id,job.update_id,Date.now()]})));
   delivered+=recipients.length;
   const cursor=rows.rows.at(-1).user_id,done=rows.rows.length<Math.min(200,Math.max(10,batchSize));
   await this.db.execute("UPDATE notification_fanout_jobs SET cursor_user_id=?,status=?,updated_at=? WHERE id=?",[cursor,done?'DONE':'RUNNING',Date.now(),job.id]);
   if(done)completed++;
  }
  return{delivered,completed};
 }
}
