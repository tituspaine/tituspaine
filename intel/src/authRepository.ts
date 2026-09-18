import type { IntelDatabase } from './db/types';
export interface AuthIdentity{id:string;status:string;password_hash:string;password_salt:string;kdf_params:string}
export interface RegistrationState{id:string;email_norm:string;username_norm:string;has_credentials:number}
export class AuthRepository{
 constructor(private db:IntelDatabase){}
 findIdentity(email:string){return this.db.first<AuthIdentity>('SELECT u.id,u.status,cr.password_hash,cr.password_salt,cr.kdf_params FROM users u JOIN user_credentials cr ON cr.user_id=u.id WHERE u.email_norm=? LIMIT 1',[email]);}
 findRegistrationCollision(email:string,usernameNorm:string){return this.db.first<RegistrationState>(`SELECT u.id,u.email_norm,u.username_norm,EXISTS(SELECT 1 FROM user_credentials cr WHERE cr.user_id=u.id) has_credentials FROM users u WHERE u.email_norm=? OR u.username_norm=? LIMIT 1`,[email,usernameNorm]);}
 async createAccount(v:{id:string;email:string;username:string;usernameNorm:string;hash:string;salt:string;params:string;sessionId:string;tokenHash:string;now:number;dob:string;notificationConsent:number;cookieConsent:number}){
  /* Keep only the two integrity-critical records in the transaction. Session/audit
     creation must never roll back a valid identity. */
  await this.db.batch([
   {sql:'INSERT INTO users(id,email_norm,username,username_norm,status,created_at,date_of_birth,age_verified_at,notification_consent,cookie_consent,terms_accepted_at) VALUES(?,?,?,?,?,?,?,?,?,?,?)',args:[v.id,v.email,v.username,v.usernameNorm,'ACTIVE',v.now,v.dob,v.now,v.notificationConsent,v.cookieConsent,v.now]},
   {sql:'INSERT INTO user_credentials(user_id,password_hash,password_salt,kdf,kdf_params,updated_at) VALUES(?,?,?,?,?,?)',args:[v.id,v.hash,v.salt,'PBKDF2-SHA256',v.params,v.now]}
  ]);
  await this.createSession(v.id,v.sessionId,v.tokenHash,v.now);
  try{await this.audit(v.id,'ACCOUNT_CREATED',v.now);}catch(e){console.error('account audit write failed',e);}
 }
 async repairPartialAccount(v:{id:string;hash:string;salt:string;params:string;sessionId:string;tokenHash:string;now:number}){
  /* A previous interrupted registration can leave users without credentials.
     Repair the credential first so login becomes valid even if session/audit fails. */
  await this.db.execute('INSERT INTO user_credentials(user_id,password_hash,password_salt,kdf,kdf_params,updated_at) VALUES(?,?,?,?,?,?)',[v.id,v.hash,v.salt,'PBKDF2-SHA256',v.params,v.now]);
  await this.createSession(v.id,v.sessionId,v.tokenHash,v.now);
  try{await this.audit(v.id,'ACCOUNT_REGISTRATION_REPAIRED',v.now);}catch(e){console.error('registration repair audit failed',e);}
 }
 createSession(userId:string,sessionId:string,tokenHash:string,now:number){return this.db.execute('INSERT INTO sessions(id,user_id,token_hash,created_at,expires_at) VALUES(?,?,?,?,?)',[sessionId,userId,tokenHash,now,now+2592000000]);}
 private audit(userId:string,eventType:string,now:number){return this.db.execute('INSERT INTO audit_events(id,actor_user_id,event_type,object_type,object_id,payload_json,created_at) VALUES(?,?,?,?,?,?,?)',[crypto.randomUUID(),userId,eventType,'USER',userId,'{}',now]);}
 revokeSession(tokenHash:string,now:number){return this.db.execute('UPDATE sessions SET revoked_at=? WHERE token_hash=? AND revoked_at IS NULL',[now,tokenHash]);}
}
