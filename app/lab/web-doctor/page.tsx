import { ToolPageLayout } from "@/components/lab/tool-page-layout";
import { SeoTool } from "@/components/lab/seo-tool";
import { WebDoctorEducation } from "@/components/lab/web-doctor-education";
import { createToolPageMetadata } from "@/lib/seo/metadata";

export const metadata=createToolPageMetadata({title:"Free Website SEO Checker — Web Doctor",description:"Enter a public URL to inspect metadata, headings, indexability and social sharing, with clear fixes and no signup required.",path:"/lab/web-doctor",absoluteTitle:true,imageAlt:"Web Doctor free website diagnostic"});

export default function WebDoctorPage(){return <ToolPageLayout title="WEB DOCTOR" description="A free website diagnostic for real pages. No signup, no API key, and no manual HTML required." path="/lab/web-doctor" variant="product" immersive education={<WebDoctorEducation />}><SeoTool /></ToolPageLayout>;}
