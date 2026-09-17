type Bucket={count:number;reset:number};
const buckets=new Map<string,Bucket>();
export type RateClass='auth'|'search'|'write'|'evidence';
const policy:Record<RateClass,{limit:number;windowMs:number}>={auth:{limit:12,windowMs:60_000},search:{limit:90,windowMs:60_000},write:{limit:60,windowMs:60_000},evidence:{limit:12,windowMs:60_000}};
function clientKey(request:Request){return request.headers.get('CF-Connecting-IP')||request.headers.get('CF-Ray')?.split('-')[0]||'unknown';}
export function checkRateLimit(request:Request,kind:RateClass,now=Date.now()){const p=policy[kind],key=`${kind}:${clientKey(request)}`,old=buckets.get(key);if(!old||old.reset<=now){buckets.set(key,{count:1,reset:now+p.windowMs});return null;}old.count++;if(buckets.size>5000){for(const[k,v]of buckets)if(v.reset<=now)buckets.delete(k);}if(old.count<=p.limit)return null;const retry=Math.max(1,Math.ceil((old.reset-now)/1000));return new Response('Too many requests. Try again shortly.',{status:429,headers:{'Retry-After':String(retry),'Cache-Control':'private, no-store'}});}
