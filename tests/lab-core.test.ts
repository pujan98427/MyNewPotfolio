import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PDFDocument} from "pdf-lib";
import {buildQrPayload,qrContrastRatio} from "../lib/lab/qr-core.ts";
import {parsePickerChoices,secureShuffle,unbiasedRandomIndex} from "../lib/lab/random-core.ts";

assert.equal(buildQrPayload({kind:"website",value:"example.com"}),"https://example.com");
assert.equal(buildQrPayload({kind:"social",value:"instagram.com/pujan"}),"https://instagram.com/pujan");
assert.equal(buildQrPayload({kind:"social",socialService:"instagram",value:"pujanchapagain7"}),"https://instagram.com/pujanchapagain7");
assert.equal(buildQrPayload({kind:"social",socialService:"linkedin",value:"https://linkedin.com/company/example"}),"https://linkedin.com/company/example");
assert.equal(buildQrPayload({kind:"wifi",wifiName:"Home;WiFi",wifiPassword:"p:a",wifiSecurity:"WPA",wifiHidden:true}),"WIFI:T:WPA;S:Home\\;WiFi;P:p\\:a;H:true;;");
assert.equal(buildQrPayload({kind:"email",recipient:"a@example.com",subject:"Hello world",message:"One & two"}),"mailto:a@example.com?subject=Hello%20world&body=One%20%26%20two");
assert.equal(buildQrPayload({kind:"text",value:" hello "}),"hello");
assert.equal(buildQrPayload({kind:"text",value:""}),"");
assert.ok(qrContrastRatio("#151515","#ffffff")>3);
assert.ok(qrContrastRatio("#eeeeee","#ffffff")<3);

assert.deepEqual(parsePickerChoices("A\nA\nB"),["A","A","B"]);
assert.equal(unbiasedRandomIndex(1,values=>{values[0]=0}),0);
assert.throws(()=>unbiasedRandomIndex(0),RangeError);
let calls=0;assert.equal(unbiasedRandomIndex(3,values=>{values[0]=calls++===0?0xffffffff:2}),2);
assert.deepEqual(secureShuffle(["a","b","c"],values=>{values[0]=0}),["b","c","a"]);
assert.equal(secureShuffle(["only"],values=>{values[0]=0})[0],"only");
const removed=parsePickerChoices("a\nb\nc").filter(item=>item!=="b");assert.deepEqual(removed,["a","c"]);

const first=await PDFDocument.create();first.addPage([100,200]);const second=await PDFDocument.create();second.addPage([300,400]);
const merged=await PDFDocument.create();for(const bytes of [await first.save(),await second.save()]){const source=await PDFDocument.load(bytes);for(const page of await merged.copyPages(source,source.getPageIndices()))merged.addPage(page)}
assert.equal(merged.getPageCount(),2);assert.deepEqual(merged.getPages().map(page=>[page.getWidth(),page.getHeight()]),[[100,200],[300,400]]);
await assert.rejects(()=>PDFDocument.load(new Uint8Array([1,2,3])));
assert.match(readFileSync("components/lab/pdf-tool.tsx","utf8"),/password protected/);
assert.match(readFileSync("components/lab/pdf-tool.tsx","utf8"),/candidate\.length<inputBytes\.length/);
assert.match(readFileSync("components/lab/pdf-tool.tsx","utf8"),/URL\.revokeObjectURL/);

const validation=readFileSync("lib/lab/file-validation.ts","utf8"),worker=readFileSync("lib/lab/image-processing.worker.ts","utf8"),tool=readFileSync("components/lab/image-tool.tsx","utf8");
for(const signature of ["PNG","RIFF","WEBP","0xff","image/jpeg","image/png","image/webp"])assert.match(validation,new RegExp(signature.replace("/","\\/")));
assert.match(worker,/imageOrientation:"from-image"/);assert.match(worker,/decoded\.close\(\)/);assert.match(worker,/canvas\.width=1/);
assert.match(tool,/candidate\.size>=file\.size/);assert.match(validation,/25\*1024\*1024/);
console.log("✓ QR, image, PDF and random-picker core behavior passed.");
