import { OpenGraphTool } from "@/components/lab/open-graph-tool";
import { ToolPageLayout } from "@/components/lab/tool-page-layout";
import { createToolPageMetadata } from "@/lib/seo/metadata";

export const metadata=createToolPageMetadata({title:"Open Graph Preview Tool",description:"Draft Open Graph metadata and preview how a page may appear when shared, then copy accurate HTML tags for your website.",path:"/lab/open-graph-preview"});

export default function OpenGraphPreviewPage(){return <ToolPageLayout title="Open Graph preview" description="Shape the title, description and identity of a shared page before adding the metadata to your site." path="/lab/open-graph-preview" variant="product"><OpenGraphTool /></ToolPageLayout>;}
