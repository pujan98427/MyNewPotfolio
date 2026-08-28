export type AnalysisSource="url"|"manual"|"recent"|"recheck";
export type ScoreBand="attention"|"needs-work"|"good";
export type FailureClass="validation"|"timeout"|"access-refused"|"rate-limited"|"network"|"unsupported"|"unknown";
export type FeedbackReason="results-clarity"|"fix-guidance"|"speed"|"missing-check";

export type ProductEventMap={
  web_doctor_started:{source:AnalysisSource};
  web_doctor_completed:{source:AnalysisSource;scoreBand:ScoreBand;importantIssues:number};
  web_doctor_failed:{source:AnalysisSource;failureClass:FailureClass};
  recheck_clicked:Record<string,never>;
  fix_copied:{findingId:string;framework:"HTML"|"Next.js"|"React"|"WordPress"};
  guide_opened:{guideSlug:string;findingId:string};
  report_printed:{scoreBand:ScoreBand};
  diagnosis_feedback:{useful:boolean;reason?:FeedbackReason};
};

export interface ProductAnalyticsAdapter{track<Name extends keyof ProductEventMap>(name:Name,properties:ProductEventMap[Name]):void;}

let adapter:ProductAnalyticsAdapter|null=null;

/** Register only a privacy-reviewed analytics adapter after any required consent. */
export function registerProductAnalyticsAdapter(nextAdapter:ProductAnalyticsAdapter){adapter=nextAdapter;return ()=>{if(adapter===nextAdapter)adapter=null;};}

export function trackProductEvent<Name extends keyof ProductEventMap>(name:Name,properties:ProductEventMap[Name]){adapter?.track(name,properties);}

export function scoreBand(score:number):ScoreBand{return score>=80?"good":score>=60?"needs-work":"attention";}

export function failureClass(message:string):FailureClass{
  if(/valid|URL|address|protocol/i.test(message))return "validation";
  if(/timeout|longer than|did not respond/i.test(message))return "timeout";
  if(/refused|authentication|forbidden/i.test(message))return "access-refused";
  if(/limiting|too many|rate/i.test(message))return "rate-limited";
  if(/HTML|response is too large|unsupported/i.test(message))return "unsupported";
  if(/connect|network|DNS|hostname|secure connection/i.test(message))return "network";
  return "unknown";
}
