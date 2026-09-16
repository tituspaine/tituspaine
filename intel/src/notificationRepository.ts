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
    const rows=await this.db.execute<{user_id:string}>('SELECT user_id FROM investigation_follows WHERE investigation_id=? ORDER BY user_id LIMIT 501',[investigationId]);
    const recipients=rows.rows.filter(x=>x.user_id!==exclude).slice(0,500);
    if(!recipients.length)return;
    const now=Date.now();
    await this.db.batch(recipients.map(x=>({sql:'INSERT INTO notifications(id,user_id,type,investigation_id,update_id,created_at) VALUES(?,?,?,?,?,?)',args:[randomId(),x.user_id,'FOLLOWED_INVESTIGATION_UPDATE',investigationId,updateId,now]})));
  }

  markAllRead(userId:string,now:number){return this.db.execute('UPDATE notifications SET read_at=? WHERE user_id=? AND read_at IS NULL',[now,userId]);}

  markInvestigationRead(userId:string,investigationId:string,latestUpdateAt:number|null,latestUpdateId:string|null,now:number){
    return this.db.execute('INSERT INTO investigation_read_state(user_id,investigation_id,last_seen_update_at,last_seen_update_id,updated_at) VALUES(?,?,?,?,?) ON CONFLICT(user_id,investigation_id) DO UPDATE SET last_seen_update_at=excluded.last_seen_update_at,last_seen_update_id=excluded.last_seen_update_id,updated_at=excluded.updated_at',[userId,investigationId,latestUpdateAt,latestUpdateId,now]);
  }
}
