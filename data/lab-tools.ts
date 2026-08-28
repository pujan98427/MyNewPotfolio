export type LabTool = { slug:string; title:string; description:string; category:string; number:string };
export const labTools:readonly LabTool[]=[
  {slug:"web-doctor",title:"WEB DOCTOR",description:"Check a real website for SEO, sharing, accessibility and technical problems—with exact fixes.",category:"Website diagnostic",number:"01"},
  {slug:"meta-generator",title:"Meta Tag Generator",description:"Draft metadata and preview a search result as you type.",category:"Search appearance",number:"02"},
  {slug:"contrast-checker",title:"Colour Contrast Checker",description:"Test foreground and background colours against WCAG ratios.",category:"Accessibility",number:"03"},
  {slug:"clamp-generator",title:"CSS Clamp Generator",description:"Create fluid CSS values that scale cleanly between two viewport sizes.",category:"Responsive CSS",number:"04"},
  {slug:"open-graph-preview",title:"Open Graph Preview",description:"Draft social metadata and inspect a restrained sharing-card preview.",category:"Social sharing",number:"05"},
  {slug:"svg-base64-converter",title:"SVG ↔ Base64 Converter",description:"Encode SVG markup as Base64 or decode an SVG Base64 value back into readable markup.",category:"Developer utility",number:"06"},
];
export function getLabTool(slug:string){return labTools.find(tool=>tool.slug===slug);}
