import type { IntelDatabase } from './db/types';
import { randomId } from './security';

export class NotificationRepository {
  constructor(private db: IntelDatabase) {}

  notify(userId:string,type:string,refs:{investigationId?:string;commentId?:string;updateId?:string;payload?:unknown}={}) {
    return this.db.execute(
      'INSERT INTO notifications(id,user_id,type,investigation_id,comment_id,update_id,payload_json,created_at) VALUES(?,?,?,?,?,?,?,?)',
      [randomId(),userId,type,refs.investigationId||null,refs.commentId||null,refs.updateId||null,refs.payload?JSON.stringify(refs.payload):null,Date.now()]
    );
  }

  async notifyFollowers(investigationId:string,updateId:string,exclude?:string) {
    // Bound synchronous fan-out so publishing latency cannot grow with follower count.
    // Larger audiences still see the update in Following; future queue-based fan-out can
    // continue from the deterministic user_id ordering without changing the core write.
    const rows=await this.db.execute<{user_id:string}>('SELECT user_id FROM investigation_follows WHERE investigation_id=? ORDER BY user_id LIMIT 201',[investigationId]);
    const recipients=rows.rows.filter(x=>x.user_id!==exclude).slice(0,200);
    if(!recipients.length)return {delivered:0,truncated:false};
    const now=Date.now(),chunk=50;
    for(let i=0;i<recipients.length;i+=chunk){
      await this.db.batch(recipients.slice(i,i+chunk).map(x=>({sql:'INSERT INTO notifications(id,user_id,type,investigation_id,update_id,created_at) VALUES(?,?,?,?,?,?)',args:[randomId(),x.user_id,'FOLLOWED_INVESTIGATION_UPDATE',investigationId,updateId,now]})));
    }
    return {delivered:recipients.length,truncated:rows.rows.length>200};
  }

  markAllRead(userId:string,now:number){return this.db.execute('UPDATE notifications SET read_at=? WHERE user_id=? AND read_at IS NULL',[now,userId]);}

  markInvestigationRead(userId:string,investigationId:string,latestUpdateAt:number|null,latestUpdateId:string|null,now:number){
    return this.db.execute('INSERT INTO investigation_read_state(user_id,investigation_id,last_seen_update_at,last_seen_update_id,updated_at) VALUES(?,?,?,?,?) ON CONFLICT(user_id,investigation_id) DO UPDATE SET last_seen_update_at=excluded.last_seen_update_at,last_seen_update_id=excluded.last_seen_update_id,updated_at=excluded.updated_at',[userId,investigationId,latestUpdateAt,latestUpdateId,now]);
  }
}
