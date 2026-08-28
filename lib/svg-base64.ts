export const MAX_SVG_BYTES=1024*1024;

export function assertSvgMarkup(svg:string){
  const source=svg.trim();
  if(!source)throw new Error("Paste SVG markup or choose an SVG file first.");
  const bytes=new TextEncoder().encode(source);
  if(bytes.byteLength>MAX_SVG_BYTES)throw new Error("SVG source is larger than the 1 MB browser limit.");
  if(!/<svg(?:\s|>)/i.test(source)||!/<\/svg\s*>/i.test(source))throw new Error("Enter a complete SVG document with opening and closing <svg> tags.");
  return svg;
}

export function encodeSvgBase64(svg:string){
  const source=assertSvgMarkup(svg),bytes=new TextEncoder().encode(source);
  let binary="";
  for(let index=0;index<bytes.length;index+=0x8000)binary+=String.fromCharCode(...bytes.subarray(index,index+0x8000));
  return btoa(binary);
}

export function encodeSvgUtf8DataUri(svg:string){
  const compact=assertSvgMarkup(svg).trim().replace(/>\s+</g,"><").replace(/"/g,"'");
  const encoded=encodeURIComponent(compact)
    .replace(/%20/g," ")
    .replace(/%3A/gi,":")
    .replace(/%2F/gi,"/")
    .replace(/%3D/gi,"=")
    .replace(/%2C/gi,",")
    .replace(/%[0-9A-F]{2}/g,value=>value.toLowerCase());
  return `data:image/svg+xml,${encoded}`;
}

export function decodeSvgBase64(value:string){
  const payload=value.trim().replace(/^data:image\/svg\+xml(?:;charset=[^;,]+)?;base64,/i,"").replace(/\s+/g,"");
  if(!payload)throw new Error("Paste an SVG Base64 value or data URI first.");
  if(!/^[A-Za-z0-9+/]*={0,2}$/.test(payload))throw new Error("This value contains characters that are not valid Base64.");
  const binary=atob(payload);
  if(binary.length>MAX_SVG_BYTES)throw new Error("Decoded SVG is larger than the 1 MB browser limit.");
  const bytes=Uint8Array.from(binary,character=>character.charCodeAt(0));
  const svg=new TextDecoder("utf-8",{fatal:true}).decode(bytes);
  try{return assertSvgMarkup(svg);}catch{throw new Error("The decoded value does not contain a complete SVG document.");}
}

export function formatSvgMarkup(svg:string){
  const lines=svg.trim().replace(/>\s*</g,">\n<").split("\n"),formatted:string[]=[],indent="  ";
  let depth=0;
  for(const sourceLine of lines){
    const line=sourceLine.trim();
    if(!line)continue;
    const closing=/^<\//.test(line),selfClosing=/\/>$/.test(line)||/^<(?:\?|!)/.test(line),sameLinePair=/^<([\w:-]+)(?:\s[^>]*)?>[\s\S]*<\/\1>$/.test(line);
    if(closing)depth=Math.max(0,depth-1);
    formatted.push(`${indent.repeat(depth)}${line}`);
    if(!closing&&!selfClosing&&!sameLinePair&&/^<[^/][^>]*>$/.test(line))depth++;
  }
  return formatted.join("\n");
}
