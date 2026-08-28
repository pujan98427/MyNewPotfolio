import { SvgBase64Tool } from "@/components/lab/svg-base64-tool";
import { ToolPageLayout } from "@/components/lab/tool-page-layout";
import { createToolPageMetadata } from "@/lib/seo/metadata";

export const metadata=createToolPageMetadata({title:"SVG to Base64 Converter — Encode & Decode SVG Online",description:"Convert SVG code or SVG files to Base64 and decode Base64 back to SVG online. Fast, private and processed locally in your browser.",path:"/lab/svg-base64-converter",absoluteTitle:true,imageAlt:"SVG to Base64 Converter — private browser-based SVG encoding and decoding tool"});

export default function SvgBase64ConverterPage(){return <ToolPageLayout title="SVG to Base64 Converter" description="Encode SVG markup as Base64 or decode an SVG Base64 value back into readable XML—privately in your browser." path="/lab/svg-base64-converter" variant="editorial"><SvgBase64Tool /></ToolPageLayout>}
