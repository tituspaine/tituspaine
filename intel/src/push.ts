import webpush from 'web-push';
import type { RequestContext } from './types';
import { SocialRepository } from './socialRepository';

export type PushKind='FRIEND_REQUEST'|'FRIEND_ACCEPTED'|'NEW_MESSAGE';

function allowed(p:any,kind:PushKind){
  if(!p||!Number(p.push))return false;
  if(kind==='FRIEND_REQUEST')return !!Number(p.friend_requests);
  if(kind==='FRIEND_ACCEPTED')return !!Number(p.friend_accepts);
  return !!Number(p.messages);
}

export async function deliverPush(c:RequestContext,userId:string,kind:PushKind,actorUsername:string,url:string){
  const {WEB_PUSH_PUBLIC_KEY:publicKey,WEB_PUSH_PRIVATE_KEY:privateKey,WEB_PUSH_SUBJECT:subject}=c.env;
  if(!publicKey||!privateKey||!subject)return;
  const r=new SocialRepository(c.db),prefs=await r.notificationPreferences(userId);
  if(!allowed(prefs,kind))return;
  const devices=await r.pushDevices(userId);
  if(!devices.rows.length)return;
  webpush.setVapidDetails(subject,publicKey,privateKey);
  const body=kind==='FRIEND_REQUEST'?'Friend request from @'+actorUsername:kind==='FRIEND_ACCEPTED'?'@'+actorUsername+' accepted your friend request':'New message from @'+actorUsername;
  const payload=JSON.stringify({title:'INTEL',body,url,tag:kind==='NEW_MESSAGE'?'intel-message':'intel-social'});
  await Promise.allSettled(devices.rows.map(async(d:any)=>{
    try{
      await webpush.sendNotification({endpoint:d.endpoint,keys:{p256dh:d.p256dh,auth:d.auth}},payload,{TTL:300,urgency:'high'});
    }catch(error:any){
      const status=Number(error?.statusCode||0);
      if(status===404||status===410)await r.disablePushDevice(userId,d.endpoint,Date.now());
      else console.error('push delivery failed',{kind,userId,deviceId:d.id,status});
    }
  }));
}

export function queuePush(c:RequestContext,userId:string,kind:PushKind,actorUsername:string,url:string){
  const work=deliverPush(c,userId,kind,actorUsername,url).catch(error=>console.error('push background failure',{kind,userId,error}));
  if(c.executionCtx)c.executionCtx.waitUntil(work);
  else void work;
}
