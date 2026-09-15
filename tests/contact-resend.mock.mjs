import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import ts from "typescript";

const source=readFileSync("lib/contact/resend.ts","utf8");
const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;
let sdkConstructed=false;
class ForbiddenLiveResend{constructor(){sdkConstructed=true;throw new Error("The live Resend SDK must not be constructed in this test.");}}
const module={exports:{}};
const mockRequire=specifier=>{
  if(specifier==="server-only")return {};
  if(specifier==="resend")return {Resend:ForbiddenLiveResend};
  if(specifier==="@/lib/site-config")return {SITE_URL:"https://portfolio.test"};
  if(specifier==="@/lib/contact/diagnostics")return {ContactDeliveryFailure:class ContactDeliveryFailure extends Error{constructor(category,providerStatusCategory,options={}){super("Contact delivery failed.");this.category=category;this.providerStatusCategory=providerStatusCategory;Object.assign(this,options);}}};
  throw new Error(`Unexpected dependency: ${specifier}`);
};
new Function("require","module","exports",compiled)(mockRequire,module,module.exports);
const {contactDeliveryIsEnabled,sendContactEmail}=module.exports;

const environmentNames=["NODE_ENV","CONTACT_DELIVERY_MODE","RESEND_API_KEY","CONTACT_FROM_EMAIL","CONTACT_FROM_NAME","CONTACT_TO_EMAIL"];
const previous=Object.fromEntries(environmentNames.map(name=>[name,process.env[name]]));
try{
  process.env.NODE_ENV="test";
  process.env.CONTACT_FROM_NAME="machine-specific value that must not leak into assertions";
  delete process.env.CONTACT_DELIVERY_MODE;
  assert.equal(contactDeliveryIsEnabled(),false);
  process.env.CONTACT_DELIVERY_MODE="disabled";
  assert.equal(contactDeliveryIsEnabled(),false);
  process.env.CONTACT_DELIVERY_MODE="live";
  assert.equal(contactDeliveryIsEnabled(),true);
  process.env.RESEND_API_KEY="not-used-by-the-mock";
  process.env.CONTACT_FROM_EMAIL="contact@portfolio.test";
  process.env.CONTACT_TO_EMAIL="owner@example.test";
  delete process.env.CONTACT_DELIVERY_MODE;
  assert.equal(contactDeliveryIsEnabled(),false,"missing delivery mode is disabled outside production");
  process.env.CONTACT_DELIVERY_MODE="live";
  delete process.env.RESEND_API_KEY;
  await assert.rejects(()=>sendContactEmail({email:"visitor@example.test",message:"Hello",topic:"website",requestId:"423e4567-e89b-42d3-a456-426614174000"}),error=>error.category==="configuration"&&error.reason==="missing_RESEND_API_KEY","missing API key is configuration failure");
  process.env.RESEND_API_KEY="not-used-by-the-mock";
  process.env.RESEND_API_KEY="invalid key";
  await assert.rejects(()=>sendContactEmail({email:"visitor@example.test",message:"Hello",topic:"website",requestId:"423e4567-e89b-42d3-a456-426614174001"}),error=>error.category==="configuration"&&error.reason==="invalid_RESEND_API_KEY","invalid API key is configuration failure");
  process.env.RESEND_API_KEY="not-used-by-the-mock";
  delete process.env.CONTACT_FROM_EMAIL;
  await assert.rejects(()=>sendContactEmail({email:"visitor@example.test",message:"Hello",topic:"website",requestId:"523e4567-e89b-42d3-a456-426614174000"}, {send:async()=>({error:null})}),error=>error.category==="configuration"&&error.reason==="missing_CONTACT_FROM_EMAIL","missing from address is configuration failure");
  process.env.CONTACT_FROM_EMAIL="malformed-address";
  await assert.rejects(()=>sendContactEmail({email:"visitor@example.test",message:"Hello",topic:"website",requestId:"623e4567-e89b-42d3-a456-426614174000"}, {send:async()=>({error:null})}),error=>error.category==="configuration"&&error.reason==="invalid_CONTACT_FROM_EMAIL","malformed from address is configuration failure");
  process.env.CONTACT_FROM_EMAIL="Pujan Chapagain <contact@portfolio.test>";
  await assert.rejects(()=>sendContactEmail({email:"visitor@example.test",message:"Hello",topic:"website",requestId:"623e4567-e89b-42d3-a456-426614174001"}, {send:async()=>({error:null})}),error=>error.category==="configuration"&&error.reason==="invalid_CONTACT_FROM_EMAIL","display name must not be included in sender email variable");
  process.env.CONTACT_FROM_EMAIL="contact@portfolio.test";
  delete process.env.CONTACT_TO_EMAIL;
  await assert.rejects(()=>sendContactEmail({email:"visitor@example.test",message:"Hello",topic:"website",requestId:"723e4567-e89b-42d3-a456-426614174000"}, {send:async()=>({error:null})}),error=>error.category==="configuration"&&error.reason==="missing_CONTACT_TO_EMAIL","missing recipient is configuration failure");
  process.env.CONTACT_TO_EMAIL="malformed-recipient";
  await assert.rejects(()=>sendContactEmail({email:"visitor@example.test",message:"Hello",topic:"website",requestId:"723e4567-e89b-42d3-a456-426614174001"}, {send:async()=>({error:null})}),error=>error.category==="configuration"&&error.reason==="invalid_CONTACT_TO_EMAIL","malformed recipient is configuration failure");
  process.env.CONTACT_TO_EMAIL="owner@example.test";
  process.env.CONTACT_FROM_NAME="Pujan Chapagain\nBcc: attacker@example.test";
  await assert.rejects(()=>sendContactEmail({email:"visitor@example.test",message:"Hello",topic:"website",requestId:"723e4567-e89b-42d3-a456-426614174001"}, {send:async()=>({error:null})}),error=>error.category==="configuration"&&error.reason==="invalid_CONTACT_FROM_NAME","sender display name rejects header injection");
  delete process.env.CONTACT_FROM_NAME;
  let delivery,sendCount=0;
  const mockEmailClient={send:async(message,options)=>{sendCount++;delivery={message,options};return {data:{id:"mock-only"},error:null};}};
  await sendContactEmail({email:"visitor@example.test",message:"A mocked delivery only.",topic:"website",requestId:"123e4567-e89b-42d3-a456-426614174000"},mockEmailClient);
  assert.equal(sdkConstructed,false);
  assert.equal(sendCount,1,"one accepted enquiry creates exactly one send");
  assert.deepEqual(delivery.message.to,["owner@example.test"]);
  assert.equal(delivery.message.from,"Pujan Portfolio <contact@portfolio.test>");
  assert.equal(delivery.message.replyTo,"visitor@example.test");
  assert.equal(delivery.message.to.includes("visitor@example.test"),false,"visitor is not an automatic-email recipient");
  assert.equal(delivery.message.from,"Pujan Portfolio <contact@portfolio.test>","fallback sender name is deterministic");
  assert.equal(delivery.options.idempotencyKey,"portfolio-contact/123e4567-e89b-42d3-a456-426614174000");
  process.env.CONTACT_FROM_NAME="Pujan Chapagain";
  await sendContactEmail({email:"visitor@example.test",message:"A named mocked delivery.",topic:"website",requestId:"923e4567-e89b-42d3-a456-426614174000"},mockEmailClient);
  assert.equal(delivery.message.from,"Pujan Chapagain <contact@portfolio.test>","configured sender name is used exactly");
  for(const [statusCode,label] of [[401,"Resend 401"],[403,"Resend 403"],[429,"Resend 429"],[500,"Resend 500"],[503,"Resend 503"]]){
    await assert.rejects(()=>sendContactEmail({email:"visitor@example.test",message:"Hello",topic:"website",requestId:`823e4567-e89b-42d3-a456-426614174${String(statusCode).slice(-2)}`},{send:async()=>({error:{statusCode,name:"validation_error"}})}),error=>error.category==="provider"&&error.providerStatusCode===statusCode&&error.providerErrorName==="validation_error",label);
  }
  await assert.rejects(()=>sendContactEmail({email:"visitor@example.test",message:"Hello",topic:"website",requestId:"923e4567-e89b-42d3-a456-426614174001"},{send:async()=>{throw new Error("network failure");}}),error=>error.message==="network failure","SDK/network exception remains an unexpected throw for route diagnostics");
  const hostile='<script>alert("email")</script><img src=x onerror=alert(1)>& goodbye';
  await sendContactEmail({email:"visitor@example.test",message:hostile,topic:"other",requestId:"223e4567-e89b-42d3-a456-426614174000"},mockEmailClient);
  assert.equal(sendCount,3,"each separate enquiry still creates only one send");
  assert.equal(delivery.message.text.includes(hostile),true,"plain-text email preserves readable visitor text");
  assert.equal(delivery.message.html.includes("<script>"),false,"script markup is not emitted as HTML");
  assert.equal(delivery.message.html.includes("<img"),false,"visitor image markup is not emitted as HTML");
  assert.match(delivery.message.html,/&lt;script&gt;alert\(&quot;email&quot;\)&lt;\/script&gt;/);
  assert.match(delivery.message.html,/&lt;img src=x onerror=alert\(1\)&gt;&amp; goodbye/);
  const linkedMessage="Project notes: https://untrusted.example.test/private-path?token=visitor-text";
  await sendContactEmail({email:"visitor@example.test",message:linkedMessage,topic:"collaboration",requestId:"323e4567-e89b-42d3-a456-426614174000"},mockEmailClient);
  assert.equal(sendCount,4,"a link remains part of one ordinary enquiry delivery");
  assert.equal(delivery.message.text.includes(linkedMessage),true);
  assert.equal(delivery.message.html.includes(linkedMessage),true);
  assert.equal(delivery.message.html.includes("<a"),false,"the application creates no link or preview markup");
  process.stdout.write("✓ contact delivery uses a mocked Resend client in tests\n");
}finally{
  for(const [name,value] of Object.entries(previous)){
    if(value===undefined)delete process.env[name];else process.env[name]=value;
  }
}
