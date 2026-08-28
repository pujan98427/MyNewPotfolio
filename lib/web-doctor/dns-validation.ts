import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const INTERNAL_HOST_SUFFIXES=[".localhost",".local",".localdomain",".internal",".home",".lan",".test",".invalid",".example"];
const INTERNAL_HOSTS=new Set(["localhost","localhost.localdomain","metadata.google.internal","metadata.azure.internal","instance-data","instance-data.ec2.internal"]);

function parseIpv4(address:string){const parts=address.split(".");if(parts.length!==4)return null;const octets=parts.map(part=>/^\d{1,3}$/.test(part)?Number(part):NaN);return octets.every(value=>Number.isInteger(value)&&value>=0&&value<=255)?octets:null;}
function blockedIpv4(address:string){const parts=parseIpv4(address);if(!parts)return true;const [a,b,c]=parts;return a===0||a===10||a===127||(a===100&&b>=64&&b<=127)||(a===169&&b===254)||(a===172&&b>=16&&b<=31)||(a===192&&b===168)||(a===192&&b===0&&c===0)||(a===192&&b===0&&c===2)||(a===192&&b===88&&c===99)||(a===198&&(b===18||b===19))||(a===198&&b===51&&c===100)||(a===203&&b===0&&c===113)||a>=224;}
function parseIpv6Part(part:string){if(!part)return [];if(part.includes(".")){const ipv4=parseIpv4(part);return ipv4?[ipv4[0]*256+ipv4[1],ipv4[2]*256+ipv4[3]]:null;}if(!/^[0-9a-f]{1,4}$/i.test(part))return null;return [Number.parseInt(part,16)];}
function parseIpv6(address:string){const clean=address.toLowerCase().replace(/^\[|\]$/g,"").split("%")[0];if((clean.match(/::/g)??[]).length>1)return null;const [leftText,rightText]=clean.split("::");const left:number[]=[],right:number[]=[];for(const part of leftText?leftText.split(":"):[]){const words=parseIpv6Part(part);if(!words)return null;left.push(...words);}for(const part of rightText?rightText.split(":"):[]){const words=parseIpv6Part(part);if(!words)return null;right.push(...words);}if(clean.includes("::")){const missing=8-left.length-right.length;if(missing<1)return null;return [...left,...Array<number>(missing).fill(0),...right];}return left.length===8?left:null;}
function blockedIpv6(address:string){const words=parseIpv6(address);if(!words)return true;const allZero=words.every(word=>word===0);if(allZero||words.slice(0,7).every(word=>word===0)&&words[7]===1)return true;if(words.slice(0,5).every(word=>word===0)&&words[5]===0xffff)return blockedIpv4(`${words[6]>>8}.${words[6]&255}.${words[7]>>8}.${words[7]&255}`);const first=words[0],second=words[1];return first<0x2000||first>0x3fff||words.slice(0,6).every(word=>word===0)||(first===0x64&&second===0xff9b)||(first&0xfe00)===0xfc00||(first&0xffc0)===0xfe80||(first&0xffc0)===0xfec0||(first&0xff00)===0xff00||(first===0x100&&words.slice(1,4).every(word=>word===0))||(first===0x2001&&(second===0||second===2||second===0x0db8||(second>=0x10&&second<=0x2f)))||first===0x2002||first===0x3fff||first===0x5f00;}
export function isBlockedAddress(address:string){const version=isIP(address.replace(/^\[|\]$/g,""));return version===4?blockedIpv4(address):version===6?blockedIpv6(address):true;}

export async function assertPublicUrl(url:URL){
  if(!["http:","https:"].includes(url.protocol))throw new Error("Only HTTP and HTTPS websites can be analysed.");
  if(url.username||url.password)throw new Error("URLs containing login credentials are not supported.");
  const expectedPort=url.protocol==="https:"?"443":"80";if(url.port&&url.port!==expectedPort)throw new Error("Only standard web ports 80 and 443 can be analysed.");
  const hostname=url.hostname.toLowerCase().replace(/^\[|\]$/g,"").replace(/\.$/,"");
  if(!hostname||INTERNAL_HOSTS.has(hostname)||INTERNAL_HOST_SUFFIXES.some(suffix=>hostname.endsWith(suffix)))throw new Error("Local and internal websites cannot be analysed.");
  if(isIP(hostname)){if(isBlockedAddress(hostname))throw new Error("Private, reserved and internal network addresses cannot be analysed.");return [{address:hostname,family:isIP(hostname) as 4|6}];}
  let addresses;let dnsTimer:ReturnType<typeof setTimeout>|undefined;try{addresses=await Promise.race([lookup(hostname,{all:true,verbatim:true}),new Promise<never>((_,reject)=>{dnsTimer=setTimeout(()=>reject(new Error("DNS validation timed out.")),3_000);})]);}catch(error){if(error instanceof Error&&error.message==="DNS validation timed out.")throw error;throw new Error("That hostname could not be resolved.");}finally{if(dnsTimer)clearTimeout(dnsTimer);}
  if(!addresses.length||addresses.some(item=>isBlockedAddress(item.address)))throw new Error("This hostname does not resolve exclusively to public internet addresses.");
  return addresses.map(item=>({address:item.address,family:item.family as 4|6}));
}
