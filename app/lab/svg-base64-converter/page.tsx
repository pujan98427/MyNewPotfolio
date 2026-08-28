import { SvgBase64Tool } from "@/components/lab/svg-base64-tool";
import { ToolEducation } from "@/components/lab/tool-education";
import { ToolFrame } from "@/components/lab/tool-frame";
import { getToolEducation } from "@/data/tool-education";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata=createPageMetadata({title:"SVG to Base64 Converter — Encode & Decode SVG Online",description:"Convert SVG code or SVG files to Base64 and decode Base64 back to SVG online. Fast, private and processed locally in your browser.",path:"/lab/svg-base64-converter",absoluteTitle:true,imageAlt:"SVG to Base64 Converter — private browser-based SVG encoding and decoding tool"});

export default function SvgBase64ConverterPage(){const education=getToolEducation("svg-base64-converter")!;return <ToolFrame title="SVG to Base64 Converter" description="Encode SVG markup as Base64 or decode an SVG Base64 value back into readable XML—privately in your browser." path="/lab/svg-base64-converter"><SvgBase64Tool /><ToolEducation content={education} /></ToolFrame>}
