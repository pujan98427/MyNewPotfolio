import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import ts from "typescript";

const source=readFileSync("lib/contact/request-origin.ts","utf8");
const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
const module={exports:{}};
new Function("require","module","exports",compiled)(specifier=>{
  if(specifier==="server-only")return {};
  if(specifier==="@/lib/site-config")return {SITE_HOSTNAME:"pujanchapagain.com.np"};
  throw new Error(`Unexpected dependency: ${specifier}`);
},module,module.exports);
const {browserRequestOriginIsAllowed}=module.exports;

function request(origin,host="pujanchapagain.com.np",nextOrigin="https://pujanchapagain.com.np",fetchSite="same-origin"){
  return {headers:new Headers({origin,host,"sec-fetch-site":fetchSite}),nextUrl:new URL(`${nextOrigin}/api/contact`)};
}

assert.equal(browserRequestOriginIsAllowed(request("https://pujanchapagain.com.np")),true,"canonical origin is accepted");
assert.equal(browserRequestOriginIsAllowed(request("https://www.pujanchapagain.com.np")),true,"www origin retained after the canonical redirect is accepted");
assert.equal(browserRequestOriginIsAllowed(request("https://www.pujanchapagain.com.np","www.pujanchapagain.com.np")),true,"www host is accepted before redirecting");
assert.equal(browserRequestOriginIsAllowed(request("https://preview.example.net","preview.example.net","https://preview.example.net")),true,"matching preview origin and host are accepted");
assert.equal(browserRequestOriginIsAllowed(request("https://attacker.example")),false,"unrelated origins are rejected");
assert.equal(browserRequestOriginIsAllowed(request("https://pujanchapagain.com.np","pujanchapagain.com.np","https://pujanchapagain.com.np","cross-site")),false,"cross-site browser requests are rejected");

process.stdout.write("✓ contact origin checks accept the production domain alias and reject cross-site requests\n");
