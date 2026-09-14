import {existsSync,readdirSync,readFileSync} from "node:fs";
import {dirname,extname,relative,resolve} from "node:path";
import {fileURLToPath} from "node:url";

const projectRoot=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const globalsPath=resolve(projectRoot,"app/globals.css");
const ignoredDirectories=new Set([
  ".git",".next",".netlify",".turbo","build","coverage","dist","out",
]);
const sourceExtensions=new Set([".js",".jsx",".mjs",".cjs",".ts",".tsx",".mts",".cts"]);
const approvedCssFiles=new Set(["app/globals.css"]);
const enforce=process.argv.includes("--enforce");
const json=process.argv.includes("--json");

const localPath=path=>relative(projectRoot,path).replaceAll("\\","/");
const files=[];
function walk(directory){
  for(const entry of readdirSync(directory,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){
    if(entry.isSymbolicLink())continue;
    const path=resolve(directory,entry.name);
    if(entry.isDirectory()){
      if(!ignoredDirectories.has(entry.name)&&!entry.name.startsWith("node_modules"))walk(path);
      continue;
    }
    files.push(path);
  }
}
walk(projectRoot);

const cssFiles=files.filter(path=>extname(path)===".css");
const cssModules=cssFiles.filter(path=>path.endsWith(".module.css")).map(localPath);
const cssOutsideApprovedInfrastructure=cssFiles.map(localPath).filter(path=>!approvedCssFiles.has(path));

const moduleImports=[];
for(const path of files.filter(path=>sourceExtensions.has(extname(path)))){
  const source=readFileSync(path,"utf8");
  const lines=source.split(/\r?\n/);
  const importPattern=/\b(?:from\s*|import\s*\(\s*|require\s*\(\s*)["']([^"']+\.module\.css)["']/g;
  for(const [index,line] of lines.entries()){
    for(const match of line.matchAll(importPattern)){
      const specifier=match[1];
      const target=specifier.startsWith("@/")
        ? resolve(projectRoot,specifier.slice(2))
        : specifier.startsWith(".")?resolve(dirname(path),specifier):null;
      moduleImports.push({
        file:localPath(path),line:index+1,specifier,
        target:target?localPath(target):null,
        targetExists:target?existsSync(target):null,
      });
    }
  }
}

function lineNumber(source,index){return source.slice(0,index).split("\n").length;}
function componentSelectors(source){
  const clean=source.replace(/\/\*[\s\S]*?\*\//g,match=>match.replace(/[^\n]/g," "));
  const selectors=[];
  let tokenStart=0;
  for(let index=0;index<clean.length;index++){
    const character=clean[index];
    if(character==="}"||character===";")tokenStart=index+1;
    if(character!=="{")continue;
    const prelude=clean.slice(tokenStart,index).trim();
    tokenStart=index+1;
    if(!prelude||prelude.startsWith("@")||/^(?:from|to|\d+(?:\.\d+)?%)$/.test(prelude))continue;
    // Class/id selectors represent component or semantic hooks. Global element,
    // root, selection and print behaviour are intentionally outside this report.
    if(!/[.#][-_a-zA-Z]/.test(prelude))continue;
    selectors.push({line:lineNumber(clean,index-prelude.length),selector:prelude.replace(/\s+/g," ")});
  }
  return selectors;
}
const globalsSource=existsSync(globalsPath)?readFileSync(globalsPath,"utf8"):"";
const globalsComponentSelectors=componentSelectors(globalsSource);
const missingModuleImports=moduleImports.filter(item=>item.targetExists===false);

const report={
  mode:enforce?"enforce":"baseline",
  approvedCssInfrastructure:[...approvedCssFiles],
  cssModules,
  moduleImports,
  globalsComponentSelectors,
  cssOutsideApprovedInfrastructure,
  missingModuleImports,
};

function section(title,items,format=value=>String(value)){
  console.log(`\n${title} (${items.length})`);
  if(!items.length){console.log("  none");return;}
  for(const item of items)console.log(`  - ${format(item)}`);
}

if(json)console.log(JSON.stringify(report,null,2));
else{
  console.log(`Tailwind styling audit — ${enforce?"enforcement":"legacy baseline"}`);
  console.log(enforce
    ? "Strict mode: legacy component styling is not allowed."
    : "Report-only mode: existing migration debt does not fail this command.");
  section("CSS Modules",cssModules);
  section("CSS Module imports",moduleImports,item=>`${item.file}:${item.line} -> ${item.specifier}${item.targetExists===false?" (missing)":""}`);
  section("Component-specific selectors in app/globals.css",globalsComponentSelectors,item=>`app/globals.css:${item.line} ${item.selector}`);
  section("CSS outside approved global/style infrastructure",cssOutsideApprovedInfrastructure);
  if(!enforce)console.log("\nRun `npm run audit:tailwind -- --enforce` for the final zero-legacy gate.");
}

if(missingModuleImports.length)process.exitCode=1;
if(enforce&&(cssModules.length||moduleImports.length||globalsComponentSelectors.length||cssOutsideApprovedInfrastructure.length))process.exitCode=1;
