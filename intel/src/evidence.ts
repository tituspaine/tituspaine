import type { Env } from './types';

/** Store immutable binary evidence in R2. Relational attachment metadata is handled by EvidenceRepository. */
export async function storeEvidence(env:Env,file:File,key:string):Promise<{sha256:string,size:number,mime:string}>{
  const bytes=await file.arrayBuffer();
  const hash=await crypto.subtle.digest('SHA-256',bytes);
  const sha256=[...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,'0')).join('');
  await env.EVIDENCE.put(key,bytes,{httpMetadata:{contentType:file.type||'application/octet-stream'},customMetadata:{sha256}});
  return {sha256,size:bytes.byteLength,mime:file.type||'application/octet-stream'};
}
