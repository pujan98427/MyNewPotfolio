"use client";

import { FormEvent,useCallback,useEffect,useRef,useState } from "react";
import { Mail,Send,X } from "lucide-react";
import { TurnstileWidget } from "@/components/contact/turnstile-widget";

type SubmissionState="idle"|"validating"|"sending"|"success"|"error";
const temporaryError="I couldn't send that message right now.\n\nYour message is still here.\nPlease try again.";
const successMessage="Message sent.\n\nIt went directly to my inbox.\nI’ll reply to your email.";
const DRAFT_KEY="pujan-contact-draft";
const draftTopics=new Set(["website","job","collaboration","other"]);

export function ContactChat({turnstileSiteKey}:{turnstileSiteKey:string|null}){
  const dialogRef=useRef<HTMLDialogElement>(null),formRef=useRef<HTMLFormElement>(null),requestIdRef=useRef(""),inFlightRef=useRef(false),sessionStartedAtRef=useRef(0);
  const [open,setOpen]=useState(false),[submissionState,setSubmissionState]=useState<SubmissionState>("idle"),[statusMessage,setStatusMessage]=useState(""),[turnstileToken,setTurnstileToken]=useState(""),[turnstileResetKey,setTurnstileResetKey]=useState(0);
  const receiveTurnstileToken=useCallback((token:string)=>setTurnstileToken(token),[]);
  const busy=submissionState==="validating"||submissionState==="sending";
  useEffect(()=>{try{const raw=sessionStorage.getItem(DRAFT_KEY);if(!raw)return;const draft=JSON.parse(raw) as {email?:unknown;message?:unknown;topic?:unknown},form=formRef.current;if(!form)return;const email=typeof draft.email==="string"?draft.email.slice(0,254):"",message=typeof draft.message==="string"?draft.message.slice(0,3000):"",topic=typeof draft.topic==="string"&&draftTopics.has(draft.topic)?draft.topic:"website",emailField=form.elements.namedItem("email"),messageField=form.elements.namedItem("message"),topicField=form.elements.namedItem("topic");if(emailField instanceof HTMLInputElement)emailField.value=email;if(messageField instanceof HTMLTextAreaElement)messageField.value=message;if(topicField instanceof HTMLSelectElement)topicField.value=topic;}catch{sessionStorage.removeItem(DRAFT_KEY);}},[]);
  function show(){sessionStartedAtRef.current=performance.now();setOpen(true);setSubmissionState("idle");setStatusMessage("");dialogRef.current?.showModal();}
  function close(){dialogRef.current?.close();}
  function sendAnother(){setSubmissionState("idle");setStatusMessage("");requestIdRef.current="";formRef.current?.querySelector<HTMLInputElement>("#contact-chat-email")?.focus();}
  function updateDraft(form:HTMLFormElement){if(!inFlightRef.current){requestIdRef.current="";setSubmissionState("idle");setStatusMessage("");}const data=new FormData(form),email=String(data.get("email")??""),message=String(data.get("message")??""),topic=String(data.get("topic")??"website");try{if(!email&&!message&&topic==="website")sessionStorage.removeItem(DRAFT_KEY);else sessionStorage.setItem(DRAFT_KEY,JSON.stringify({email,message,topic}));}catch{}}
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();if(inFlightRef.current)return;inFlightRef.current=true;setSubmissionState("validating");setStatusMessage("");
    const formElement=event.currentTarget;if(!formElement.checkValidity()){inFlightRef.current=false;setSubmissionState("idle");formElement.reportValidity();return;}
    const form=new FormData(formElement),requestId=requestIdRef.current||crypto.randomUUID();requestIdRef.current=requestId;
    const completionTimeMs=Math.max(0,Math.round(performance.now()-sessionStartedAtRef.current));
    const payload={email:String(form.get("email")??""),message:String(form.get("message")??""),topic:String(form.get("topic")??""),website:String(form.get("website")??""),turnstileToken:turnstileToken,requestId,completionTimeMs};
    setSubmissionState("sending");
    try{const response=await fetch("/api/contact",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)}),result=await response.json() as {ok?:boolean;code?:string;message?:string};if(!response.ok||!result.ok){setSubmissionState("error");setStatusMessage(result.message||temporaryError);return;}setSubmissionState("success");setStatusMessage(successMessage);formRef.current?.reset();requestIdRef.current="";try{sessionStorage.removeItem(DRAFT_KEY);}catch{}}
    catch{setSubmissionState("error");setStatusMessage(temporaryError);}
    finally{inFlightRef.current=false;if(turnstileSiteKey)setTurnstileResetKey(value=>value+1);}
  }
  return <div className="contact-chat" data-open={open||undefined} data-state={submissionState}>
    <button type="button" className="contact-chat-trigger" aria-label="Open contact message form" aria-haspopup="dialog" aria-expanded={open} onClick={show}><Mail aria-hidden="true" /><span>Message me</span></button>
    <dialog ref={dialogRef} className="contact-chat-dialog" aria-labelledby="contact-chat-title" onClose={()=>setOpen(false)}>
      <header><div><p>Direct to my inbox</p><h2 id="contact-chat-title">Start a conversation.</h2></div><button type="button" aria-label="Close message form" onClick={close}><X aria-hidden="true" /></button></header>
      <div className="contact-chat-bubble"><span aria-hidden="true">PC</span><p>Hi. Share a little about what you’re building, and I’ll reply directly to your email.</p></div>
      <form ref={formRef} aria-busy={busy} onSubmit={submit} onInput={event=>updateDraft(event.currentTarget)}>
        <label htmlFor="contact-chat-email">Your email<input id="contact-chat-email" name="email" type="email" inputMode="email" autoComplete="email" maxLength={254} required /></label>
        <label htmlFor="contact-chat-topic">Topic<select id="contact-chat-topic" name="topic" defaultValue="website"><option value="website">Website project</option><option value="job">Job opportunity</option><option value="collaboration">Collaboration</option><option value="other">Other</option></select></label>
        <label htmlFor="contact-chat-message">Your message<textarea id="contact-chat-message" name="message" minLength={2} maxLength={3000} rows={6} required /></label>
        <label className="contact-chat-honeypot" aria-hidden="true">Website<input name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" /></label>
        {turnstileSiteKey&&open&&<TurnstileWidget siteKey={turnstileSiteKey} onToken={receiveTurnstileToken} resetKey={turnstileResetKey} />}
        {statusMessage&&<p className={`contact-chat-status is-${submissionState}`} role="status">{statusMessage}</p>}
        {submissionState==="success"?<button type="button" onClick={sendAnother}>Send another message<Send aria-hidden="true" /></button>:<button type="submit" disabled={busy}>{busy?"Sending…":"Send message"}<Send aria-hidden="true" /></button>}
        <small>Your email and message are used only to reply to your enquiry. No account or public chat history. <a href="/privacy">Privacy</a></small>
      </form>
    </dialog>
  </div>;
}
