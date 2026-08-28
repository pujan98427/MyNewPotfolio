import { analyseManualHtml, analyseWebsite, normalizeWebsiteUrl } from "@/lib/web-doctor/analyse";
import { withAnalysisCache } from "@/lib/web-doctor/analysis-cache";
import type { WebDoctorStage, WebDoctorStreamEvent } from "@/lib/web-doctor/types/analysis";

export const runtime = "nodejs";
const attempts = new Map<string, { minuteCount:number; minuteReset:number; hourCount:number; hourReset:number }>();

function allowRequest(request: Request) {
  const now = Date.now();
  const ip = request.headers.get("x-real-ip") ?? request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  for(const [key,value] of attempts){if(key!==ip&&value.hourReset<=now)attempts.delete(key);}
  const entry = attempts.get(ip);
  if (!entry) { attempts.set(ip, { minuteCount:1, minuteReset:now+60_000, hourCount:1, hourReset:now+60*60_000 }); return true; }
  if(entry.minuteReset<=now){entry.minuteCount=0;entry.minuteReset=now+60_000;}if(entry.hourReset<=now){entry.hourCount=0;entry.hourReset=now+60*60_000;}
  if (entry.minuteCount >= 10 || entry.hourCount >= 60) return false;
  entry.minuteCount += 1;entry.hourCount += 1;
  return true;
}

function friendlyError(error: unknown) {
  if (error instanceof DOMException && (error.name === "TimeoutError" || error.name === "AbortError")) return "The website did not respond before the safety timeout. Try again shortly.";
  if (error instanceof TypeError && /fetch failed/i.test(error.message)) return "We could not connect to that website. Check the address or try again shortly.";
  const safeMessages=["Enter a website URL to analyse.","Enter a valid website address, such as example.com.","Only HTTP and HTTPS websites can be analysed.","URLs containing login credentials are not supported.","Only standard web ports 80 and 443 can be analysed.","Local and internal websites cannot be analysed.","Private, reserved and internal network addresses cannot be analysed.","That hostname could not be resolved.","DNS validation timed out.","This hostname does not resolve exclusively to public internet addresses.","The website returned an incomplete redirect.","The website redirected too many times.","The URL did not return an HTML webpage.","The response is too large to analyse safely.","The website returned an empty response.","The website requires authentication before it can be analysed.","The website refused automated access.","The website is temporarily limiting automated requests.","The website's server returned an error. Try again later.","The website's secure connection could not be verified.","We could not establish a reliable connection to that website.","The supplied HTML is too large to analyse.","The analysis request was not valid.","Too many checks were requested. Wait a minute and try again."];
  if(error instanceof Error&&safeMessages.includes(error.message))return error.message;
  return "The website could not be analysed safely. Check the address or try again shortly.";
}

function streamEvents(run: (emit: (event: WebDoctorStreamEvent) => void) => Promise<void>) {
  const encoder = new TextEncoder();
  return new Response(new ReadableStream({
    async start(controller) {
      const emit = (event: WebDoctorStreamEvent) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      try { await run(emit); }
      catch (error) { emit({ type: "error", error: friendlyError(error) }); }
      finally { controller.close(); }
    },
  }), { headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store, no-transform", "X-Content-Type-Options": "nosniff" } });
}

export async function POST(request: Request) {
  return streamEvents(async emit => {
    if (!allowRequest(request)) throw new Error("Too many checks were requested. Wait a minute and try again.");
    let body: { url?: unknown; html?: unknown; refresh?: unknown };
    try { body = await request.json() as typeof body; }
    catch { throw new Error("The analysis request was not valid."); }
    const progress = (stage: WebDoctorStage, message: string) => emit({ type: "progress", stage, message });

    if (typeof body.html === "string") {
      if (body.html.length > 3_000_000) throw new Error("The supplied HTML is too large to analyse.");
      const source = typeof body.url === "string" && body.url.trim() ? normalizeWebsiteUrl(body.url).toString() : "Manual HTML";
      progress("validating", "Validating pasted HTML");
      const report = await analyseManualHtml(body.html, source, progress);
      emit({ type: "result", report });
      return;
    }

    if (typeof body.url !== "string") throw new Error("Enter a website URL to analyse.");
    // Keep acquisition mode in the cache namespace so a future rendered
    // analysis can never be confused with the current source-HTML report.
    const cacheKey=`html:${normalizeWebsiteUrl(body.url).toString()}`;
    const bypassCache=body.refresh===true;
    if(bypassCache)progress("connecting","Starting a fresh website check");
    const report = await withAnalysisCache(cacheKey,()=>analyseWebsite(body.url as string,progress),status=>{if(status==="hit")progress("diagnosis","Using a recent cached diagnosis");if(status==="shared")progress("connecting","Joining the analysis already in progress");},{bypass:bypassCache});
    emit({ type: "result", report });
  });
}
