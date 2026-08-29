import assert from "node:assert/strict";
import {createRequire} from "node:module";
import {readFileSync} from "node:fs";
import ts from "typescript";

const require=createRequire(import.meta.url),source=readFileSync("lib/contact/validation.ts","utf8");
const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText,module={exports:{}};
new Function("require","module","exports",compiled)(require,module,module.exports);
const {CONTACT_LIMITS,validateContactInput}=module.exports;
const base={email:"visitor@example.com",message:"Hello Pujan",topic:"website",website:"",turnstileToken:"",requestId:"123e4567-e89b-42d3-a456-426614174000",completionTimeMs:500};

assert.equal(validateContactInput(base).email,"visitor@example.com","valid email");
assert.throws(()=>validateContactInput({...base,email:"not-an-email"}),/valid email/,"invalid email");
assert.throws(()=>validateContactInput({...base,email:"visitor@example.com\r\nBcc: attacker@example.com"}),/valid email/,"email containing newline characters");
assert.throws(()=>validateContactInput({...base,email:""}),/valid email/,"empty email");
assert.throws(()=>validateContactInput({...base,email:`${"a".repeat(CONTACT_LIMITS.email)}@example.com`}),/valid email/,"very long email");
assert.equal(validateContactInput(base).message,"Hello Pujan","valid message");
assert.throws(()=>validateContactInput({...base,message:""}),/Write a message/,"empty message");
assert.throws(()=>validateContactInput({...base,message:"x".repeat(CONTACT_LIMITS.message+1)}),/under 3,000 characters/,"message above max length");
assert.equal(validateContactInput({...base,website:"company.example"}).honeypot,true,"honeypot filled");
assert.throws(()=>validateContactInput({...base,topic:"billing"}),/valid message topic/,"invalid topic");
assert.throws(()=>validateContactInput({...base,unexpected:"field"}),/unsupported fields/,"unexpected JSON properties");
for(const field of ["attachment","attachments","file","fileUrl"]){assert.throws(()=>validateContactInput({...base,[field]:"https://files.example.test/document.pdf"}),/unsupported fields/,`${field} is not accepted`);}
for(const malformed of [null,[],"request",42])assert.throws(()=>validateContactInput(malformed),undefined,"malformed request");
process.stdout.write("✓ contact validation accepts valid fields and rejects every requested invalid boundary\n");
