import { OpenGraphTool } from "@/components/lab/open-graph-tool";
import { ToolFrame } from "@/components/lab/tool-frame";
import { ToolEducation } from "@/components/lab/tool-education";
import { getToolEducation } from "@/data/tool-education";
import { createPageMetadata } from "@/lib/seo/metadata";

export const metadata=createPageMetadata({title:"Open Graph Preview Tool",description:"Draft Open Graph metadata and preview how a page may appear when shared, then copy accurate HTML tags for your website.",path:"/lab/open-graph-preview"});

export default function OpenGraphPreviewPage(){const education=getToolEducation("open-graph-preview")!;return <ToolFrame title="Open Graph preview" description="Shape the title, description and identity of a shared page before adding the metadata to your site." path="/lab/open-graph-preview"><OpenGraphTool /><ToolEducation content={education} /></ToolFrame>;}
