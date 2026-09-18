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

  // Follower update fanout is exclusively handled by FanoutRepository's durable
  // leased outbox. Keep this repository limited to direct notification records.

  markAllRead(userId:string,now:number){return this.db.execute('UPDATE notifications SET read_at=? WHERE user_id=? AND read_at IS NULL',[now,userId]);}

  markInvestigationRead(userId:string,investigationId:string,latestUpdateAt:number|null,latestUpdateId:string|null,now:number){
    return this.db.execute('INSERT INTO investigation_read_state(user_id,investigation_id,last_seen_update_at,last_seen_update_id,updated_at) VALUES(?,?,?,?,?) ON CONFLICT(user_id,investigation_id) DO UPDATE SET last_seen_update_at=excluded.last_seen_update_at,last_seen_update_id=excluded.last_seen_update_id,updated_at=excluded.updated_at',[userId,investigationId,latestUpdateAt,latestUpdateId,now]);
  }
}
