"use client";

import { FormEvent,useRef,useState } from "react";
import { Mail,Send,X } from "lucide-react";

export function ContactChat(){
  const dialogRef=useRef<HTMLDialogElement>(null),formRef=useRef<HTMLFormElement>(null);
  const [open,setOpen]=useState(false),[pending,setPending]=useState(false),[status,setStatus]=useState<{tone:"success"|"error";message:string}|null>(null);
  function show(){setOpen(true);setStatus(null);dialogRef.current?.showModal();}
  function close(){dialogRef.current?.close();}
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();if(pending)return;setPending(true);setStatus(null);
    const form=new FormData(event.currentTarget),payload={email:String(form.get("email")??""),message:String(form.get("message")??""),website:String(form.get("website")??"")};
    try{const response=await fetch("/api/contact",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)}),result=await response.json() as {ok?:boolean;message?:string};if(!response.ok||!result.ok)throw new Error(result.message||"The message could not be sent.");setStatus({tone:"success",message:result.message||"Message sent."});formRef.current?.reset();}
    catch(error){setStatus({tone:"error",message:error instanceof Error?error.message:"The message could not be sent."});}
    finally{setPending(false);}
  }
  return <div className="contact-chat" data-open={open||undefined}>
    <button type="button" className="contact-chat-trigger" aria-haspopup="dialog" aria-expanded={open} onClick={show}><Mail aria-hidden="true" /><span>Message me</span></button>
    <dialog ref={dialogRef} className="contact-chat-dialog" aria-labelledby="contact-chat-title" onClose={()=>setOpen(false)}>
      <header><div><p>Direct to my inbox</p><h2 id="contact-chat-title">Start a conversation.</h2></div><button type="button" aria-label="Close message form" onClick={close}><X aria-hidden="true" /></button></header>
      <div className="contact-chat-bubble"><span aria-hidden="true">PC</span><p>Hi. Share a little about what you’re building, and I’ll reply directly to your email.</p></div>
      <form ref={formRef} onSubmit={submit}>
        <label htmlFor="contact-chat-email">Your email<input id="contact-chat-email" name="email" type="email" inputMode="email" autoComplete="email" maxLength={254} required /></label>
        <label htmlFor="contact-chat-message">Your message<textarea id="contact-chat-message" name="message" minLength={10} maxLength={3000} rows={6} required /></label>
        <label className="contact-chat-honeypot" aria-hidden="true">Website<input name="website" type="text" tabIndex={-1} autoComplete="off" /></label>
        {status&&<p className={`contact-chat-status is-${status.tone}`} role="status">{status.message}</p>}
        <button type="submit" disabled={pending}>{pending?"Sending…":"Send message"}<Send aria-hidden="true" /></button>
        <small>Sent securely by email. No account or conversation history.</small>
      </form>
    </dialog>
  </div>;
}
