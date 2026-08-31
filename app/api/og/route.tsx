import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { PERSON_NAME } from "@/lib/identity";
import { OPEN_GRAPH_IMAGE_SIZE, resolveOpenGraphCard } from "@/lib/seo/open-graph";

export const runtime="nodejs";

export async function GET(request:NextRequest){
  const path=request.nextUrl.searchParams.get("path")??"";
  const card=resolveOpenGraphCard(path);
  if(!card)return new Response("Sharing image not found.",{status:404,headers:{"content-type":"text/plain; charset=utf-8","cache-control":"no-store"}});
  return new ImageResponse(<div style={{display:"flex",position:"relative",width:"100%",height:"100%",padding:"70px 78px",overflow:"hidden",background:"#f0eee8",color:"#151515",fontFamily:"Arial, sans-serif"}}>
    <div style={{display:"flex",position:"absolute",right:"-90px",top:"-140px",width:"520px",height:"520px",borderRadius:"50%",background:"#e45447",opacity:.92}} />
    <div style={{display:"flex",position:"absolute",right:"210px",bottom:"-180px",width:"420px",height:"420px",border:"2px solid rgba(21,21,21,.25)",borderRadius:"50%"}} />
    <div style={{display:"flex",position:"relative",flexDirection:"column",justifyContent:"space-between",width:"100%",height:"100%"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:20,fontWeight:700,letterSpacing:3,textTransform:"uppercase"}}><span>{card.eyebrow}</span><span>{PERSON_NAME}</span></div>
      <div style={{display:"flex",flexDirection:"column",maxWidth:900}}><div style={{display:"flex",fontSize:76,fontWeight:700,lineHeight:1.02,letterSpacing:-3}}>{card.title}</div><div style={{display:"flex",maxWidth:790,marginTop:28,fontSize:27,lineHeight:1.35,color:"#55534f"}}>{card.description}</div></div>
      <div style={{display:"flex",alignItems:"center",gap:16,fontSize:18,fontWeight:700,letterSpacing:2,textTransform:"uppercase"}}><span style={{display:"flex",width:34,height:2,background:"#151515"}} /> Frontend developer · Glasgow</div>
    </div>
  </div>,{...OPEN_GRAPH_IMAGE_SIZE,headers:{"cache-control":"public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800"}});
}
