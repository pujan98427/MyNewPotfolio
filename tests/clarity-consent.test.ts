import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { isClarityEnabled, normalizeClarityProjectId } from "../lib/analytics/clarity-config.ts";

assert.equal(normalizeClarityProjectId(undefined), "");
assert.equal(normalizeClarityProjectId(""), "");
assert.equal(normalizeClarityProjectId("  abc123  "), "abc123");
assert.equal(normalizeClarityProjectId("not/a/project"), "");
assert.equal(normalizeClarityProjectId("a".repeat(65)), "");
assert.equal(isClarityEnabled(undefined), false);
assert.equal(isClarityEnabled("false"), false);
assert.equal(isClarityEnabled(" true "), true);

const component = readFileSync("components/analytics/clarity-consent.tsx", "utf8");
const layout = readFileSync("app/layout.tsx", "utf8");
const config = readFileSync("next.config.ts", "utf8");
const privacy = readFileSync("app/privacy/page.tsx", "utf8");
const cookies = readFileSync("app/cookies/page.tsx", "utf8");
const contact = readFileSync("components/contact/contact-form.tsx", "utf8");
const environmentExample = readFileSync(".env.example", "utf8");

assert.match(component, /choice === "accepted" && <Script/);
assert.match(component, /https:\/\/www\.clarity\.ms\/tag\/\$\{projectId\}/);
assert.match(component, /"consentv2"/);
assert.match(component, /ad_Storage: "denied"/);
assert.match(component, /analytics_Storage: choice === "accepted" \? "granted" : "denied"/);
assert.match(component, /Accept analytics/);
assert.match(component, /Reject analytics/);
assert.doesNotMatch(component, /dangerouslySetInnerHTML/);
assert.match(layout, /clarityEnabled&&<ClarityConsent projectId=\{clarityProjectId\}/);
assert.match(layout, /NEXT_PUBLIC_MICROSOFT_CLARITY_ENABLED/);
assert.match(config, /clarityEnabled\?/);
assert.match(config, /https:\/\/www\.clarity\.ms/);
assert.match(config, /https:\/\/c\.bing\.com/);
assert.match(contact, /data-clarity-mask="true"/);
assert.match(privacy, /Microsoft Clarity is optional/);
assert.match(cookies, /Clarity waits for permission/);
assert.match(environmentExample, /^NEXT_PUBLIC_MICROSOFT_CLARITY_ENABLED=false$/m);

console.log("Microsoft Clarity consent and privacy checks passed.");
