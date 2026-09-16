export interface DbMetricsSnapshot { operations:number; statements:number; errors:number; durationMs:number; }

export class RequestDbMetrics {
  operations=0; statements=0; errors=0; durationMs=0;
  record(statementCount:number,durationMs:number,error=false){this.operations++;this.statements+=statementCount;this.durationMs+=durationMs;if(error)this.errors++;}
  snapshot():DbMetricsSnapshot{return {operations:this.operations,statements:this.statements,errors:this.errors,durationMs:Math.round(this.durationMs*100)/100};}
}
