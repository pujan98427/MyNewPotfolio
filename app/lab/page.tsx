import {LabDirectory} from "@/components/lab/lab-directory";
import {PageIntro} from "@/components/ui/page-intro";
import {labTools} from "@/data/lab-tools";
import {createPageMetadata} from "@/lib/seo/metadata";

export const metadata=createPageMetadata({title:"Free Browser Tools — The Lab",description:"Use practical browser tools for websites, images, PDFs, design work, QR codes and everyday decisions. No account required.",path:"/lab"});

export default function LabPage(){return <main id="main"><PageIntro index="03" eyebrow="Lab" title="Useful things for everyday work." description="Choose a task, add your input and get a clear result. File tools process your content locally in the browser."/><LabDirectory tools={labTools}/></main>;}
