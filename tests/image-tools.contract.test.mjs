import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const imageToolPath="components/lab/image-tool.tsx";
const imageTool=readFileSync(imageToolPath,"utf8");

const routes={
  compress:"app/lab/image-compressor/page.tsx",
  resize:"app/lab/image-resizer/page.tsx",
  convert:"app/lab/image-format-converter/page.tsx",
  crop:"app/lab/image-cropper/page.tsx",
};

for(const [mode,path] of Object.entries(routes)){
  const page=readFileSync(path,"utf8");
  assert.match(page,new RegExp(`<ImageTool\\s+mode=["']${mode}["']\\s*\\/>`),`${path} must render the ${mode} image tool`);
}

const sourcePreviews=[...imageTool.matchAll(/<img(?=[^>]*src=\{source\})(?=[^>]*onLoad=\{onLoad\})(?=[^>]*onError=\{onSourcePreviewError\})[^>]*\/>/g)];
assert.ok(sourcePreviews.length>=3,"uploaded images must keep load and recovery handlers in their visible previews/editors");
for(const alt of ["Selected image preview","Original image preview","Image with adjustable crop area"]){
  assert.match(imageTool,new RegExp(`alt=["']${alt}["']`),`${alt} needs an accessible image description`);
}
assert.match(imageTool,/<img(?=[^>]*src=\{result\.url\})(?=[^>]*alt=["']Processed image preview["'])[^>]*\/>/,"processed output must render a result preview");
assert.match(imageTool,/onSourcePreviewError[^]*setError\(["']I couldn[^]*preview this image/,
  "a broken source preview must give the user a recovery message");

for(const id of ["image-width","image-height"]){
  assert.match(imageTool,new RegExp(`id=["']${id}["']`),`${id} control must remain available`);
}
assert.match(imageTool,/alt=["']Original image preview["'][^]*id=["']custom-image-size["']/,
  "the resizer must keep the source preview visible beside the size controls");
assert.match(imageTool,/setHeight\(Math\.round\(next\*sourceHeight\/sourceWidth\)\)/,
  "changing width with proportions enabled must update height");
assert.match(imageTool,/placeholder=\{keepProportions\?`Auto \(\$\{height\}px\)`/,
  "the proportional height control must communicate its calculated value");

for(const format of ["image/webp","image/jpeg","image/png"]){
  assert.match(imageTool,new RegExp(`(?:option|button)[^>]*value=["']${format}["']`),`${format} must remain a converter choice`);
}
assert.match(imageTool,/mode===["']convert["'][^]*Download \$\{result\.blob\.type/,
  "the converter result must expose a format-specific download action");

assert.match(imageTool,/role=["']slider["'][^]*aria-label=["']Crop area position["']/,
  "the crop frame must remain keyboard focusable and named");
assert.match(imageTool,/\[["']nw["'],["']ne["'],["']sw["'],["']se["']\][^]*\.map\(corner=>/,
  "all four crop corners must remain directly resizable");
assert.match(imageTool,/\[["']top["'],["']right["'],["']bottom["'],["']left["']\][^]*\.map\(edge=>/,
  "free crop must retain all four edge handles");
for(const pointerContract of ["setPointerCapture","hasPointerCapture","releasePointerCapture","onPointerMove","onPointerCancel","onLostPointerCapture"]){
  assert.match(imageTool,new RegExp(pointerContract),`crop interactions must retain ${pointerContract}`);
}
for(const key of ["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"]){
  assert.match(imageTool,new RegExp(key),`crop interactions must retain ${key} keyboard support`);
}
for(const cropArgument of ["cropX:cropLeft","cropY:cropTop","cropWidth:cropWidthPercent","cropHeight:cropHeightPercent","cropZoom","cropRotation"]){
  assert.match(imageTool,new RegExp(cropArgument),`crop export must use the visual ${cropArgument} value`);
}

assert.match(imageTool,/URL\.revokeObjectURL\(result\.url\)/,"replaced and cleared results must release their object URLs");
assert.match(imageTool,/const download=\(\)=>[^]*anchor\.href=result\.url[^]*anchor\.download=outputName[^]*anchor\.click\(\)/,
  "download must use the current result Blob URL and output filename");
assert.match(imageTool,/await saveImageHandoff\(result\.blob,outputName\)[^]*router\.push\(routes\[nextMode\]\)/,
  "cross-tool actions must save the output Blob before navigating");
for(const label of ["Download compressed image","Download resized image","Download cropped image","Use this image in another tool"]){
  assert.match(imageTool,new RegExp(label),`${label} must remain exposed to assistive technology`);
}

const legacyStyleReference=imageTool.match(/(?:from\s*|import\s*)["'][^"']+\.module\.css["']/);
const legacyStyleLine=legacyStyleReference?.index===undefined?"unknown":String(imageTool.slice(0,legacyStyleReference.index).split("\n").length);
assert.equal(legacyStyleReference,null,`image tools must not depend on CSS Modules after their Tailwind migration (found ${legacyStyleReference?.[0]} on line ${legacyStyleLine})`);

console.log("✓ Image preview, resize, convert, crop, download and handoff contracts passed.");
