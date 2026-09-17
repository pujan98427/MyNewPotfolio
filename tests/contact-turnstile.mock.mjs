import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import ts from "typescript";

const source=readFileSync("lib/contact/turnstile.ts","utf8");
const compiled=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;

function loadTurnstile(){
  const module={exports:{}};
  const mocks={"server-only":{},"@/lib/site-config":{SITE_URL:"https://portfolio.test"}};
  new Function("require","module","exports",compiled)(specifier=>{if(specifier in mocks)return mocks[specifier];throw new Error(`Unexpected dependency: ${specifier}`);},module,module.exports);
  return module.exports;
}

const original={
  nodeEnv:process.env.NODE_ENV,
  bypass:process.env.TURNSTILE_DEV_BYPASS,
  siteKey:process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
  secret:process.env.TURNSTILE_SECRET_KEY,
  required:process.env.TURNSTILE_REQUIRED,
};

try{
  process.env.NODE_ENV="development";
  process.env.TURNSTILE_DEV_BYPASS="true";
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY="real-site-key";
  process.env.TURNSTILE_SECRET_KEY="real-secret-key";
  process.env.TURNSTILE_REQUIRED="true";
  const development=loadTurnstile();
  assert.equal(development.turnstileSiteKeyForClient(),null,"development bypass does not render the real widget");
  assert.deepEqual(
    await development.verifyTurnstileToken({token:"",requestId:"123e4567-e89b-42d3-a456-426614174000"}),
    {ok:true,mode:"development-bypass"},
    "explicit local bypass works even when real Turnstile keys remain configured",
  );

  process.env.NODE_ENV="production";
  const production=loadTurnstile();
  assert.equal(production.turnstileSiteKeyForClient(),"real-site-key","production still renders the configured widget");
  assert.deepEqual(
    await production.verifyTurnstileToken({token:"",requestId:"123e4567-e89b-42d3-a456-426614174000"}),
    {ok:false,reason:"missing-token"},
    "the development bypass can never disable production verification",
  );
}finally{
  for(const [name,value] of Object.entries({NODE_ENV:original.nodeEnv,TURNSTILE_DEV_BYPASS:original.bypass,NEXT_PUBLIC_TURNSTILE_SITE_KEY:original.siteKey,TURNSTILE_SECRET_KEY:original.secret,TURNSTILE_REQUIRED:original.required})){
    if(value===undefined)delete process.env[name];
    else process.env[name]=value;
  }
}

process.stdout.write("✓ Turnstile local bypass is explicit, local-only, and production-safe\n");
