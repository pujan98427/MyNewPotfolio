type SendContactEmail={email:string;message:string};

function required(name:string){const value=process.env[name]?.trim();if(!value)throw new Error("Contact email service is not configured.");return value;}
function escapeHtml(value:string){return value.replace(/[&<>"']/g,character=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[character]!);}

export async function sendContactEmail({email,message}:SendContactEmail){
  const apiKey=required("RESEND_API_KEY"),from=required("RESEND_FROM_EMAIL"),to=required("CONTACT_TO_EMAIL");
  const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{authorization:`Bearer ${apiKey}`,"content-type":"application/json","idempotency-key":crypto.randomUUID()},body:JSON.stringify({from,to:[to],reply_to:email,subject:"New portfolio message",text:`Reply to: ${email}\n\n${message}`,html:`<h1>New portfolio message</h1><p><strong>Reply to:</strong> ${escapeHtml(email)}</p><p>${escapeHtml(message).replace(/\n/g,"<br>")}</p>`}),signal:AbortSignal.timeout(8_000),cache:"no-store"});
  if(!response.ok)throw new Error("Email delivery failed.");
}
