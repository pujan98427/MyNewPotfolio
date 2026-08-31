"use client";

import { useEffect,useRef } from "react";
import { X } from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";
import styles from "./contact-chat.module.css";

export function ContactPanel({turnstileSiteKey,startedAt,onClosed}:{turnstileSiteKey:string|null;startedAt:number;onClosed:()=>void}){
  const dialogRef=useRef<HTMLDialogElement>(null);
  useEffect(()=>{const dialog=dialogRef.current;if(!dialog||dialog.open)return;dialog.showModal();const frame=requestAnimationFrame(()=>dialog.querySelector<HTMLInputElement>("#contact-chat-email")?.focus());return()=>cancelAnimationFrame(frame);},[]);
  return <dialog ref={dialogRef} className={styles.dialog} aria-labelledby="contact-chat-title" onClose={onClosed}>
    <header><div><p>Email Pujan directly</p><h2 id="contact-chat-title">Send a message.</h2></div><button className="button button-icon" type="button" aria-label="Close message form" onClick={()=>dialogRef.current?.close()}><X aria-hidden="true" /></button></header>
    <div className={styles.intro}><p>Your note goes to Pujan’s inbox for project enquiries, opportunities and thoughtful collaborations. Replies go to the email you provide.</p></div>
    <ContactForm turnstileSiteKey={turnstileSiteKey} idPrefix="contact-chat" startedAt={startedAt} />
  </dialog>;
}
