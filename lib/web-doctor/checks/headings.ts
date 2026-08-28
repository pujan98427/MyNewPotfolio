import { recommendation } from "../recommendations";
import type { SeoCheck } from "../types/analysis";

export const checkHeadings:SeoCheck=({document})=>{
  const items=document.headings,h1s=items.filter(item=>item.level===1),emptyCount=items.filter(item=>!item.text).length;
  let skippedCount=items[0]?.level>1?1:0;
  for(let index=1;index<items.length;index++){if(items[index].level>items[index-1].level+1)skippedCount++;}
  const needsReview=h1s.length!==1||emptyCount>0||skippedCount>0,multipleH1Only=h1s.length>1&&emptyCount===0&&skippedCount===0;
  const issues=[h1s.length===0?"No H1 was found.":`${h1s.length} H1${h1s.length===1?"":"s"} found.`,emptyCount?`${emptyCount} empty heading${emptyCount===1?"":"s"}.`:"",skippedCount?`${skippedCount} skipped hierarchy step${skippedCount===1?"":"s"}.`:""].filter(Boolean).join(" ");
  return {id:"h1",label:"HEADING STRUCTURE",status:needsReview?"warning":"pass",value:`${items.length} total heading${items.length===1?"":"s"}`,explanation:multipleH1Only?`${issues} Multiple H1 elements can be valid in modern HTML. Keep a clear primary page heading, but this alone does not reduce the score.`:needsReview?`${issues} Consider keeping a clear primary page heading and a logical sequence. Multiple H1 elements are not automatically catastrophic.`:"The page has one clear H1 and a logical detected heading sequence.",fix:needsReview?recommendation("h1"):undefined,scoreable:multipleH1Only?false:undefined,headingAnalysis:{items,total:items.length,h1Count:h1s.length,emptyCount,skippedCount}};
};
