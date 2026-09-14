import {readdirSync,readFileSync,existsSync} from "node:fs";
import {resolve,relative,dirname,extname} from "node:path";
import {fileURLToPath} from "node:url";

// Read-only inventory, not a CSS parser or proof of visual parity.
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const ignored=new Set([".git",".next","out","dist","build","coverage",".netlify",".turbo"]);
const files=[];
function walk(dir){
  for(const entry of readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){
    if(entry.isSymbolicLink())continue;
    const path=resolve(dir,entry.name);
    if(entry.isDirectory()){
      if(!ignored.has(entry.name)&&!entry.name.startsWith("node_modules"))walk(path);
    }else if(/\.(css|[cm]?[jt]sx?)$/.test(entry.name))files.push(path);
  }
}
const local=path=>relative(root,path).replaceAll("\\","/");
const classes=text=>[...new Set([...text.replace(/\/\*[\s\S]*?\*\//g,"").matchAll(/\.(-?[_a-zA-Z][_a-zA-Z0-9-]*)/g)].map(m=>m[1]))].sort();
walk(root);
const sources=new Map(files.map(path=>[path,readFileSync(path,"utf8")]));
const cssFiles=files.filter(p=>extname(p)===".css").map(path=>({file:local(path),module:path.endsWith(".module.css"),classCandidates:classes(sources.get(path))}));
const styleImports=[],moduleUsages=[],literalClasses=[],styleReferences=[];
for(const [path,text] of sources){
  if(path===fileURLToPath(import.meta.url))continue;
  const file=local(path),lines=text.split(/\r?\n/);
  for(const [i,line] of lines.entries()){
    if(/\.css["']|\.module\.css|\bstyles\s*[.[]/.test(line))styleReferences.push({file,line:i+1});
  }
  if(extname(path)===".css")continue;
  const bindings=[];
  const pattern=/\bimport\s+(?:(.*?)\s+from\s+)?["']([^"']+\.css)["']|\b(?:import|require)\s*\(\s*["']([^"']+\.css)["']\s*\)/g;
  for(const match of text.matchAll(pattern)){
    const specifier=match[2]??match[3];
    const target=specifier.startsWith(".")?resolve(dirname(path),specifier):specifier.startsWith("@/")?resolve(root,specifier.slice(2)):null;
    const binding=match[1]?.trim();
    styleImports.push({file,specifier,binding:binding??null,target:target?local(target):null,exists:target?existsSync(target):null});
    if(binding&&/^\w+$/.test(binding)&&specifier.endsWith(".module.css"))bindings.push(binding);
  }
  for(const binding of bindings){
    const escaped=binding.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
    const pattern=new RegExp(`\\b${escaped}\\s*(?:\\.\\s*([\\w]+)|\\[\\s*["']([^"']+)["']\\s*\\])`,"g");
    moduleUsages.push({file,binding,keys:[...new Set([...text.matchAll(pattern)].map(m=>m[1]??m[2]))].sort(),computedAccessNeedsReview:new RegExp(`\\b${escaped}\\s*\\[\\s*[^"'\\s]`).test(text)});
  }
  for(const match of text.matchAll(/\bclassName\s*=\s*(?:"([^"]*)"|'([^']*)'|\{\s*"([^"]*)"\s*\}|\{\s*'([^']*)'\s*\})/g)){
    literalClasses.push({file,classes:(match[1]??match[2]??match[3]??match[4]).split(/\s+/).filter(Boolean)});
  }
}
const globalClassCandidates=[...new Set(cssFiles.filter(f=>!f.module).flatMap(f=>f.classCandidates))].sort();
const missingImports=styleImports.filter(i=>i.exists===false);
const modulesWithoutImports=cssFiles.filter(f=>f.module&&!styleImports.some(i=>i.target===f.file)).map(f=>f.file);
const baselineArg=process.argv.find(arg=>arg.startsWith("--baseline="));
const baseline=baselineArg?JSON.parse(readFileSync(resolve(root,baselineArg.slice(11)),"utf8")):null;
const removedGlobalHooksStillInLiteralJsx=(baseline?.globalClassCandidates??[]).filter(c=>!globalClassCandidates.includes(c)).flatMap(c=>literalClasses.filter(item=>item.classes.includes(c)).map(item=>({file:item.file,className:c})));
const report={cssFiles,styleImports,moduleUsages,globalClassCandidates,literalClasses,styleReferences,missingImports,modulesWithoutImports,removedGlobalHooksStillInLiteralJsx,limitations:["Class candidates are heuristic: selectors with CSS escapes or nested syntax need manual inspection.","Dynamic JSX class composition, aliases and computed module keys require reference searches and review.","A remaining hook may be intentional for scripts/tests. Verify its replacement utilities before accepting it.","No missing-style or visual-parity guarantee: browser screenshots and interaction tests remain mandatory."]};
if(process.argv.includes("--check")){
  const allowed=JSON.parse(readFileSync(resolve(root,"scripts/legacy-css-modules.json"),"utf8"));
  const actual=cssFiles.filter(f=>f.module).map(f=>f.file);
  const unexpected=actual.filter(f=>!allowed.includes(f));
  const stale=allowed.filter(f=>!actual.includes(f));
  console.log(JSON.stringify({unexpectedModules:unexpected,staleAllowlistEntries:stale,missingImports},null,2));
  if(unexpected.length||stale.length)process.exitCode=1;
}else console.log(JSON.stringify(report,null,2));
if(missingImports.length)process.exitCode=1;
