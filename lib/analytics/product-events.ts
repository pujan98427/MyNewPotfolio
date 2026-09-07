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
  qr_generated:{qr_type:"website"|"text"|"wifi"|"email"|"phone"|"sms"|"whatsapp"|"contact"};
  qr_downloaded:{qr_type:"website"|"text"|"wifi"|"email"|"phone"|"sms"|"whatsapp"|"contact";output_format:"png"|"svg"};
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

export function trackProductEvent<Name extends keyof ProductEventMap>(name:Name,properties:ProductEventMap[Name]){adapter?.track(name,properties);}

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
