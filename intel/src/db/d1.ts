import type { DbArgs, DbResult, DbStatement, IntelDatabase } from './types';
import { RequestDbMetrics } from './metrics';

const mapped=<T>(r:any):DbResult<T>=>({rows:(r?.results??[]) as T[],rowsAffected:Number(r?.meta?.changes??0),lastInsertRowid:r?.meta?.last_row_id==null?undefined:Number(r.meta.last_row_id)});

class D1IntelDatabase implements IntelDatabase {
  constructor(private readonly d1:D1Database,readonly metrics:RequestDbMetrics){}
  async execute<T>(sql:string,args:DbArgs=[]):Promise<DbResult<T>>{const t=performance.now();try{const r=await this.d1.prepare(sql).bind(...args as any[]).all<T>();this.metrics.record(1,performance.now()-t);return mapped<T>(r);}catch(e){this.metrics.record(1,performance.now()-t,true);throw e;}}
  async first<T>(sql:string,args:DbArgs=[]):Promise<T|null>{const t=performance.now();try{const r=await this.d1.prepare(sql).bind(...args as any[]).first<T>();this.metrics.record(1,performance.now()-t);return r??null;}catch(e){this.metrics.record(1,performance.now()-t,true);throw e;}}
  async batch(statements:DbStatement[]):Promise<DbResult[]>{if(!statements.length)return[];const t=performance.now();try{const prepared=statements.map(s=>this.d1.prepare(s.sql).bind(...((s.args??[]) as any[])));const rs=await this.d1.batch(prepared);this.metrics.record(statements.length,performance.now()-t);return rs.map(r=>mapped(r));}catch(e){this.metrics.record(statements.length,performance.now()-t,true);throw e;}}
}

export function createD1Database(d1:D1Database,metrics=new RequestDbMetrics()):IntelDatabase{return new D1IntelDatabase(d1,metrics);}
