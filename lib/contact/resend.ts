import "server-only";
import { Resend } from "resend";
import type { ContactTopic } from "@/lib/contact/types";
import { SITE_URL } from "@/lib/site-config";
import { ContactDeliveryFailure,type ContactConfigurationReason,type ProviderStatusCategory } from "@/lib/contact/diagnostics";

type SendContactEmail={email:string;message:string;topic:ContactTopic;requestId:string};
type ResendEmailClient={send:Resend["emails"]["send"]};
const TOPIC_LABELS:Record<ContactTopic,string>={website:"Website project",job:"Job opportunity",collaboration:"Collaboration",other:"General"};

let resend:Resend|undefined;

function configurationFailure(reason:ContactConfigurationReason):never{throw new ContactDeliveryFailure("configuration","not-applicable",{reason});}
function required(name:string,missingReason:ContactConfigurationReason,invalidReason:ContactConfigurationReason){const raw=process.env[name];if(!raw?.trim())configurationFailure(missingReason);const value=raw.trim();if(/[\r\n]/.test(value))configurationFailure(invalidReason);return value;}
function configuredEmail(name:"CONTACT_FROM_EMAIL"|"CONTACT_TO_EMAIL"){const missingReason=`missing_${name}` as ContactConfigurationReason,invalidReason=`invalid_${name}` as ContactConfigurationReason,value=required(name,missingReason,invalidReason);if(!/^\S+@\S+\.\S+$/.test(value)||/[<>]/.test(value))configurationFailure(invalidReason);return value;}
function escapeHtml(value:string){return value.replace(/[&<>"']/g,character=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[character]!);}
function resendClient(){const apiKey=required("RESEND_API_KEY","missing_RESEND_API_KEY","invalid_RESEND_API_KEY");if(!/^re_[A-Za-z0-9_-]+$/.test(apiKey))configurationFailure("invalid_RESEND_API_KEY");return resend??=new Resend(apiKey);}
function statusCategory(error:unknown):ProviderStatusCategory{if(!error||typeof error!=="object"||!("statusCode" in error)||typeof error.statusCode!=="number")return "unknown";return error.statusCode>=500?"server-error":error.statusCode>=400?"client-error":"unknown";}
function providerFailure(error:unknown){const statusCode=error&&typeof error==="object"&&"statusCode" in error&&typeof error.statusCode==="number"?error.statusCode:undefined;const providerErrorName=error&&typeof error==="object"&&"name" in error&&typeof error.name==="string"?error.name:undefined;return new ContactDeliveryFailure("provider",statusCategory(error),{providerStatusCode:statusCode,providerErrorName});}

export function contactDeliveryIsEnabled(){
  const mode=process.env.CONTACT_DELIVERY_MODE?.trim().toLowerCase();
  if(mode==="live")return true;
  if(mode==="disabled"||(!mode&&process.env.NODE_ENV!=="production"))return false;
  configurationFailure(mode?"invalid_CONTACT_DELIVERY_MODE":"missing_CONTACT_DELIVERY_MODE");
}

export async function sendContactEmail({email,message,topic,requestId}:SendContactEmail,emailClient:ResendEmailClient=resendClient().emails){
  const fromEmail=configuredEmail("CONTACT_FROM_EMAIL"),configuredName=process.env.CONTACT_FROM_NAME?.trim(),to=configuredEmail("CONTACT_TO_EMAIL");
  if(configuredName&&/[\r\n<>]/.test(configuredName))configurationFailure("invalid_CONTACT_FROM_NAME");
  const from=`${configuredName||"Pujan Portfolio"} <${fromEmail}>`;
  const topicLabel=TOPIC_LABELS[topic],subject=`Portfolio message — ${topicLabel}`,submitted=new Date().toISOString();
  const text=`NEW PORTFOLIO MESSAGE\n\nEmail\n${email}\n\nTopic\n${topicLabel}\n\nMessage\n${message}\n\n────────────────────\n\nSent from:\n${SITE_URL}\n\nSubmitted:\n${submitted}`;
  const html=`<h1>New portfolio message</h1><p><strong>Email</strong><br>${escapeHtml(email)}</p><p><strong>Topic</strong><br>${escapeHtml(topicLabel)}</p><p><strong>Message</strong><br>${escapeHtml(message).replace(/\r\n?|\n/g,"<br>")}</p><hr><p><strong>Sent from:</strong><br>${escapeHtml(SITE_URL)}</p><p><strong>Submitted:</strong><br>${escapeHtml(submitted)}</p>`;
  const {error}=await emailClient.send({from,to:[to],replyTo:email,subject,text,html},{idempotencyKey:`portfolio-contact/${requestId}`});
  if(error)throw providerFailure(error);
}
