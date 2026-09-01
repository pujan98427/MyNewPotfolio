const DATABASE="pujan-lab-transient";
const STORE="image-handoff";
const RECORD_KEY="current";
const MAX_AGE_MS=10*60*1000;
type StoredImage={blob:Blob;name:string;createdAt:number;expiresAt:number};

function openDatabase():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{if(typeof indexedDB==="undefined"){reject(new Error("Temporary browser storage is unavailable."));return}const request=indexedDB.open(DATABASE,1);request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains(STORE))request.result.createObjectStore(STORE)};request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(new Error("Temporary browser storage could not be opened."));});}

export async function saveImageHandoff(blob:Blob,name:string):Promise<void>{const database=await openDatabase();try{await new Promise<void>((resolve,reject)=>{const transaction=database.transaction(STORE,"readwrite"),now=Date.now();transaction.objectStore(STORE).put({blob,name,createdAt:now,expiresAt:now+MAX_AGE_MS} satisfies StoredImage,RECORD_KEY);transaction.oncomplete=()=>resolve();transaction.onerror=()=>reject(new Error("The image could not be prepared for the next tool."));});}finally{database.close()}}

export async function takeImageHandoff():Promise<File|null>{const database=await openDatabase();try{return await new Promise<File|null>((resolve,reject)=>{const transaction=database.transaction(STORE,"readwrite"),store=transaction.objectStore(STORE),request=store.get(RECORD_KEY);request.onsuccess=()=>{const stored=request.result as StoredImage|undefined;store.delete(RECORD_KEY);if(!stored||stored.expiresAt<=Date.now()){resolve(null);return}resolve(new File([stored.blob],stored.name,{type:stored.blob.type,lastModified:stored.createdAt}))};request.onerror=()=>reject(new Error("The temporary image could not be read."));});}finally{database.close()}}
