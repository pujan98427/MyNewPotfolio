import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import ts from "typescript";

const source=readFileSync("app/api/contact/route.ts","utf8");
const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
const validContact={email:"visitor@example.com",message:"Hello Pujan",topic:"website",turnstileToken:"token",requestId:"123e4567-e89b-42d3-a456-426614174000",honeypot:false,suspiciouslyFast:false};

function loadRoute({validation=()=>validContact,turnstile=async()=>({ok:true,mode:"verified"}),send=async()=>{},deliveryEnabled=()=>true}={}){
  const module={exports:{}};
  const mocks={
    "@/lib/site-config":{SITE_URL:"https://portfolio.test"},
    "@/lib/contact/validation":{CONTACT_LIMITS:{body:12*1024},validateContactInput:validation},
    "@/lib/contact/rate-limit":{bestEffortContactRateLimit:()=>({allowed:true,retryAfter:0})},
    "@/lib/contact/resend":{contactDeliveryIsEnabled:deliveryEnabled,sendContactEmail:send},
    "@/lib/contact/diagnostics":{logContactFailure:()=>{}},
    "@/lib/contact/turnstile":{verifyTurnstileToken:turnstile},
    "@/lib/contact/request-origin":{browserRequestOriginIsAllowed:()=>true},
  };
  new Function("require","module","exports",compiled)(specifier=>{if(specifier in mocks)return mocks[specifier];throw new Error(`Unexpected dependency: ${specifier}`);},module,module.exports);
  return module.exports.POST;
}

function request(raw=JSON.stringify({email:"visitor@example.com",message:"Hello Pujan"}),headers={}){
  return {headers:new Headers({origin:"https://portfolio.test",host:"portfolio.test","content-type":"application/json","x-forwarded-for":"203.0.113.10",...headers}),nextUrl:new URL("https://portfolio.test/api/contact"),text:async()=>raw};
}

let sends=0;
let response=await loadRoute({send:async()=>{sends++;}})(request());
assert.equal(response.status,200,"successful send");
assert.deepEqual(await response.json(),{ok:true});
assert.equal(sends,1);

response=await loadRoute({send:async()=>{throw new Error("mock provider failure");}})(request());
assert.equal(response.status,502,"Resend failure");
assert.deepEqual(await response.json(),{ok:false,code:"SEND_FAILED",message:"Message could not be sent right now."});

response=await loadRoute({validation:()=>{throw new Error("invalid");}})(request());
assert.equal(response.status,400,"invalid input");
assert.equal((await response.json()).code,"VALIDATION_ERROR");

response=await loadRoute({turnstile:async()=>({ok:false,reason:"rejected"})})(request());
assert.equal(response.status,400,"Turnstile failure");
assert.equal((await response.json()).code,"SECURITY_CHECK_FAILED");

response=await loadRoute()(request("{not-json"));
assert.equal(response.status,400,"malformed request");
assert.equal((await response.json()).code,"INVALID_REQUEST");

response=await loadRoute()(request("{}",{"content-type":""}));
assert.equal(response.status,415,"missing content-type");
assert.equal((await response.json()).code,"UNSUPPORTED_MEDIA_TYPE");

response=await loadRoute()(request("{}",{"content-length":String(12*1024+1)}));
assert.equal(response.status,413,"extremely large declared payload");
assert.equal((await response.json()).code,"PAYLOAD_TOO_LARGE");

response=await loadRoute()(request("x".repeat(12*1024+1)));
assert.equal(response.status,413,"extremely large actual payload");
assert.equal((await response.json()).code,"PAYLOAD_TOO_LARGE");

sends=0;
response=await loadRoute({validation:()=>({...validContact,honeypot:true}),send:async()=>{sends++;}})(request());
assert.equal(response.status,200,"bot honeypot receives a non-revealing response");
assert.deepEqual(await response.json(),{ok:true});
assert.equal(sends,0,"bot honeypot never reaches Resend");

const delivered=new Set();
const idempotentSend=async contact=>{delivered.add(contact.requestId);};
const duplicateRoute=loadRoute({send:idempotentSend});
assert.equal((await duplicateRoute(request())).status,200);
assert.equal((await duplicateRoute(request())).status,200);
assert.equal(delivered.size,1,"duplicate request identifier maps to one mocked delivery");

process.stdout.write("✓ contact API safely handles delivery, malformed requests, payload limits, Turnstile and bot submissions with mocked delivery\n");
