import { createClient, type Client, type Transaction } from '@libsql/client/web';
import type { DbArgs, DbResult, DbStatement, IntelDatabase } from './types';
import { RequestDbMetrics } from './metrics';

type Runner = Pick<Client,'execute'|'batch'> | Pick<Transaction,'execute'|'batch'>;
const result=(r:any):DbResult<any>=>({rows:Array.from(r.rows??[]) as any[],rowsAffected:Number(r.rowsAffected??0),lastInsertRowid:r.lastInsertRowid == null?undefined:String(r.lastInsertRowid)});

class TursoDatabase implements IntelDatabase {
  constructor(private readonly client:Client,private readonly runner:Runner,readonly metrics:RequestDbMetrics){}
  async execute<T>(sql:string,args:DbArgs=[]):Promise<DbResult<T>>{const t=performance.now();try{const r=await this.runner.execute({sql,args:args as any});this.metrics.record(1,performance.now()-t);return result(r) as DbResult<T>;}catch(e){this.metrics.record(1,performance.now()-t,true);throw e;}}
  async first<T>(sql:string,args:DbArgs=[]):Promise<T|null>{const r=await this.execute<T>(sql,args);return r.rows[0]??null;}
  async batch(statements:DbStatement[]):Promise<DbResult[]>{if(!statements.length)return[];const t=performance.now();try{const rs=await this.runner.batch(statements.map(s=>({sql:s.sql,args:(s.args??[]) as any})) as any,'write');this.metrics.record(statements.length,performance.now()-t);return rs.map(result);}catch(e){this.metrics.record(statements.length,performance.now()-t,true);throw e;}}
  async transaction<T>(work:(tx:IntelDatabase)=>Promise<T>):Promise<T>{const tx=await this.client.transaction('write');const scoped=new TursoDatabase(this.client,tx,this.metrics);try{const value=await work(scoped);await tx.commit();return value;}catch(e){await tx.rollback();throw e;}finally{tx.close();}}
}

export function createTursoDatabase(url:string,authToken:string,metrics=new RequestDbMetrics()):IntelDatabase {
  const client=createClient({url,authToken});
  return new TursoDatabase(client,client,metrics);
}
