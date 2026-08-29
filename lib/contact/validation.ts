export const CONTACT_LIMITS={email:254,message:3000,minimumMessage:10,body:12*1024} as const;

export type ContactInput={email:string;message:string;website?:string};
export type ValidContact={email:string;message:string;honeypot:boolean};

export function validateContactInput(value:unknown):ValidContact{
  if(!value||typeof value!=="object")throw new Error("Enter your email and a message.");
  const input=value as Partial<ContactInput>;
  const email=typeof input.email==="string"?input.email.trim().toLowerCase():"";
  const message=typeof input.message==="string"?input.message.trim():"";
  const website=typeof input.website==="string"?input.website.trim():"";
  if(email.length>CONTACT_LIMITS.email||/[\r\n]/.test(email)||!/^\S+@\S+\.\S+$/.test(email))throw new Error("Enter a valid email address.");
  if(message.length<CONTACT_LIMITS.minimumMessage)throw new Error(`Write at least ${CONTACT_LIMITS.minimumMessage} characters so I have enough context.`);
  if(message.length>CONTACT_LIMITS.message)throw new Error(`Keep your message under ${CONTACT_LIMITS.message.toLocaleString("en-GB")} characters.`);
  return {email,message,honeypot:Boolean(website)};
}
