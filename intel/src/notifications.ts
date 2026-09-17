import type { RequestContext } from './types';
import { validSameOrigin } from './security';
import { NotificationRepository } from './notificationRepository';

export async function markNotificationsRead(c:RequestContext){if(!c.user)return new Response('Unauthorized',{status:401});if(!validSameOrigin(c.request,c.env))return new Response('Invalid origin',{status:403});await new NotificationRepository(c.db).markAllRead(c.user.id,Date.now());return new Response(null,{status:303,headers:{Location:'/dashboard#notifications'}});}
export async function markInvestigationRead(c:RequestContext,investigationId:string,latestUpdateAt:number|null,latestUpdateId:string|null){if(!c.user)return;await new NotificationRepository(c.db).markInvestigationRead(c.user.id,investigationId,latestUpdateAt,latestUpdateId,Date.now());}
