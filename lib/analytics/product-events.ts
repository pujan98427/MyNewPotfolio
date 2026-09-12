export type AnalysisSource="url"|"manual"|"recent"|"recheck";
export type ScoreBand="attention"|"needs-work"|"good";
export type FailureClass="validation"|"timeout"|"access-refused"|"rate-limited"|"network"|"unsupported"|"unknown";
export type FeedbackReason="results-clarity"|"fix-guidance"|"speed"|"missing-check";
export type AnalyticsFileFormat="jpeg"|"png"|"webp"|"avif"|"gif"|"bmp"|"pdf"|"unknown";
export type CompressionBucket="none"|"under_25"|"25_to_49"|"50_to_74"|"75_plus";

export type ProductEventMap={
  web_doctor_started:{source:AnalysisSource};
  web_doctor_completed:{source:AnalysisSource;scoreBand:ScoreBand;importantIssues:number};
  web_doctor_failed:{source:AnalysisSource;failureClass:FailureClass};
  recheck_clicked:Record<string,never>;
  fix_copied:{findingId:string;framework:"HTML"|"Next.js"|"React"|"WordPress"};
  guide_opened:{guideSlug:string;findingId:string};
  report_printed:{scoreBand:ScoreBand};
  diagnosis_feedback:{useful:boolean;reason?:FeedbackReason};
  contact_opened:Record<string,never>;
  contact_started:Record<string,never>;
  contact_submitted:Record<string,never>;
  contact_success:Record<string,never>;
  contact_error:Record<string,never>;
  tool_opened:{tool_name:string};
  file_selected:{tool_name:string};
  tool_processed:{tool_name:string};
  result_downloaded:{tool_name:string};
  tool_handoff_used:{from_tool:string;to_tool:string};
  crop_resized:{tool_name:"image-cropper"};
  crop_ratio_selected:{tool_name:"image-cropper";ratio:"free"|"1:1"|"16:9"|"4:5"|"9:16"};
  qr_generated:{qr_type:"website"|"social"|"text"|"wifi"|"email"|"phone"|"sms"|"whatsapp"|"contact"};
  qr_downloaded:{qr_type:"website"|"social"|"text"|"wifi"|"email"|"phone"|"sms"|"whatsapp"|"contact";output_format:"png"|"svg"|"card"};
  image_compressed:{input_format:AnalyticsFileFormat;output_format:AnalyticsFileFormat;compression_bucket:CompressionBucket};
  image_resized:{input_format:AnalyticsFileFormat;output_format:AnalyticsFileFormat};
  image_converted:{input_format:AnalyticsFileFormat;output_format:AnalyticsFileFormat};
  image_cropped:{input_format:AnalyticsFileFormat;output_format:AnalyticsFileFormat};
  image_downloaded:{tool_name:"image-compressor"|"image-resizer"|"image-format-converter"|"image-cropper";input_format:AnalyticsFileFormat;output_format:AnalyticsFileFormat};
  image_handoff_clicked:{from_tool:"image-compressor"|"image-resizer"|"image-format-converter"|"image-cropper";to_tool:"image-compressor"|"image-resizer"|"image-format-converter"|"image-cropper";output_format:AnalyticsFileFormat};
  pdf_merged:{input_count_bucket:"2"|"3_to_5"|"6_to_10"|"11_to_20"};
  pdf_compressed:{compression_bucket:CompressionBucket};
  random_pick_completed:{mode:"one"|"several"|"shuffle";result_count_bucket:"one"|"several"};
};

export interface ProductAnalyticsAdapter{track<Name extends keyof ProductEventMap>(name:Name,properties:ProductEventMap[Name]):void;}

let adapter:ProductAnalyticsAdapter|null=null;

/** Register only a privacy-reviewed analytics adapter after any required consent. */
export function registerProductAnalyticsAdapter(nextAdapter:ProductAnalyticsAdapter){adapter=nextAdapter;return ()=>{if(adapter===nextAdapter)adapter=null;};}

export function trackProductEvent<Name extends keyof ProductEventMap>(name:Name,properties:ProductEventMap[Name]){try{adapter?.track(name,properties);}catch{/* Analytics must never interrupt a tool. */}}

/** Call from the analytics-consent integration after configuring the Google tag.
 * Advertising consent alone is not analytics consent. No buffering or replay.
 */
export function registerGa4UxAnalytics(options:{measurementId:string;hasAnalyticsConsent:()=>boolean;gtag:(command:"event",name:string,params:Record<string,string>)=>void}){
  const id=options.measurementId.trim();
  if(!/^G-[A-Z0-9]+$/.test(id))return ()=>{};
  const tools=new Set(["image-compressor","image-resizer","image-format-converter","image-cropper","pdf-merger","pdf-compressor","qr-code-generator","random-picker","web-doctor","meta-generator","open-graph-preview","svg-base64-converter","contrast-checker","clamp-generator"]);
  const fields:Record<string,readonly string[]>={tool_opened:["tool_name"],file_selected:["tool_name"],tool_processed:["tool_name"],result_downloaded:["tool_name"],tool_handoff_used:["from_tool","to_tool"],crop_resized:["tool_name"],crop_ratio_selected:["tool_name","ratio"]};
  return registerProductAnalyticsAdapter({track(name,properties){
    if(!options.hasAnalyticsConsent()||!Object.hasOwn(fields,name))return;
    const params:Record<string,string>={send_to:id};
    for(const key of fields[name]){
      const value=(properties as Record<string,unknown>)[key];
      if(typeof value!=="string"||!(key==="ratio"?["free","1:1","16:9","4:5","9:16"].includes(value):tools.has(value)))return;
      params[key]=value;
    }
    options.gtag("event",name,params);
  }});
}

export function scoreBand(score:number):ScoreBand{return score>=80?"good":score>=60?"needs-work":"attention";}
export function compressionBucket(percent:number):CompressionBucket{return percent>=75?"75_plus":percent>=50?"50_to_74":percent>=25?"25_to_49":percent>0?"under_25":"none";}

export function failureClass(message:string):FailureClass{
  if(/valid|URL|address|protocol/i.test(message))return "validation";
  if(/timeout|longer than|did not respond/i.test(message))return "timeout";
  if(/refused|authentication|forbidden/i.test(message))return "access-refused";
  if(/limiting|too many|rate/i.test(message))return "rate-limited";
  if(/HTML|response is too large|unsupported/i.test(message))return "unsupported";
  if(/connect|network|DNS|hostname|secure connection/i.test(message))return "network";
  return "unknown";
}
