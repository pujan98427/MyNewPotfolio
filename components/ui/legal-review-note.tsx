export function LegalReviewNote({children}:{children:React.ReactNode}){
  return <aside className="legal-review-note"><strong>Owner / legal review required</strong><p>{children}</p></aside>;
}
