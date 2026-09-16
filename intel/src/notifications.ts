import type { Env, RequestContext } from './types';
import type { IntelDatabase } from './db/types';
import { databaseForRequest } from './db';
import { validSameOrigin } from './security';
import { NotificationRepository } from './notificationRepository';

function dbForEnv(env:Env):IntelDatabase{return databaseForRequest(env).db;}
function dbForContext(c:RequestContext):IntelDatabase{return c.db??dbForEnv(c.env);}
export async function notify(env:Env,userId:string,type:string,refs:{investigationId?:string;commentId?:string;updateId?:string;payload?:unknown}={}){await new NotificationRepository(dbForEnv(env)).notify(userId,type,refs);}
export async function notifyFollowers(env:Env,investigationId:string,updateId:string,exclude?:string){await new NotificationRepository(dbForEnv(env)).notifyFollowers(investigationId,updateId,exclude);}
export async function markNotificationsRead(c:RequestContext){if(!c.user)return new Response('Unauthorized',{status:401});if(!validSameOrigin(c.request,c.env))return new Response('Invalid origin',{status:403});await new NotificationRepository(dbForContext(c)).markAllRead(c.user.id,Date.now());return new Response(null,{status:303,headers:{Location:'/dashboard#notifications'}});}
export async function markInvestigationRead(c:RequestContext,investigationId:string,latestUpdateAt:number|null,latestUpdateId:string|null){if(!c.user)return;await new NotificationRepository(dbForContext(c)).markInvestigationRead(c.user.id,investigationId,latestUpdateAt,latestUpdateId,Date.now());}
