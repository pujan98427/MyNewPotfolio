import { HomePage } from "@/components/sections/home-page";
import { JsonLd } from "@/components/seo/json-ld";
import { personStructuredData, websiteStructuredData } from "@/lib/seo/structured-data";
export default function Page(){ return <><HomePage /><JsonLd data={[personStructuredData(),websiteStructuredData()]} /></>; }
