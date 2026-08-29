const WINDOW_MS=10*60*1000,MAX_REQUESTS=4;
// Best-effort protection for one warm application instance; it is not shared nor durable.
// Production platform/WAF limits must provide the distributed IP boundary.
const attempts=new Map<string,{count:number;resetAt:number}>();

export function bestEffortContactRateLimit(key:string,now=Date.now()){
  if(attempts.size>2_000)for(const [entryKey,entry] of attempts)if(entry.resetAt<=now)attempts.delete(entryKey);
  const current=attempts.get(key);
  if(!current||current.resetAt<=now){attempts.set(key,{count:1,resetAt:now+WINDOW_MS});return {allowed:true,retryAfter:0};}
  if(current.count>=MAX_REQUESTS)return {allowed:false,retryAfter:Math.max(1,Math.ceil((current.resetAt-now)/1000))};
  current.count+=1;
  return {allowed:true,retryAfter:0};
}
