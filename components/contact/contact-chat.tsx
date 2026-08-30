"use client";

import { FormEvent,useCallback,useEffect,useRef,useState } from "react";
import { Mail,Send,X } from "lucide-react";
import dynamic from "next/dynamic";
import { trackProductEvent } from "@/lib/analytics/product-events";
import type { ContactRequest,ContactResponse,ContactTopic } from "@/lib/contact/types";
import { useMagneticControl } from "@/components/interactions/use-magnetic-control";

const TurnstileWidget=dynamic(()=>import("@/components/contact/turnstile-widget").then(module=>module.TurnstileWidget));
type SubmissionState="idle"|"validating"|"sending"|"success"|"error";
const temporaryError="I couldn't send that message right now.\n\nYour message is still here.\nPlease try again.";
const successMessage="Message sent.\n\nIt went directly to my inbox.\nI’ll reply to your email.";
const DRAFT_KEY="pujan-contact-draft";
const draftTopics=new Set(["website","job","collaboration","other"]);
const topicPlaceholders:Record<ContactTopic,string>={website:"Tell me briefly what you're building...",job:"Tell me about the role...",collaboration:"Share the collaboration idea...",other:"What would you like to discuss?"};

export function ContactForm({turnstileSiteKey,idPrefix="contact-form",startedAt}:{turnstileSiteKey:string|null;idPrefix?:string;startedAt?:number}){
  const formRef=useRef<HTMLFormElement>(null),requestIdRef=useRef(""),inFlightRef=useRef(false),contactStartedRef=useRef(false),sessionStartedAtRef=useRef(0);
  const [submissionState,setSubmissionState]=useState<SubmissionState>("idle"),[statusMessage,setStatusMessage]=useState(""),[selectedTopic,setSelectedTopic]=useState<ContactTopic>("website"),[turnstileToken,setTurnstileToken]=useState(""),[turnstileResetKey,setTurnstileResetKey]=useState(0);
  const receiveTurnstileToken=useCallback((token:string)=>setTurnstileToken(token),[]),busy=submissionState==="validating"||submissionState==="sending";
  const sendMagnet=useMagneticControl<HTMLButtonElement>();
  useEffect(()=>{sessionStartedAtRef.current=startedAt??performance.now();try{const raw=sessionStorage.getItem(DRAFT_KEY);if(!raw)return;const draft=JSON.parse(raw) as {email?:unknown;message?:unknown;topic?:unknown},form=formRef.current;if(!form)return;const email=typeof draft.email==="string"?draft.email.slice(0,254):"",message=typeof draft.message==="string"?draft.message.slice(0,3000):"",topic=typeof draft.topic==="string"&&draftTopics.has(draft.topic)?draft.topic as ContactTopic:"website",emailField=form.elements.namedItem("email"),messageField=form.elements.namedItem("message");if(emailField instanceof HTMLInputElement)emailField.value=email;if(messageField instanceof HTMLTextAreaElement)messageField.value=message;setSelectedTopic(topic);}catch{sessionStorage.removeItem(DRAFT_KEY);}},[startedAt]);
  function sendAnother(){setSubmissionState("idle");setStatusMessage("");requestIdRef.current="";sessionStartedAtRef.current=performance.now();formRef.current?.querySelector<HTMLInputElement>(`#${idPrefix}-email`)?.focus();}
  function updateDraft(form:HTMLFormElement){if(!contactStartedRef.current){contactStartedRef.current=true;trackProductEvent("contact_started",{});}if(!inFlightRef.current){requestIdRef.current="";setSubmissionState("idle");setStatusMessage("");}const data=new FormData(form),email=String(data.get("email")??""),message=String(data.get("message")??""),topic=String(data.get("topic")??"website");try{if(!email&&!message&&topic==="website")sessionStorage.removeItem(DRAFT_KEY);else sessionStorage.setItem(DRAFT_KEY,JSON.stringify({email,message,topic}));}catch{}}
  async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();if(inFlightRef.current)return;inFlightRef.current=true;setSubmissionState("validating");setStatusMessage("");const formElement=event.currentTarget;if(!formElement.checkValidity()){inFlightRef.current=false;setSubmissionState("idle");formElement.reportValidity();return;}const form=new FormData(formElement),requestId=requestIdRef.current||crypto.randomUUID();requestIdRef.current=requestId;const completionTimeMs=Math.max(0,Math.round(performance.now()-sessionStartedAtRef.current));const payload:ContactRequest={email:String(form.get("email")??""),message:String(form.get("message")??""),topic:selectedTopic,website:String(form.get("website")??""),turnstileToken,requestId,completionTimeMs};trackProductEvent("contact_submitted",{});setSubmissionState("sending");try{const response=await fetch("/api/contact",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)}),result=await response.json() as ContactResponse;if(!response.ok||!result.ok){trackProductEvent("contact_error",{});setSubmissionState("error");setStatusMessage(result.ok?temporaryError:result.message);return;}trackProductEvent("contact_success",{});setSubmissionState("success");setStatusMessage(successMessage);formRef.current?.reset();setSelectedTopic("website");requestIdRef.current="";try{sessionStorage.removeItem(DRAFT_KEY);}catch{}}catch{trackProductEvent("contact_error",{});setSubmissionState("error");setStatusMessage(temporaryError);}finally{inFlightRef.current=false;if(turnstileSiteKey)setTurnstileResetKey(value=>value+1);}}
  const emailId=`${idPrefix}-email`,topicId=`${idPrefix}-topic`,messageId=`${idPrefix}-message`;
  return <form ref={formRef} className="contact-form" data-state={submissionState} aria-busy={busy} onSubmit={submit} onInput={event=>updateDraft(event.currentTarget)}>
    <label htmlFor={emailId}>Your email<input id={emailId} name="email" type="email" inputMode="email" autoComplete="email" maxLength={254} required /></label>
    <label htmlFor={topicId}>Topic<select id={topicId} name="topic" value={selectedTopic} onChange={event=>setSelectedTopic(event.currentTarget.value as ContactTopic)}><option value="website">Website project</option><option value="job">Job opportunity</option><option value="collaboration">Collaboration</option><option value="other">Other</option></select></label>
    <label htmlFor={messageId}>Your message<textarea id={messageId} name="message" placeholder={topicPlaceholders[selectedTopic]} minLength={2} maxLength={3000} rows={6} required /><small>No attachments. Include a public link in your message if you need to share a file.</small></label>
    <label className="contact-chat-honeypot" aria-hidden="true">Website<input name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" /></label>
    {turnstileSiteKey&&<TurnstileWidget siteKey={turnstileSiteKey} onToken={receiveTurnstileToken} resetKey={turnstileResetKey} />}
    <p className={`contact-chat-status is-${submissionState}`} role={submissionState==="error"?"alert":"status"} aria-live={submissionState==="error"?"assertive":"polite"} aria-atomic="true">{statusMessage}</p>
    {submissionState==="success"?<button className="button button-secondary" type="button" onClick={sendAnother}>Send another message<Send aria-hidden="true" /></button>:<button className="button button-primary" type="submit" disabled={busy} {...sendMagnet}>{busy?"Sending…":"Send message"}<Send aria-hidden="true" /></button>}
    <small>Your email and message are used only to reply to your enquiry. No account or public chat history. <a href="/privacy">Privacy</a></small>
  </form>;
}

export function ContactChat({turnstileSiteKey}:{turnstileSiteKey:string|null}){
  const launcherRef=useRef<HTMLButtonElement>(null),dialogRef=useRef<HTMLDialogElement>(null);
  const [mounted,setMounted]=useState(false),[open,setOpen]=useState(false),[startedAt,setStartedAt]=useState(0);
  useEffect(()=>{if(!mounted||!open||dialogRef.current?.open)return;dialogRef.current?.showModal();requestAnimationFrame(()=>dialogRef.current?.querySelector<HTMLInputElement>("#contact-chat-email")?.focus());},[mounted,open]);
  function show(){trackProductEvent("contact_opened",{});setStartedAt(performance.now());setMounted(true);setOpen(true);}
  function close(){dialogRef.current?.close();}
  function handleClose(){setOpen(false);launcherRef.current?.focus();}
  return <div className="contact-chat" data-open={open||undefined}><button ref={launcherRef} type="button" className="contact-chat-trigger" aria-label="Message Pujan" aria-haspopup="dialog" aria-expanded={open} onClick={show}><Mail aria-hidden="true" /><span>Message Pujan</span></button>{mounted&&<dialog ref={dialogRef} className="contact-chat-dialog" aria-labelledby="contact-chat-title" onClose={handleClose}><header><div><p>Email Pujan directly</p><h2 id="contact-chat-title">Send a message.</h2></div><button className="button button-icon" type="button" aria-label="Close message form" onClick={close}><X aria-hidden="true" /></button></header><div className="contact-chat-intro"><p>Your note goes to Pujan’s inbox for project enquiries, opportunities and thoughtful collaborations. Replies go to the email you provide.</p></div><ContactForm turnstileSiteKey={turnstileSiteKey} idPrefix="contact-chat" startedAt={startedAt} /></dialog>}</div>;
}
