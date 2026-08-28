import type { DiagnosticStatus, WebDoctorComparison, WebDoctorReport, WebDoctorReportSnapshot } from "./types/analysis";

/** Compact, content-free data intended for optional browser-local history. */
export function createReportSnapshot(report:WebDoctorReport):WebDoctorReportSnapshot{
  return {
    schemaVersion:1,
    url:report.url,
    checkedAt:report.checkedAt,
    score:report.score,
    categories:report.scoreCategories.map(category=>({id:category.id,score:category.score,maximum:category.maximum})),
    findings:report.diagnostics.map(finding=>({id:finding.id,status:finding.status,availability:finding.availability,scoreable:finding.scoreable})),
  };
}

/** Pure comparison model for a future UI; it performs no storage or upload. */
export function compareReportSnapshots(previous:WebDoctorReportSnapshot,current:WebDoctorReportSnapshot):WebDoctorComparison{
  const previousCategories=new Map(previous.categories.map(category=>[category.id,category]));
  const categoryIds=[...new Set([...previous.categories,...current.categories].map(category=>category.id))];
  const categories=categoryIds.map(id=>{const before=previousCategories.get(id),after=current.categories.find(category=>category.id===id);const previousScore=before?.score??0,currentScore=after?.score??0;return {id,previous:previousScore,current:currentScore,delta:currentScore-previousScore,maximum:after?.maximum??before?.maximum??0};});
  const previousFindings=new Map(previous.findings.map(finding=>[finding.id,finding.status]));
  const currentFindings=new Map(current.findings.map(finding=>[finding.id,finding.status]));
  const findingIds=[...new Set([...previousFindings.keys(),...currentFindings.keys()])];
  const findings=findingIds.map(id=>{const before=previousFindings.get(id) as DiagnosticStatus|undefined,after=currentFindings.get(id) as DiagnosticStatus|undefined;return {id,previous:before,current:after,changed:before!==after};});
  return {previous,current,scoreDelta:current.score-previous.score,categories,findings};
}
