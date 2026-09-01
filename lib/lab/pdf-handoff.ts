const DATABASE="pujan-lab-pdf-transient";
const STORE="pdf-handoff";
const RECORD_KEY="current";
const MAX_AGE_MS=10*60*1000;
type StoredPdf={blob:Blob;name:string;createdAt:number;expiresAt:number};

function openDatabase():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{if(typeof indexedDB==="undefined"){reject(new Error("Temporary browser storage is unavailable."));return}const request=indexedDB.open(DATABASE,1);request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains(STORE))request.result.createObjectStore(STORE)};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(new Error("Temporary browser storage could not be opened."));});}

export async function savePdfHandoff(blob:Blob,name:string):Promise<void>{const database=await openDatabase();try{await new Promise<void>((resolve,reject)=>{const transaction=database.transaction(STORE,"readwrite"),now=Date.now();transaction.objectStore(STORE).put({blob,name,createdAt:now,expiresAt:now+MAX_AGE_MS} satisfies StoredPdf,RECORD_KEY);transaction.oncomplete=()=>resolve();transaction.onerror=()=>reject(new Error("The PDF could not be prepared for the next tool."));});}finally{database.close()}}

export async function takePdfHandoff():Promise<File|null>{const database=await openDatabase();try{return await new Promise<File|null>((resolve,reject)=>{const transaction=database.transaction(STORE,"readwrite"),store=transaction.objectStore(STORE),request=store.get(RECORD_KEY);request.onsuccess=()=>{const stored=request.result as StoredPdf|undefined;store.delete(RECORD_KEY);if(!stored||stored.expiresAt<=Date.now()){resolve(null);return}resolve(new File([stored.blob],stored.name,{type:"application/pdf",lastModified:stored.createdAt}))};request.onerror=()=>reject(new Error("The temporary PDF could not be read."));});}finally{database.close()}}
