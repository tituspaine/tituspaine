import { describe,it,expect } from 'vitest';
import { RequestDbMetrics } from '../src/db/metrics';

describe('request database metrics',()=>{
  it('aggregates without database writes',()=>{const m=new RequestDbMetrics();m.record(1,2.5);m.record(3,4,true);expect(m.snapshot()).toEqual({operations:2,statements:4,errors:1,durationMs:6.5});});
});

describe('INTEL efficiency budgets',()=>{
  it('keeps the initial screen target intentionally small',()=>{
    const budget={initialApiRequests:1,initialDbStatements:8};
    expect(budget.initialApiRequests).toBeLessThanOrEqual(1);
    expect(budget.initialDbStatements).toBeLessThanOrEqual(8);
  });
});
