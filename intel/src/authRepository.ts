import type { IntelDatabase } from './db/types';
export interface AuthIdentity{id:string;status:string;password_hash:string;password_salt:string}
export class AuthRepository{
 constructor(private db:IntelDatabase){}
 findIdentity(email:string){return this.db.first<AuthIdentity>('SELECT u.id,u.status,cr.password_hash,cr.password_salt FROM users u JOIN user_credentials cr ON cr.user_id=u.id WHERE u.email_norm=? LIMIT 1',[email]);}
 findRegistrationCollision(email:string,usernameNorm:string){return this.db.first<{id:string}>('SELECT id FROM users WHERE email_norm=? OR username_norm=? LIMIT 1',[email,usernameNorm]);}
 createAccount(v:{id:string;email:string;username:string;usernameNorm:string;hash:string;salt:string;params:string;sessionId:string;tokenHash:string;now:number}){return this.db.batch([
  {sql:'INSERT INTO users(id,email_norm,username,username_norm,status,created_at) VALUES(?,?,?,?,?,?)',args:[v.id,v.email,v.username,v.usernameNorm,'ACTIVE',v.now]},
  {sql:'INSERT INTO user_credentials(user_id,password_hash,password_salt,kdf,kdf_params,updated_at) VALUES(?,?,?,?,?,?)',args:[v.id,v.hash,v.salt,'PBKDF2-SHA256',v.params,v.now]},
  {sql:'INSERT INTO sessions(id,user_id,token_hash,created_at,expires_at) VALUES(?,?,?,?,?)',args:[v.sessionId,v.id,v.tokenHash,v.now,v.now+2592000000]},
  {sql:'INSERT INTO audit_events(id,actor_user_id,event_type,object_type,object_id,payload_json,created_at) VALUES(?,?,?,?,?,?,?)',args:[crypto.randomUUID(),v.id,'ACCOUNT_CREATED','USER',v.id,'{}',v.now]}
 ]);}
 createSession(userId:string,sessionId:string,tokenHash:string,now:number){return this.db.execute('INSERT INTO sessions(id,user_id,token_hash,created_at,expires_at) VALUES(?,?,?,?,?)',[sessionId,userId,tokenHash,now,now+2592000000]);}
 revokeSession(tokenHash:string,now:number){return this.db.execute('UPDATE sessions SET revoked_at=? WHERE token_hash=? AND revoked_at IS NULL',[now,tokenHash]);}
}
