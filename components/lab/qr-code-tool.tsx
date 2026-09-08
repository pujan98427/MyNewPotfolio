"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import styles from "./simple-tools.module.css";
import { trackProductEvent } from "@/lib/analytics/product-events";
import { useMobileResultScroll } from "@/lib/lab/use-mobile-result-scroll";
import { buildQrPayload, qrContrastRatio as contrastRatio, type QrKind } from "@/lib/lab/qr-core";

type ErrorCorrection = "L" | "M" | "Q" | "H";
type SocialService = "instagram" | "facebook" | "linkedin" | "youtube" | "tiktok" | "x" | "whatsapp" | "github" | "pinterest" | "threads" | "custom";

const kindLabels: Record<QrKind, string> = { website: "Link", social: "Social", wifi: "Wi-Fi", text: "Text", email: "Email", phone: "Phone", sms: "Message", whatsapp: "WhatsApp", contact: "Contact" };
const contentTypes: readonly { kind: Exclude<QrKind, "whatsapp">; label: string }[] = [
  { kind: "website", label: "Link" }, { kind: "social", label: "Social" }, { kind: "wifi", label: "Wi-Fi" }, { kind: "text", label: "Text" }, { kind: "email", label: "Email" }, { kind: "phone", label: "Phone" }, { kind: "sms", label: "Message" }, { kind: "contact", label: "Contact" },
];
const socialServices: readonly { value: SocialService; label: string; placeholder: string }[] = [
  { value: "instagram", label: "Instagram", placeholder: "instagram.com/your-name" }, { value: "facebook", label: "Facebook", placeholder: "facebook.com/your-page" }, { value: "linkedin", label: "LinkedIn", placeholder: "linkedin.com/in/your-name" }, { value: "youtube", label: "YouTube", placeholder: "youtube.com/@your-channel" }, { value: "tiktok", label: "TikTok", placeholder: "tiktok.com/@your-name" }, { value: "x", label: "X", placeholder: "x.com/your-name" }, { value: "whatsapp", label: "WhatsApp", placeholder: "wa.me/447700900000" }, { value: "github", label: "GitHub", placeholder: "github.com/your-name" }, { value: "pinterest", label: "Pinterest", placeholder: "pinterest.com/your-name" }, { value: "threads", label: "Threads", placeholder: "threads.net/@your-name" }, { value: "custom", label: "Custom link", placeholder: "example.com/your-page" },
];

export function QrCodeTool() {
  const resultRef = useRef<HTMLElement>(null);
  const [kind, setKind] = useState<Exclude<QrKind, "whatsapp">>("website");
  const [socialService, setSocialService] = useState<SocialService>("instagram");
  const [value, setValue] = useState("");
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [wifiName, setWifiName] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [wifiSecurity, setWifiSecurity] = useState("WPA");
  const [wifiHidden, setWifiHidden] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [size, setSize] = useState(512);
  const [foreground, setForeground] = useState("#151515");
  const [background, setBackground] = useState("#ffffff");
  const [errorCorrection, setErrorCorrection] = useState<ErrorCorrection>("M");
  const [margin, setMargin] = useState(2);
  const [dataUrl, setDataUrl] = useState("");
  const [svg, setSvg] = useState("");
  const [encodedValue, setEncodedValue] = useState("");
  const [scanWarning, setScanWarning] = useState("");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const socialPreset = socialServices.find((service) => service.value === socialService) ?? socialServices[0];

  useMobileResultScroll(Boolean(dataUrl), resultRef);

  const resetResult = () => { setDataUrl(""); setSvg(""); setEncodedValue(""); setError(""); setScanWarning(""); };
  const selectKind = (nextKind: Exclude<QrKind, "whatsapp">) => { setKind(nextKind); resetResult(); };
  const payload = () => buildQrPayload({ kind, value, recipient, message, subject, wifiName, wifiPassword, wifiSecurity, wifiHidden, contactName, contactEmail, contactPhone });
  const generate = async () => {
    const content = payload();
    if (!content) { setError(kind === "wifi" ? "Enter the Wi-Fi network name." : kind === "contact" ? "Enter at least one contact detail." : ["email", "phone", "sms"].includes(kind) ? "Enter the recipient details." : kind === "social" ? `Enter the ${socialPreset.label} link.` : "Enter something for the QR code."); return; }
    if (content.length > 2000) { setError("Keep the QR content below 2,000 characters."); return; }
    setBusy(true); setError(""); setScanWarning(contrastRatio(foreground, background) < 3 ? "This colour combination may be difficult to scan. Try a darker QR colour." : "");
    try {
      const QRCode = await import("qrcode");
      const options = { errorCorrectionLevel: errorCorrection, margin, width: size, color: { dark: foreground, light: background } };
      setDataUrl(await QRCode.toDataURL(content, options)); setSvg(await QRCode.toString(content, { ...options, type: "svg" })); setEncodedValue(content); trackProductEvent("qr_generated", { qr_type: kind });
    } catch { setError("The QR code could not be created in this browser."); } finally { setBusy(false); }
  };
  const download = (content: string, name: string) => { const anchor = document.createElement("a"); anchor.href = content; anchor.download = name; anchor.click(); };
  const downloadSvg = () => { const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" })); download(url, "qr-code.svg"); trackProductEvent("qr_downloaded", { qr_type: kind, output_format: "svg" }); setTimeout(() => URL.revokeObjectURL(url), 0); };
  const clear = () => { setValue(""); setRecipient(""); setMessage(""); setSubject(""); setWifiName(""); setWifiPassword(""); setWifiHidden(false); setContactName(""); setContactEmail(""); setContactPhone(""); resetResult(); setCopied(false); };
  const copyEncoded = async () => { await navigator.clipboard.writeText(encodedValue); setCopied(true); setTimeout(() => setCopied(false), 1600); };
  const recipientField = (id: string, label: string, placeholder = "") => <div className={styles.field}><label htmlFor={id}>{label}</label><input id={id} type={kind === "email" ? "email" : "tel"} value={recipient} onChange={(event) => setRecipient(event.target.value)} placeholder={placeholder} /></div>;

  return <div className={styles.workspace} data-tool-processing={busy || undefined}>
    <p className={styles.privacy}>Your QR content is created in this browser. It is not sent to a server or saved.</p>
    <div className={styles.grid}>
      <section className={styles.panel}>
        <h2>What should the code contain?</h2>
        <fieldset className={styles.typeNavigation}><legend>Content type</legend><div>{contentTypes.map((type) => <button key={type.kind} type="button" aria-pressed={kind === type.kind} onClick={() => selectKind(type.kind)}>{type.label}</button>)}</div></fieldset>
        {kind === "website" && <div className={styles.field}><label htmlFor="qr-website">Website address</label><input id="qr-website" type="url" value={value} onChange={(event) => setValue(event.target.value)} placeholder="example.com" /></div>}
        {kind === "social" && <><div className={styles.field}><label htmlFor="qr-social-service">Social profile or page</label><select id="qr-social-service" value={socialService} onChange={(event) => { setSocialService(event.target.value as SocialService); setValue(""); resetResult(); }}>{socialServices.map((service) => <option key={service.value} value={service.value}>{service.label}</option>)}</select></div><div className={styles.field}><label htmlFor="qr-social-link">{socialPreset.label} link</label><input id="qr-social-link" type="url" value={value} onChange={(event) => setValue(event.target.value)} placeholder={socialPreset.placeholder} /><p className={styles.fieldHint}>This QR code stores the link only. It does not connect to {socialPreset.label}.</p></div></>}
        {kind === "text" && <div className={styles.field}><label htmlFor="qr-text">Text</label><textarea id="qr-text" value={value} onChange={(event) => setValue(event.target.value)} maxLength={2000} /></div>}
        {kind === "wifi" && <><div className={styles.field}><label htmlFor="wifi-name">Wi-Fi name</label><input id="wifi-name" value={wifiName} onChange={(event) => setWifiName(event.target.value)} placeholder="Home WiFi" autoComplete="off" /></div><div className={styles.field}><label htmlFor="wifi-password">Password</label><input id="wifi-password" type="password" value={wifiPassword} onChange={(event) => setWifiPassword(event.target.value)} disabled={wifiSecurity === "nopass"} autoComplete="new-password" /></div><div className={styles.field}><label htmlFor="wifi-security">Security</label><select id="wifi-security" value={wifiSecurity} onChange={(event) => setWifiSecurity(event.target.value)}><option value="WPA">WPA/WPA2</option><option value="WEP">WEP</option><option value="nopass">No password</option></select></div><label className={styles.check}><input type="checkbox" checked={wifiHidden} onChange={(event) => setWifiHidden(event.target.checked)} /> Hidden network</label></>}
        {kind === "email" && <>{recipientField("qr-email", "Email address")}<div className={styles.field}><label htmlFor="qr-subject">Subject (optional)</label><input id="qr-subject" value={subject} onChange={(event) => setSubject(event.target.value)} /></div><div className={styles.field}><label htmlFor="qr-email-message">Message (optional)</label><textarea id="qr-email-message" value={message} onChange={(event) => setMessage(event.target.value)} /></div></>}
        {kind === "phone" && recipientField("qr-phone", "Phone number", "+44 7700 900000")}
        {kind === "sms" && <>{recipientField("qr-sms", "Phone number", "+44 7700 900000")}<div className={styles.field}><label htmlFor="qr-sms-message">Message (optional)</label><textarea id="qr-sms-message" value={message} onChange={(event) => setMessage(event.target.value)} /></div></>}
        {kind === "contact" && <><div className={styles.field}><label htmlFor="contact-name">Name</label><input id="contact-name" value={contactName} onChange={(event) => setContactName(event.target.value)} /></div><div className={styles.field}><label htmlFor="contact-email">Email</label><input id="contact-email" type="email" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} /></div><div className={styles.field}><label htmlFor="contact-phone">Phone</label><input id="contact-phone" type="tel" value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} /></div></>}
        <div className={styles.row}><div className={styles.field}><label htmlFor="qr-foreground">QR colour</label><input id="qr-foreground" type="color" value={foreground} onChange={(event) => setForeground(event.target.value)} /></div><div className={styles.field}><label htmlFor="qr-background">Background</label><input id="qr-background" type="color" value={background} onChange={(event) => setBackground(event.target.value)} /></div><div className={styles.field}><label htmlFor="qr-size">Size</label><select id="qr-size" value={size} onChange={(event) => setSize(Number(event.target.value))}><option value="256">256 px</option><option value="512">512 px</option><option value="1024">1024 px</option></select></div></div>
        <details className={styles.advanced}><summary>Customise</summary><div className={styles.row}><div className={styles.field}><label htmlFor="qr-correction">Error correction</label><select id="qr-correction" value={errorCorrection} onChange={(event) => setErrorCorrection(event.target.value as ErrorCorrection)}><option value="L">Standard</option><option value="M">Balanced</option><option value="Q">High</option><option value="H">Maximum</option></select></div><div className={styles.field}><label htmlFor="qr-margin">Quiet-zone margin</label><select id="qr-margin" value={margin} onChange={(event) => setMargin(Number(event.target.value))}><option value="1">Compact</option><option value="2">Standard</option><option value="4">Wide</option></select></div></div></details>
        <div className={styles.actions}><button type="button" className={styles.button} onClick={generate} disabled={busy}>{busy ? "Creating…" : "Create QR"}</button><button type="button" className={styles.button} data-quiet onClick={clear}>Clear</button></div><p className={styles.status} data-error={Boolean(error)} role="status">{error}</p>
      </section>
      <section ref={resultRef} className={styles.panel}>
        <h2>QR code</h2>
        {dataUrl ? <><div className={styles.resultHero} role="status"><span className={styles.resultLabel}>{scanWarning ? "Check colours" : "Ready"}</span><strong className={styles.resultName}>{scanWarning ? "Review this QR code." : "Your QR code is ready."}</strong><span className={styles.resultMetric}>{size} × {size} px</span><p>{scanWarning || "Generated successfully with a clear quiet zone and practical contrast."}</p></div><div className={styles.preview}><Image unoptimized className={styles.qr} src={dataUrl} width={size} height={size} alt={`Generated ${kindLabels[kind]} QR code`} /></div><dl className={styles.stats}><div><dt>Type</dt><dd>{kindLabels[kind]}</dd></div>{kind === "social" && <div><dt>Link</dt><dd>{socialPreset.label}</dd></div>}{kind === "wifi" && <div><dt>Network</dt><dd>{wifiName}</dd></div>}<div><dt>Quiet zone</dt><dd>{margin} modules</dd></div><div><dt>Contrast</dt><dd>{contrastRatio(foreground, background).toFixed(1)}:1</dd></div></dl><div className={styles.encodedValue}><span>Encoded text</span><code>{encodedValue}</code><button type="button" className={styles.button} data-quiet onClick={() => void copyEncoded()}>{copied ? "Copied" : "Copy encoded text"}</button></div><div className={styles.actions}><button type="button" className={styles.button} aria-label="Download QR code as PNG" disabled={Boolean(scanWarning)} onClick={() => { download(dataUrl, "qr-code.png"); trackProductEvent("qr_downloaded", { qr_type: kind, output_format: "png" }); }}>Download</button><button type="button" className={styles.button} data-quiet disabled={Boolean(scanWarning)} onClick={downloadSvg}>Download SVG</button><button type="button" className={styles.button} data-quiet disabled={Boolean(scanWarning)} onClick={() => window.print()}>Print</button></div>{scanWarning && <p className={styles.status} data-error="true" role="alert">{scanWarning}</p>}<p>Test the code with your phone before publishing it.</p></> : <p>Your QR code will appear here.</p>}
      </section>
    </div>
  </div>;
}
