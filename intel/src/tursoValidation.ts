import type { RequestContext } from './types';
import { createTursoDatabase } from './db/turso';
import { validSameOrigin } from './security';

const json=(body:unknown,status=200)=>new Response(JSON.stringify(body,null,2),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
const assert=(condition:unknown,message:string)=>{if(!condition)throw new Error(message);};

export async function validateTurso(c:RequestContext){
  if(!c.user?.isAdmin)return new Response('Forbidden',{status:403});
  if(!validSameOrigin(c.request,c.env))return new Response('Invalid origin',{status:403});
  if(!c.env.TURSO_DATABASE_URL||!c.env.TURSO_AUTH_TOKEN)return json({ok:false,error:'Turso validation credentials are not configured.'},503);
  // Safety: this harness never uses the live request database and refuses to run if production is already switched.
  if(c.env.PERSISTENCE_PROVIDER==='turso')return json({ok:false,error:'Validation refused while Turso is the active persistence provider.'},409);
  const db=createTursoDatabase(c.env.TURSO_DATABASE_URL,c.env.TURSO_AUTH_TOKEN);
  const runId=crypto.randomUUID(),now=Date.now(),checks:string[]=[];
  try{
    const migration=await db.first<{version:string}>('SELECT version FROM schema_migrations WHERE version=? LIMIT 1',['0002_search']);
    assert(migration?.version==='0002_search','V3 Turso migrations are not fully applied.');checks.push('schema_migrations');
    const fts=await db.first<{name:string}>("SELECT name FROM sqlite_master WHERE type='table' AND name='search_index' LIMIT 1");assert(fts?.name==='search_index','FTS5 search_index is missing.');checks.push('fts5_present');
    const inv=`validation-inv-${runId}`,entity=`validation-entity-${runId}`,alias=`Validation Alias ${runId}`;
    await db.batch([
      {sql:'INSERT INTO investigations(id,slug,title,summary,status,created_by_user_id,created_at,updated_at,published_at) VALUES(?,?,?,?,?,?,?,?,?)',args:[inv,`validation-${runId}`,`Validation ${runId}`,`INTEL V3 Turso validation ${runId}`,'PUBLISHED',null,now,now,now]},
      {sql:'INSERT INTO entities(id,type,canonical_name,normalized_name,description,created_by_user_id,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)',args:[entity,'ORGANIZATION',`Validation Entity ${runId}`,`validation entity ${runId}`,`Graph validation ${runId}`,null,now,now]},
      {sql:'INSERT INTO entity_aliases(id,entity_id,alias,normalized_alias,created_at) VALUES(?,?,?,?,?)',args:[crypto.randomUUID(),entity,alias,alias.toLowerCase(),now]}
    ]);checks.push('atomic_batch_write');
    const search=await db.first<{object_id:string}>("SELECT object_id FROM search_index WHERE search_index MATCH ? AND object_type='ENTITY' LIMIT 1",[`\"${runId}\"`]);assert(search?.object_id===entity,'FTS trigger/alias search validation failed.');checks.push('fts_trigger_alias');
    // Deliberately fail an atomic batch; neither row may survive.
    const rollbackA=`rollback-a-${runId}`,rollbackB=`rollback-b-${runId}`;let failed=false;
    try{await db.batch([{sql:'INSERT INTO entities(id,type,canonical_name,normalized_name,created_at,updated_at) VALUES(?,?,?,?,?,?)',args:[rollbackA,'ORGANIZATION','Rollback Probe','rollback probe',now,now]},{sql:'INSERT INTO entities(id,type,canonical_name,normalized_name,created_at,updated_at) VALUES(?,?,?,?,?,?)',args:[rollbackB,'NOT_A_VALID_TYPE','Rollback Failure','rollback failure',now,now]}]);}catch{failed=true;}
    assert(failed,'Expected transaction failure did not occur.');const survivor=await db.first<{id:string}>('SELECT id FROM entities WHERE id=? LIMIT 1',[rollbackA]);assert(!survivor,'Turso batch did not roll back atomically.');checks.push('atomic_batch_rollback');
    await db.batch([{sql:'DELETE FROM entity_aliases WHERE entity_id=?',args:[entity]},{sql:'DELETE FROM entities WHERE id=?',args:[entity]},{sql:'DELETE FROM investigations WHERE id=?',args:[inv]}]);checks.push('cleanup');
    return json({ok:true,runId,checks});
  }catch(error){console.error('Turso validation failed',error);return json({ok:false,runId,checks,error:error instanceof Error?error.message:'Validation failed'},500);}
}
