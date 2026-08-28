import type { WebDoctorReport } from "./types/analysis";

const CACHE_TTL_MS=10*60_000;
const MAX_CACHE_ENTRIES=250;
const completed=new Map<string,{expires:number;report:WebDoctorReport}>();
const pending=new Map<string,Promise<WebDoctorReport>>();

function prune(){const now=Date.now();for(const [key,value] of completed){if(value.expires<=now)completed.delete(key);}while(completed.size>MAX_CACHE_ENTRIES){const oldest=completed.keys().next().value as string|undefined;if(!oldest)break;completed.delete(oldest);}}

export async function withAnalysisCache(key:string,analyse:()=>Promise<WebDoctorReport>,onStatus?:(status:"hit"|"shared"|"miss")=>void,options?:{bypass?:boolean}){prune();const cached=completed.get(key);if(!options?.bypass&&cached&&cached.expires>Date.now()){completed.delete(key);completed.set(key,cached);onStatus?.("hit");return cached.report;}const active=pending.get(key);if(active){onStatus?.("shared");return active;}onStatus?.("miss");const task=analyse().then(report=>{completed.set(key,{expires:Date.now()+CACHE_TTL_MS,report});prune();return report;}).finally(()=>pending.delete(key));pending.set(key,task);return task;}
