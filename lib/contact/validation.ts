import type { ContactRequest,ContactTopic } from "@/lib/contact/types";

export const CONTACT_LIMITS={email:254,message:3000,minimumMessage:2,topic:20,turnstileToken:2048,body:12*1024} as const;

export const CONTACT_TOPICS=["website","job","collaboration","other"] as const satisfies readonly ContactTopic[];
export type ValidContact={email:string;message:string;topic:ContactTopic;turnstileToken:string;requestId:string;honeypot:boolean;suspiciouslyFast:boolean};
const ACCEPTED_FIELDS=new Set(["email","message","topic","website","turnstileToken","requestId","completionTimeMs"]);

export function validateContactInput(value:unknown):ValidContact{
  if(!value||typeof value!=="object"||Array.isArray(value))throw new Error("Enter your email and a message.");
  if(Object.keys(value).some(field=>!ACCEPTED_FIELDS.has(field)))throw new Error("The message request contains unsupported fields.");
  const input=value as Partial<ContactRequest>;
  const email=typeof input.email==="string"?input.email.trim():"";
  const message=typeof input.message==="string"?input.message.trim():"";
  const topic=typeof input.topic==="string"?input.topic.trim():"website";
  const website=typeof input.website==="string"?input.website.trim():"";
  const turnstileToken=typeof input.turnstileToken==="string"?input.turnstileToken.trim():"";
  const requestId=typeof input.requestId==="string"?input.requestId.trim():"";
  const completionTimeMs=input.completionTimeMs;
  if(email.length>CONTACT_LIMITS.email||/[\r\n]/.test(email)||!/^\S+@\S+\.\S+$/.test(email))throw new Error("Enter a valid email address.");
  if(!message)throw new Error("Write a message before sending.");
  if(message.length<CONTACT_LIMITS.minimumMessage)throw new Error(`Write at least ${CONTACT_LIMITS.minimumMessage} characters so I have enough context.`);
  if(message.length>CONTACT_LIMITS.message)throw new Error(`Keep your message under ${CONTACT_LIMITS.message.toLocaleString("en-GB")} characters.`);
  if(topic.length>CONTACT_LIMITS.topic||!CONTACT_TOPICS.includes(topic as ContactTopic))throw new Error("Choose a valid message topic.");
  if(turnstileToken.length>CONTACT_LIMITS.turnstileToken)throw new Error("The security check could not be validated.");
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId))throw new Error("The message request could not be validated.");
  if(typeof completionTimeMs!=="number"||!Number.isSafeInteger(completionTimeMs)||completionTimeMs<0||completionTimeMs>24*60*60*1000)throw new Error("The message session could not be validated.");
  return {email,message,topic:topic as ContactTopic,turnstileToken,requestId,honeypot:Boolean(website),suspiciouslyFast:completionTimeMs<150};
}
