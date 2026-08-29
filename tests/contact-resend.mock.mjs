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
  if(specifier==="@/lib/contact/diagnostics")return {ContactDeliveryFailure:class ContactDeliveryFailure extends Error{constructor(category,providerStatusCategory){super("Contact delivery failed.");this.category=category;this.providerStatusCategory=providerStatusCategory;}}};
  throw new Error(`Unexpected dependency: ${specifier}`);
};
new Function("require","module","exports",compiled)(mockRequire,module,module.exports);
const {contactDeliveryIsEnabled,sendContactEmail}=module.exports;

const previous={mode:process.env.CONTACT_DELIVERY_MODE,nodeEnv:process.env.NODE_ENV,apiKey:process.env.RESEND_API_KEY,to:process.env.CONTACT_TO_EMAIL,from:process.env.CONTACT_FROM_EMAIL};
try{
  process.env.NODE_ENV="test";
  delete process.env.CONTACT_DELIVERY_MODE;
  assert.equal(contactDeliveryIsEnabled(),false);
  process.env.CONTACT_DELIVERY_MODE="disabled";
  assert.equal(contactDeliveryIsEnabled(),false);
  process.env.CONTACT_DELIVERY_MODE="live";
  assert.equal(contactDeliveryIsEnabled(),true);
  process.env.RESEND_API_KEY="not-used-by-the-mock";
  process.env.CONTACT_FROM_EMAIL="contact@portfolio.test";
  process.env.CONTACT_TO_EMAIL="owner@example.test";
  let delivery,sendCount=0;
  const mockEmailClient={send:async(message,options)=>{sendCount++;delivery={message,options};return {data:{id:"mock-only"},error:null};}};
  await sendContactEmail({email:"visitor@example.test",message:"A mocked delivery only.",topic:"website",requestId:"123e4567-e89b-42d3-a456-426614174000"},mockEmailClient);
  assert.equal(sdkConstructed,false);
  assert.equal(sendCount,1,"one accepted enquiry creates exactly one send");
  assert.deepEqual(delivery.message.to,["owner@example.test"]);
  assert.equal(delivery.message.from,"Pujan Portfolio <contact@portfolio.test>");
  assert.equal(delivery.message.replyTo,"visitor@example.test");
  assert.equal(delivery.message.to.includes("visitor@example.test"),false,"visitor is not an automatic-email recipient");
  assert.equal(delivery.options.idempotencyKey,"portfolio-contact/123e4567-e89b-42d3-a456-426614174000");
  const hostile='<script>alert("email")</script><img src=x onerror=alert(1)>& goodbye';
  await sendContactEmail({email:"visitor@example.test",message:hostile,topic:"other",requestId:"223e4567-e89b-42d3-a456-426614174000"},mockEmailClient);
  assert.equal(sendCount,2,"each separate enquiry still creates only one send");
  assert.equal(delivery.message.text.includes(hostile),true,"plain-text email preserves readable visitor text");
  assert.equal(delivery.message.html.includes("<script>"),false,"script markup is not emitted as HTML");
  assert.equal(delivery.message.html.includes("<img"),false,"visitor image markup is not emitted as HTML");
  assert.match(delivery.message.html,/&lt;script&gt;alert\(&quot;email&quot;\)&lt;\/script&gt;/);
  assert.match(delivery.message.html,/&lt;img src=x onerror=alert\(1\)&gt;&amp; goodbye/);
  const linkedMessage="Project notes: https://untrusted.example.test/private-path?token=visitor-text";
  await sendContactEmail({email:"visitor@example.test",message:linkedMessage,topic:"collaboration",requestId:"323e4567-e89b-42d3-a456-426614174000"},mockEmailClient);
  assert.equal(sendCount,3,"a link remains part of one ordinary enquiry delivery");
  assert.equal(delivery.message.text.includes(linkedMessage),true);
  assert.equal(delivery.message.html.includes(linkedMessage),true);
  assert.equal(delivery.message.html.includes("<a"),false,"the application creates no link or preview markup");
  process.stdout.write("✓ contact delivery uses a mocked Resend client in tests\n");
}finally{
  for(const [name,value] of Object.entries({CONTACT_DELIVERY_MODE:previous.mode,NODE_ENV:previous.nodeEnv,RESEND_API_KEY:previous.apiKey,CONTACT_TO_EMAIL:previous.to,CONTACT_FROM_EMAIL:previous.from})){
    if(value===undefined)delete process.env[name];else process.env[name]=value;
  }
}
