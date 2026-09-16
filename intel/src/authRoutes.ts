import type { Env, RequestContext } from './types';
import { clearSessionCookie, hashPassword, normalizeEmail, normalizeUsername, randomId, randomToken, sessionCookie, sha256, validSameOrigin, verifyPassword } from './security';
import { layout } from './views';

const html=(body:string,status=200,headers:HeadersInit={})=>new Response(body,{status,headers:{'Content-Type':'text/html; charset=utf-8',...headers}});
const redirect=(to:string,headers:HeadersInit={})=>new Response(null,{status:303,headers:{Location:to,...headers}});
const esc=(s:unknown)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const safeReturn=(v:string|undefined)=>v&&v.startsWith('/')&&!v.startsWith('//')?v:'/';
const form=async(r:Request)=>Object.fromEntries((await r.formData()).entries()) as Record<string,string>;

async function verifyTurnstile(request:Request,env:Env,token:string){
 if(env.ENVIRONMENT==='test')return true;
 if(!token)return false;
 const fd=new FormData(); fd.set('secret',env.TURNSTILE_SECRET_KEY); fd.set('response',token);
 const ip=request.headers.get('CF-Connecting-IP'); if(ip)fd.set('remoteip',ip);
 try{const r=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:fd}); const out=await r.json() as {success?:boolean}; return out.success===true;}catch{return false;}
}

function authView(c:RequestContext,kind:'login'|'register',message='',values:{email?:string;username?:string}={}){
 const ret=esc(c.url.searchParams.get('return')||'/');
 const isRegister=kind==='register';
 const notice=message?`<div class="notice auth-error" role="alert">${esc(message)}${message.startsWith('Account already exists')?' <a class="blue" href="/login">LOG IN</a>':''}</div>`:'';
 const password=`<div class="field"><label for="password">PASSWORD</label><div class="password-wrap"><input id="password" name="password" type="password" minlength="4" maxlength="256" autocomplete="${isRegister?'new-password':'current-password'}" required><button class="password-toggle" type="button" data-password-toggle="password" aria-controls="password">SHOW PASSWORD</button></div></div>`;
 const confirm=isRegister?`<div class="field"><label for="password_confirm">RE-ENTER PASSWORD</label><div class="password-wrap"><input id="password_confirm" name="password_confirm" type="password" minlength="4" maxlength="256" autocomplete="new-password" required><button class="password-toggle" type="button" data-password-toggle="password_confirm" aria-controls="password_confirm">SHOW PASSWORD</button></div></div>`:'';
 const widget=isRegister?`<div class="cf-turnstile" data-sitekey="${esc(c.env.TURNSTILE_SITE_KEY)}" data-theme="light"></div>`:'';
 const body=`<div class="eyebrow">ACCOUNT</div><h1>${isRegister?'JOIN INTEL':'LOG IN'}</h1>${notice}<form class="panel auth-panel" method="post" action="/api/${kind}"><input type="hidden" name="return" value="${ret}">${isRegister?`<div class="field"><label for="username">USERNAME</label><input id="username" name="username" minlength="2" maxlength="40" autocomplete="username" value="${esc(values.username||'')}" required></div>`:''}<div class="field"><label for="email">EMAIL</label><input id="email" name="email" type="email" autocomplete="email" value="${esc(values.email||'')}" required></div>${password}${confirm}${widget}<button class="blue" type="submit">${isRegister?'CREATE ACCOUNT':'LOG IN'}</button></form>${!isRegister?'<p class="auth-switch">Need an account? <a class="blue" href="/register">JOIN INTEL</a></p>':'<p class="auth-switch">Already have an account? <a class="blue" href="/login">LOG IN</a></p>'}`;
 const head=`${isRegister?'<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>':''}<script src="/auth.js" defer></script>`;
 return html(layout(isRegister?'Create account':'Log in',body,c.user,'INTEL account access.',`${c.env.APP_ORIGIN}/${kind}`,head),message?400:200);
}

export const authPage=(c:RequestContext,kind:'login'|'register')=>authView(c,kind);

export async function register(c:RequestContext){
 if(!validSameOrigin(c.request,c.env))return authView(c,'register','Your request could not be verified. Please reload and try again.');
 const d=await form(c.request), email=normalizeEmail(d.email||''), username=String(d.username||'').trim(), usernameNorm=normalizeUsername(username), pw=d.password||'', confirm=d.password_confirm||'';
 const values={email:d.email||'',username};
 if(pw!==confirm)return authView(c,'register','Passwords do not match.',values);
 if(pw.length<4||pw.length>256||username.length<2||username.length>40||!email.includes('@'))return authView(c,'register','Please check the account information and try again.',values);
 if(!await verifyTurnstile(c.request,c.env,d['cf-turnstile-response']||''))return authView(c,'register','Verification failed. Please complete the security check again.',values);
 let existing=await c.env.DB.prepare('SELECT u.id, EXISTS(SELECT 1 FROM user_credentials cr WHERE cr.user_id=u.id) has_credentials, EXISTS(SELECT 1 FROM sessions s WHERE s.user_id=u.id) has_sessions FROM users u WHERE u.email_norm=? OR u.username_norm=? LIMIT 1').bind(email,usernameNorm).first<any>();
 if(existing&&Number(existing.has_credentials)===0&&Number(existing.has_sessions)===0){
   try{await c.env.DB.prepare('DELETE FROM users WHERE id=?').bind(existing.id).run(); existing=null;}catch{/* referenced orphan: do not allow takeover */}
 }
 if(existing)return authView(c,'register','Account already exists. Please log in or sign up with a different account.',values);
 const id=randomId(), now=Date.now(), hp=await hashPassword(pw), token=randomToken(), digest=await sha256(`${token}:${c.env.SESSION_PEPPER}`), sid=randomId();
 try{
   await c.env.DB.prepare('INSERT INTO users(id,email_norm,username,username_norm,status,created_at) VALUES(?,?,?,?,?,?)').bind(id,email,username,usernameNorm,'ACTIVE',now).run();
   await c.env.DB.prepare('INSERT INTO user_credentials(user_id,password_hash,password_salt,kdf,kdf_params,updated_at) VALUES(?,?,?,?,?,?)').bind(id,hp.hash,hp.salt,'PBKDF2-SHA256',hp.params,now).run();
   await c.env.DB.prepare('INSERT INTO sessions(id,user_id,token_hash,created_at,expires_at) VALUES(?,?,?,?,?)').bind(sid,id,digest,now,now+2592000000).run();
 }catch(e){
   console.error('registration write failed',e);
   try{await c.env.DB.prepare('DELETE FROM sessions WHERE user_id=?').bind(id).run();}catch{}
   try{await c.env.DB.prepare('DELETE FROM user_credentials WHERE user_id=?').bind(id).run();}catch{}
   try{await c.env.DB.prepare('DELETE FROM users WHERE id=?').bind(id).run();}catch{}
   const collision=await c.env.DB.prepare('SELECT 1 x FROM users WHERE email_norm=? OR username_norm=? LIMIT 1').bind(email,usernameNorm).first();
   return authView(c,'register',collision?'Account already exists. Please log in or sign up with a different account.':'We could not create the account. Please try again.',values);
 }
 try{await c.env.DB.prepare('INSERT INTO audit_events(id,actor_user_id,event_type,object_type,object_id,payload_json,created_at) VALUES(?,?,?,?,?,?,?)').bind(randomId(),id,'ACCOUNT_CREATED','USER',id,'{}',now).run();}catch(e){console.error('account audit failed',e);}
 return redirect(safeReturn(d.return),{'Set-Cookie':sessionCookie(token)});
}

export async function login(c:RequestContext){
 if(!validSameOrigin(c.request,c.env))return authView(c,'login','Your request could not be verified. Please reload and try again.');
 const d=await form(c.request),email=normalizeEmail(d.email||''),pw=d.password||'',values={email:d.email||''};
 const row=await c.env.DB.prepare('SELECT u.id,u.status,cr.password_hash,cr.password_salt FROM users u JOIN user_credentials cr ON cr.user_id=u.id WHERE u.email_norm=? LIMIT 1').bind(email).first<any>();
 if(!row||row.status!=='ACTIVE'||!await verifyPassword(pw,row.password_salt,row.password_hash))return authView(c,'login','Invalid email or password.',values);
 const token=randomToken(),now=Date.now(),digest=await sha256(`${token}:${c.env.SESSION_PEPPER}`);
 try{await c.env.DB.prepare('INSERT INTO sessions(id,user_id,token_hash,created_at,expires_at) VALUES(?,?,?,?,?)').bind(randomId(),row.id,digest,now,now+2592000000).run();}catch(e){console.error('login session failed',e);return authView(c,'login','We could not start your session. Please try again.',values);}
 return redirect(safeReturn(d.return),{'Set-Cookie':sessionCookie(token)});
}

export async function logout(c:RequestContext){
 const token=(c.request.headers.get('Cookie')||'').match(/(?:^|; )intel_session=([^;]+)/)?.[1];
 if(token){const digest=await sha256(`${token}:${c.env.SESSION_PEPPER}`);await c.env.DB.prepare('UPDATE sessions SET revoked_at=? WHERE token_hash=?').bind(Date.now(),digest).run();}
 return redirect('/',{'Set-Cookie':clearSessionCookie()});
}
