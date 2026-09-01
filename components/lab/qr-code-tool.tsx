"use client";

import {useState} from "react";
import styles from "./simple-tools.module.css";

export function QrCodeTool(){
  const [value,setValue]=useState("");
  const [size,setSize]=useState(512);
  const [dataUrl,setDataUrl]=useState("");
  const [svg,setSvg]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const generate=async()=>{const clean=value.trim();if(!clean){setError("Enter text or a link first.");return}if(clean.length>2000){setError("Keep the QR content below 2,000 characters.");return}setBusy(true);setError("");try{const QRCode=await import("qrcode");const options={errorCorrectionLevel:"M" as const,margin:2,width:size,color:{dark:"#151515",light:"#ffffff"}};setDataUrl(await QRCode.toDataURL(clean,options));setSvg(await QRCode.toString(clean,{...options,type:"svg"}));}catch{setError("The QR code could not be created in this browser.");}finally{setBusy(false)}};
  const download=(content:string,name:string)=>{const anchor=document.createElement("a");anchor.href=content;anchor.download=name;anchor.click()};
  const downloadSvg=()=>{const url=URL.createObjectURL(new Blob([svg],{type:"image/svg+xml"}));download(url,"qr-code.svg");setTimeout(()=>URL.revokeObjectURL(url),0)};
  return <div className={styles.workspace}><p className={styles.privacy}>Your text is converted locally. It is not sent to a server or saved.</p><div className={styles.grid}><section className={styles.panel}><h2>What should the code contain?</h2><div className={styles.field}><label htmlFor="qr-value">Text or URL</label><textarea id="qr-value" value={value} onChange={event=>setValue(event.target.value)} placeholder="https://example.com" maxLength={2000}/></div><details className={styles.advanced}><summary>More options</summary><div className={styles.field}><label htmlFor="qr-size">Image size</label><select id="qr-size" value={size} onChange={event=>setSize(Number(event.target.value))}><option value="256">256 px</option><option value="512">512 px</option><option value="1024">1024 px</option></select></div></details><div className={styles.actions}><button className={styles.button} onClick={generate} disabled={busy}>{busy?"Creating…":"Create QR code"}</button><button className={styles.button} data-quiet onClick={()=>{setValue("");setDataUrl("");setSvg("");setError("")}}>Clear</button></div><p className={styles.status} data-error={Boolean(error)} role="status">{error}</p></section><section className={styles.panel}><h2>QR code</h2>{dataUrl?<><div className={styles.preview}><img className={styles.qr} src={dataUrl} width={size} height={size} alt="Generated QR code"/></div><div className={styles.actions}><button className={styles.button} onClick={()=>download(dataUrl,"qr-code.png")}>Download PNG</button><button className={styles.button} data-quiet onClick={downloadSvg}>Download SVG</button></div><p>Test the downloaded code with your phone before printing or publishing it.</p></>:<p>Your QR code will appear here.</p>}</section></div></div>;
}
