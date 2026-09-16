import type { Env } from './types';

const allowedInline = new Set(['application/pdf','image/jpeg','image/png','image/webp','text/plain']);
export async function serveEvidence(env:Env, attachmentId:string):Promise<Response>{
  const meta=await env.DB.prepare(`SELECT object_key,original_filename,mime_type,sha256 FROM attachments WHERE id=? LIMIT 1`).bind(attachmentId).first<{object_key:string;original_filename:string;mime_type:string;sha256:string}>();
  if(!meta)return new Response('Evidence file not found',{status:404});
  const object=await env.EVIDENCE.get(meta.object_key);
  if(!object)return new Response('Evidence object unavailable',{status:404});
  const headers=new Headers();
  object.writeHttpMetadata(headers);
  headers.set('Content-Type',meta.mime_type);
  headers.set('ETag',object.httpEtag);
  headers.set('X-Content-Type-Options','nosniff');
  headers.set('Cache-Control','public, max-age=3600, immutable');
  const safe=meta.original_filename.replace(/[^a-zA-Z0-9._ -]/g,'_');
  headers.set('Content-Disposition',`${allowedInline.has(meta.mime_type)?'inline':'attachment'}; filename="${safe}"`);
  headers.set('Digest',`sha-256=${meta.sha256}`);
  return new Response(object.body,{headers});
}

export async function storeEvidence(env:Env,file:File,key:string):Promise<{sha256:string,size:number,mime:string}>{
  const bytes=await file.arrayBuffer();
  const hash=await crypto.subtle.digest('SHA-256',bytes);
  const sha256=[...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,'0')).join('');
  await env.EVIDENCE.put(key,bytes,{httpMetadata:{contentType:file.type||'application/octet-stream'},customMetadata:{sha256}});
  return {sha256,size:bytes.byteLength,mime:file.type||'application/octet-stream'};
}
