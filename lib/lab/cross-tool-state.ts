export type CrossToolState={url:string;title:string;description:string};

const STORAGE_KEY="web-lab:cross-tool-state:v1";
const EMPTY_STATE:CrossToolState={url:"",title:"",description:""};

export function readCrossToolState():CrossToolState{
  if(typeof window==="undefined")return EMPTY_STATE;
  try{const value=JSON.parse(sessionStorage.getItem(STORAGE_KEY)??"null") as Partial<CrossToolState>|null;return {url:typeof value?.url==="string"?value.url:"",title:typeof value?.title==="string"?value.title:"",description:typeof value?.description==="string"?value.description:""};}catch{return EMPTY_STATE;}
}

export function saveCrossToolState(update:Partial<CrossToolState>){
  if(typeof window==="undefined")return;
  try{sessionStorage.setItem(STORAGE_KEY,JSON.stringify({...readCrossToolState(),...update}));}catch{}
}
