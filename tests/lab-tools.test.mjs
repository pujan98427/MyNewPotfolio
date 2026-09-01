import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import ts from "typescript";

function load(path){const source=readFileSync(path,"utf8"),compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText,module={exports:{}};new Function("require","module","exports",compiled)(require=>{throw new Error(`Unexpected import: ${require}`)},module,module.exports);return module.exports}
const {labTools,labCategoryOrder}=load("data/lab-tools.ts");
const expected=["qr-code-generator","image-compressor","image-resizer","image-format-converter","image-cropper","pdf-merger","pdf-compressor","random-picker"];
for(const slug of expected)assert.ok(labTools.some(tool=>tool.slug===slug),slug);
assert.deepEqual(labCategoryOrder,["Website & SEO","Images","Documents","Developer & Design","Everyday"]);
assert.equal(new Set(labTools.map(tool=>tool.slug)).size,labTools.length);
assert.ok(labTools.every(tool=>tool.documentationSlug&&tool.searchTerms.length>=4));

const normalize=value=>value.toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const match=query=>{const terms=normalize(query).split(" ");return labTools.find(tool=>{const text=normalize([tool.title,tool.description,tool.category,...tool.searchTerms].join(" "));return terms.every(term=>text.includes(term))})?.slug};
for(const [query,slug] of [["make photo smaller","image-compressor"],["resize picture","image-resizer"],["change png to webp","image-format-converter"],["join pdf","pdf-merger"],["make pdf smaller","pdf-compressor"],["make qr","qr-code-generator"],["choose random name","random-picker"]])assert.equal(match(query),slug,query);

const localSources=["components/lab/image-tool.tsx","components/lab/pdf-tool.tsx","components/lab/qr-code-tool.tsx","components/lab/random-picker-tool.tsx"].map(path=>readFileSync(path,"utf8")).join("\n");
assert.doesNotMatch(localSources,/fetch\(|XMLHttpRequest|axios|\/api\//);
assert.match(readFileSync("components/lab/pdf-tool.tsx","utf8"),/useObjectStreams:true/);
assert.match(readFileSync("components/lab/pdf-tool.tsx","utf8"),/savePdfHandoff/);
const pdfHandoff=readFileSync("lib/lab/pdf-handoff.ts","utf8");
assert.match(pdfHandoff,/indexedDB\.open/);
assert.match(pdfHandoff,/store\.delete\(RECORD_KEY\)/);
assert.doesNotMatch(pdfHandoff,/fetch\(|XMLHttpRequest|localStorage/);
assert.match(readFileSync("components/lab/qr-code-tool.tsx","utf8"),/await import\("qrcode"\)/);
for(const qrType of ["link","wifi","contact","message"])assert.match(readFileSync("components/lab/qr-code-tool.tsx","utf8"),new RegExp(`value=\\"${qrType}\\"`));
assert.match(readFileSync("components/lab/image-tool.tsx","utf8"),/canvas\.toBlob/);
assert.match(readFileSync("components/lab/image-tool.tsx","utf8"),/saveImageHandoff/);
const imageHandoff=readFileSync("lib/lab/image-handoff.ts","utf8");
assert.match(imageHandoff,/indexedDB\.open/);
assert.match(imageHandoff,/10\*60\*1000/);
assert.match(imageHandoff,/store\.delete\(RECORD_KEY\)/);
assert.doesNotMatch(imageHandoff,/fetch\(|XMLHttpRequest|localStorage/);
assert.match(readFileSync("components/lab/random-picker-tool.tsx","utf8"),/crypto\.getRandomValues/);
assert.match(readFileSync("components/lab/simple-tools.module.css","utf8"),/Private by default/);
assert.match(readFileSync("components/lab/svg-base64-tool.tsx","utf8"),/This file is processed on your device\. It is not uploaded to my server\./);
const sharedLayout=readFileSync("components/lab/tool-page-layout.tsx","utf8");
for(const stage of ["Tool","Next useful actions","Related tools"])assert.match(sharedLayout,new RegExp(stage));
assert.match(sharedLayout,/advertisement\?:ReactNode/);
assert.ok(sharedLayout.indexOf("{children}")<sharedLayout.indexOf("{!immersive&&advertisement}"),"tool must render before the optional advertisement position");
console.log("✓ 8 new Lab tools, categories, natural-language aliases and local-processing boundaries passed.");
