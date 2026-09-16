import { createClient, type Client } from '@libsql/client/web';
import type { DbArgs, DbResult, DbStatement, IntelDatabase } from './types';
import { RequestDbMetrics } from './metrics';

const result=(r:any):DbResult<any>=>({rows:Array.from(r.rows??[]) as any[],rowsAffected:Number(r.rowsAffected??0),lastInsertRowid:r.lastInsertRowid == null?undefined:String(r.lastInsertRowid)});

class TursoDatabase implements IntelDatabase {
  constructor(private readonly client:Client,readonly metrics:RequestDbMetrics){}
  async execute<T>(sql:string,args:DbArgs=[]):Promise<DbResult<T>>{const t=performance.now();try{const r=await this.client.execute({sql,args:args as any});this.metrics.record(1,performance.now()-t);return result(r) as DbResult<T>;}catch(e){this.metrics.record(1,performance.now()-t,true);throw e;}}
  async first<T>(sql:string,args:DbArgs=[]):Promise<T|null>{const r=await this.execute<T>(sql,args);return r.rows[0]??null;}
  async batch(statements:DbStatement[]):Promise<DbResult[]>{if(!statements.length)return[];const t=performance.now();try{const rs=await this.client.batch(statements.map(s=>({sql:s.sql,args:(s.args??[]) as any})) as any,'write');this.metrics.record(statements.length,performance.now()-t);return rs.map(result);}catch(e){this.metrics.record(statements.length,performance.now()-t,true);throw e;}}
  async transaction<T>(work:(tx:IntelDatabase)=>Promise<T>):Promise<T>{
    // libSQL HTTP/Web clients cannot safely expose an interactive transaction across Worker requests.
    // Domain code requiring atomicity must use `batch`, which libSQL executes transactionally.
    // Keeping this method explicit prevents a false promise of cross-provider interactive semantics.
    throw new Error('Interactive transactions are unsupported by the Turso web adapter; use an atomic batch');
  }
}

export function createTursoDatabase(url:string,authToken:string,metrics=new RequestDbMetrics()):IntelDatabase {
  const client=createClient({url,authToken});
  return new TursoDatabase(client,metrics);
}
