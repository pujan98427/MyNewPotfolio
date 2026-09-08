"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AtSign, Camera, Check, Link as LinkIcon, MessageCircle, MoreHorizontal, Music2, Pin, Play, Send } from "lucide-react";
import styles from "./simple-tools.module.css";
import { trackProductEvent } from "@/lib/analytics/product-events";
import { useMobileResultScroll } from "@/lib/lab/use-mobile-result-scroll";
import { buildQrPayload, qrContrastRatio as contrastRatio, socialProfilePrefix, type QrKind, type SocialService } from "@/lib/lab/qr-core";

type ErrorCorrection = "L" | "M" | "Q" | "H";
type CaptionPreset = "" | "visit" | "follow" | "connect" | "menu" | "learn" | "contact" | "custom";

const kindLabels: Record<QrKind, string> = { website: "Link", social: "Social", wifi: "Wi-Fi", text: "Text", email: "Email", phone: "Phone", sms: "Message", whatsapp: "WhatsApp", contact: "Contact" };
const contentTypes: readonly { kind: Exclude<QrKind, "whatsapp">; label: string }[] = [
  { kind: "website", label: "Link" }, { kind: "social", label: "Social" }, { kind: "wifi", label: "Wi-Fi" }, { kind: "text", label: "Text" }, { kind: "email", label: "Email" }, { kind: "phone", label: "Phone" }, { kind: "sms", label: "Message" }, { kind: "contact", label: "Contact" },
];
const socialServices: readonly { value: SocialService; label: string; placeholder: string }[] = [
  { value: "instagram", label: "Instagram", placeholder: "instagram.com/your-name" }, { value: "facebook", label: "Facebook", placeholder: "facebook.com/your-page" }, { value: "linkedin", label: "LinkedIn", placeholder: "linkedin.com/in/your-name" }, { value: "youtube", label: "YouTube", placeholder: "youtube.com/@your-channel" }, { value: "tiktok", label: "TikTok", placeholder: "tiktok.com/@your-name" }, { value: "x", label: "X", placeholder: "x.com/your-name" }, { value: "whatsapp", label: "WhatsApp", placeholder: "wa.me/447700900000" }, { value: "github", label: "GitHub", placeholder: "github.com/your-name" }, { value: "pinterest", label: "Pinterest", placeholder: "pinterest.com/your-name" }, { value: "threads", label: "Threads", placeholder: "threads.net/@your-name" }, { value: "custom", label: "Custom link", placeholder: "example.com/your-page" },
];
const primarySocialServices: readonly SocialService[] = ["instagram", "facebook", "linkedin", "youtube", "tiktok", "whatsapp"];
const captionPresets: Record<Exclude<CaptionPreset, "" | "custom">, string> = { visit: "Scan to visit", follow: "Scan to follow", connect: "Scan to connect", menu: "Scan to view menu", learn: "Scan to learn more", contact: "Scan to contact us" };
const qrColourPresets = [
  { label: "Black", value: "#151515" },
  { label: "Pujan red", value: "#E45447" },
  { label: "Navy", value: "#172554" },
] as const;
const normalizeHex = (value: string) => { const compact = value.trim().replace(/^#/, ""); return /^[0-9a-f]{6}$/i.test(compact) ? `#${compact.toUpperCase()}` : null; };
const filenamePart = (value: string) => value.trim().split("/").filter(Boolean).at(-1)?.replace(/^@/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") ?? "";
const qrFilenameBase = (kind: QrKind, socialService: SocialService, value: string) => kind === "social" ? `${filenamePart(value) || socialService}-${socialService}-qr` : `${kind === "website" ? "website" : kind}-qr`;

function SocialServiceIcon({ service }: { service: SocialService }) {
  if (service === "instagram") return <Camera aria-hidden="true" />;
  if (service === "youtube") return <Play aria-hidden="true" />;
  if (service === "tiktok") return <Music2 aria-hidden="true" />;
  if (service === "whatsapp") return <Send aria-hidden="true" />;
  if (service === "pinterest") return <Pin aria-hidden="true" />;
  if (service === "custom") return <LinkIcon aria-hidden="true" />;
  if (service === "facebook" || service === "threads") return <MessageCircle aria-hidden="true" />;
  return <AtSign aria-hidden="true" />;
}

function socialScanInstruction(service: SocialService, label: string) {
  if (service === "instagram") return "Scan to open Instagram.";
  if (service === "facebook") return "Scan to view the Facebook page.";
  if (service === "linkedin") return "Scan to open LinkedIn.";
  return `Scan to visit this ${label.toLowerCase()} profile.`;
}

export function QrCodeTool() {
  const resultRef = useRef<HTMLElement>(null);
  const [kind, setKind] = useState<Exclude<QrKind, "whatsapp">>("website");
  const [socialService, setSocialService] = useState<SocialService>("instagram");
  const [showMoreSocialServices, setShowMoreSocialServices] = useState(false);
  const [captionPreset, setCaptionPreset] = useState<CaptionPreset>("");
  const [customCaption, setCustomCaption] = useState("");
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
  const [foregroundHex, setForegroundHex] = useState("#151515");
  const [backgroundHex, setBackgroundHex] = useState("#FFFFFF");
  const [foregroundHexError, setForegroundHexError] = useState("");
  const [backgroundHexError, setBackgroundHexError] = useState("");
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
  const caption = captionPreset === "custom" ? customCaption.trim() : captionPreset ? captionPresets[captionPreset] : "";
  // This colour combination may be difficult to scan: keep the warning language clear and testable.
  const contrast = contrastRatio(foreground, background);
  const contrastIsCritical = contrast < 1.5;
  const filenameBase = qrFilenameBase(kind, socialService, value);
  const previewPayload = buildQrPayload({ kind, value, socialService, recipient, message, subject, wifiName, wifiPassword, wifiSecurity, wifiHidden, contactName, contactEmail, contactPhone });

  useMobileResultScroll(Boolean(dataUrl), resultRef);

  useEffect(() => {
    if (!previewPayload) return;
    let active = true;
    const options = { errorCorrectionLevel: errorCorrection, margin, width: size, color: { dark: foreground, light: background } };
    void (async () => {
      try {
        const QRCode = await import("qrcode");
        const [nextDataUrl, nextSvg] = await Promise.all([QRCode.toDataURL(previewPayload, options), QRCode.toString(previewPayload, { ...options, type: "svg" })]);
        if (!active) return;
        setDataUrl(nextDataUrl); setSvg(nextSvg); setEncodedValue(previewPayload); setError(""); setScanWarning(contrast < 3 ? "This QR may be difficult to scan. Try making the QR darker or the background lighter." : "");
      } catch {
        if (active) setError("The QR preview could not be updated in this browser.");
      }
    })();
    return () => { active = false; };
  }, [background, contrast, errorCorrection, foreground, margin, previewPayload, size]);

  const resetResult = () => { setDataUrl(""); setSvg(""); setEncodedValue(""); setError(""); setScanWarning(""); };
  const selectKind = (nextKind: Exclude<QrKind, "whatsapp">) => { setKind(nextKind); if (nextKind === "social") setValue("pujanchapagain7"); resetResult(); };
  const selectSocialService = (nextService: SocialService) => { setSocialService(nextService); setValue(nextService === "instagram" ? "pujanchapagain7" : ""); setShowMoreSocialServices(!primarySocialServices.includes(nextService)); resetResult(); };
  const updateHex = (value: string, setDraft: (next: string) => void, setColour: (next: string) => void, setValidationError: (next: string) => void) => { setDraft(value); const normalized = normalizeHex(value); if (normalized) { setColour(normalized.toLowerCase()); setValidationError(""); } };
  const validateHex = (value: string, setDraft: (next: string) => void, setValidationError: (next: string) => void) => { const normalized = normalizeHex(value); if (!normalized) { setValidationError("Enter a six-digit HEX colour, such as #E45447."); return; } setDraft(normalized); setValidationError(""); };
  const generate = async () => {
    const content = previewPayload;
    if (!content) { setError(kind === "wifi" ? "Enter the Wi-Fi network name." : kind === "contact" ? "Enter at least one contact detail." : ["email", "phone", "sms"].includes(kind) ? "Enter the recipient details." : kind === "social" ? `Enter the ${socialPreset.label} link.` : "Enter something for the QR code."); return; }
    if (content.length > 2000) { setError("Keep the QR content below 2,000 characters."); return; }
    setBusy(true); setError(""); setScanWarning(contrast < 3 ? "This QR may be difficult to scan. Try making the QR darker or the background lighter." : "");
    try {
      setEncodedValue(content); trackProductEvent("qr_generated", { qr_type: kind });
    } catch { setError("The QR code could not be created in this browser."); } finally { setBusy(false); }
  };
  const download = (content: string, name: string) => { const anchor = document.createElement("a"); anchor.href = content; anchor.download = name; anchor.click(); };
  const downloadSvg = () => { const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" })); download(url, `${filenameBase}.svg`); trackProductEvent("qr_downloaded", { qr_type: kind, output_format: "svg" }); setTimeout(() => URL.revokeObjectURL(url), 0); };
  const downloadCard = () => { if (!dataUrl || !caption) return; const image = new window.Image(); image.onload = () => { const padding = Math.max(32, Math.round(size * .08)), qrSize = size, captionHeight = Math.max(112, Math.round(size * .22)), canvas = document.createElement("canvas"), context = canvas.getContext("2d"); if (!context) return; canvas.width = qrSize + padding * 2; canvas.height = qrSize + padding * 2 + captionHeight; context.fillStyle = "#ffffff"; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(image, padding, padding, qrSize, qrSize); context.fillStyle = "#151515"; context.font = `600 ${Math.max(20, Math.round(size * .052))}px system-ui, sans-serif`; context.textAlign = "center"; context.textBaseline = "middle"; const words = caption.split(/\s+/), lines: string[] = [], maxWidth = canvas.width - padding * 2; let line = ""; for (const word of words) { const candidate = line ? `${line} ${word}` : word; if (context.measureText(candidate).width > maxWidth && line) { lines.push(line); line = word; } else line = candidate; } if (line) lines.push(line); const lineHeight = Math.max(26, Math.round(size * .065)), startY = qrSize + padding + captionHeight / 2 - ((lines.length - 1) * lineHeight) / 2; lines.forEach((lineText, index) => context.fillText(lineText, canvas.width / 2, startY + index * lineHeight)); download(canvas.toDataURL("image/png"), `${filenameBase}-card.png`); trackProductEvent("qr_downloaded", { qr_type: kind, output_format: "card" }); }; image.src = dataUrl; };
  const clear = () => { setValue(""); setRecipient(""); setMessage(""); setSubject(""); setWifiName(""); setWifiPassword(""); setWifiHidden(false); setContactName(""); setContactEmail(""); setContactPhone(""); setCaptionPreset(""); setCustomCaption(""); resetResult(); setCopied(false); };
  const copyEncoded = async () => { await navigator.clipboard.writeText(encodedValue); setCopied(true); setTimeout(() => setCopied(false), 1600); };
  const recipientField = (id: string, label: string, placeholder = "") => <div className={styles.field}><label htmlFor={id}>{label}</label><input id={id} type={kind === "email" ? "email" : "tel"} value={recipient} onChange={(event) => setRecipient(event.target.value)} placeholder={placeholder} /></div>;

  return <div className={styles.workspace} data-tool-processing={busy || undefined}>
    <p className={styles.privacy}>Your QR content is created in this browser. It is not sent to a server or saved.</p>
    <div className={`${styles.grid} ${styles.qrWorkspace}`}>
      <section className={styles.panel}>
        <h2>What should the code contain?</h2>
        <fieldset className={styles.typeNavigation}><legend>Content type</legend><div>{contentTypes.map((type) => <button key={type.kind} type="button" aria-pressed={kind === type.kind} onClick={() => selectKind(type.kind)}>{type.label}</button>)}</div></fieldset>
        {kind === "website" && <div className={styles.field}><label htmlFor="qr-website">Website address</label><input id="qr-website" type="url" value={value} onChange={(event) => setValue(event.target.value)} placeholder="example.com" /></div>}
        {kind === "social" && <><fieldset className={styles.socialServices}><legend>Where should your QR open?</legend><div>{socialServices.filter((service) => primarySocialServices.includes(service.value) || (showMoreSocialServices && !primarySocialServices.includes(service.value))).map((service) => <button key={service.value} type="button" aria-pressed={socialService === service.value} onClick={() => selectSocialService(service.value)}><SocialServiceIcon service={service.value} /><span>{service.label}</span>{socialService === service.value && <><Check className={styles.selectedServiceCheck} aria-hidden="true" /><span className="sr-only">Selected</span></>}</button>)}<button type="button" aria-expanded={showMoreSocialServices} onClick={() => setShowMoreSocialServices((shown) => !shown)}><MoreHorizontal aria-hidden="true" /><span>{showMoreSocialServices ? "Less" : "More"}</span></button></div></fieldset><div className={styles.field}><label htmlFor="qr-social-link">{socialPreset.label} profile</label><div className={styles.profileInput}><span>{socialProfilePrefix(socialService)}</span><input id="qr-social-link" type="text" inputMode="url" value={value} onChange={(event) => setValue(event.target.value)} placeholder={socialPreset.placeholder} aria-describedby="qr-social-link-hint" /></div><p id="qr-social-link-hint" className={styles.fieldHint}>Enter a username, or paste the full profile link if its format is different.</p></div></>}
        {kind === "text" && <div className={styles.field}><label htmlFor="qr-text">Text</label><textarea id="qr-text" value={value} onChange={(event) => setValue(event.target.value)} maxLength={2000} /></div>}
        {kind === "wifi" && <><div className={styles.field}><label htmlFor="wifi-name">Wi-Fi name</label><input id="wifi-name" value={wifiName} onChange={(event) => setWifiName(event.target.value)} placeholder="Home WiFi" autoComplete="off" /></div><div className={styles.field}><label htmlFor="wifi-password">Password</label><input id="wifi-password" type="password" value={wifiPassword} onChange={(event) => setWifiPassword(event.target.value)} disabled={wifiSecurity === "nopass"} autoComplete="new-password" /></div><div className={styles.field}><label htmlFor="wifi-security">Security</label><select id="wifi-security" value={wifiSecurity} onChange={(event) => setWifiSecurity(event.target.value)}><option value="WPA">WPA/WPA2</option><option value="WEP">WEP</option><option value="nopass">No password</option></select></div><label className={styles.check}><input type="checkbox" checked={wifiHidden} onChange={(event) => setWifiHidden(event.target.checked)} /> Hidden network</label></>}
        {kind === "email" && <>{recipientField("qr-email", "Email address")}<div className={styles.field}><label htmlFor="qr-subject">Subject (optional)</label><input id="qr-subject" value={subject} onChange={(event) => setSubject(event.target.value)} /></div><div className={styles.field}><label htmlFor="qr-email-message">Message (optional)</label><textarea id="qr-email-message" value={message} onChange={(event) => setMessage(event.target.value)} /></div></>}
        {kind === "phone" && recipientField("qr-phone", "Phone number", "+44 7700 900000")}
        {kind === "sms" && <>{recipientField("qr-sms", "Phone number", "+44 7700 900000")}<div className={styles.field}><label htmlFor="qr-sms-message">Message (optional)</label><textarea id="qr-sms-message" value={message} onChange={(event) => setMessage(event.target.value)} /></div></>}
        {kind === "contact" && <><div className={styles.field}><label htmlFor="contact-name">Name</label><input id="contact-name" value={contactName} onChange={(event) => setContactName(event.target.value)} /></div><div className={styles.field}><label htmlFor="contact-email">Email</label><input id="contact-email" type="email" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} /></div><div className={styles.field}><label htmlFor="contact-phone">Phone</label><input id="contact-phone" type="tel" value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} /></div></>}
        <details className={styles.advanced}><summary>Add a caption</summary><div className={styles.field}><label htmlFor="qr-caption">Caption</label><select id="qr-caption" value={captionPreset} onChange={(event) => setCaptionPreset(event.target.value as CaptionPreset)}><option value="">No caption</option><option value="visit">Scan to visit</option><option value="follow">Scan to follow</option><option value="connect">Scan to connect</option><option value="menu">Scan to view menu</option><option value="learn">Scan to learn more</option><option value="contact">Scan to contact us</option><option value="custom">Write my own</option></select>{captionPreset === "custom" && <input aria-label="Custom QR card caption" value={customCaption} maxLength={100} onChange={(event) => setCustomCaption(event.target.value)} placeholder="Follow us on Instagram" />}</div><p className={styles.fieldHint}>The caption appears on the QR card. The QR itself still only opens the destination.</p></details>
        <div className={styles.row}><div className={styles.field}><label htmlFor="qr-foreground">QR colour</label><div className={styles.colourControl}><input id="qr-foreground" type="color" value={foreground} onChange={(event) => { setForeground(event.target.value); setForegroundHex(event.target.value.toUpperCase()); setForegroundHexError(""); }} /><input type="text" aria-label="QR colour HEX value" value={foregroundHex} onChange={(event) => updateHex(event.target.value, setForegroundHex, setForeground, setForegroundHexError)} onBlur={() => validateHex(foregroundHex, setForegroundHex, setForegroundHexError)} aria-invalid={Boolean(foregroundHexError)} aria-describedby="qr-foreground-error" spellCheck={false} /></div>{foregroundHexError && <p id="qr-foreground-error" className={styles.fieldError} role="alert">{foregroundHexError}</p>}</div><div className={styles.field}><label htmlFor="qr-background">Background</label><div className={styles.colourControl}><input id="qr-background" type="color" value={background} onChange={(event) => { setBackground(event.target.value); setBackgroundHex(event.target.value.toUpperCase()); setBackgroundHexError(""); }} /><input type="text" aria-label="Background colour HEX value" value={backgroundHex} onChange={(event) => updateHex(event.target.value, setBackgroundHex, setBackground, setBackgroundHexError)} onBlur={() => validateHex(backgroundHex, setBackgroundHex, setBackgroundHexError)} aria-invalid={Boolean(backgroundHexError)} aria-describedby="qr-background-error" spellCheck={false} /></div>{backgroundHexError && <p id="qr-background-error" className={styles.fieldError} role="alert">{backgroundHexError}</p>}</div><div className={styles.field}><label htmlFor="qr-size">Size</label><select id="qr-size" value={size} onChange={(event) => setSize(Number(event.target.value))}><option value="256">256 px</option><option value="512">512 px</option><option value="1024">1024 px</option></select></div></div>
        <fieldset className={styles.colourPresets}><legend>QR colour presets</legend><div>{qrColourPresets.map((preset) => <button key={preset.value} type="button" aria-pressed={foreground.toUpperCase() === preset.value} onClick={() => { setForeground(preset.value.toLowerCase()); setForegroundHex(preset.value); setForegroundHexError(""); }}><i style={{ backgroundColor: preset.value }} aria-hidden="true" /><span>{preset.label}</span>{foreground.toUpperCase() === preset.value && <><Check aria-hidden="true" /><span className="sr-only">Selected</span></>}</button>)}<button type="button" aria-pressed={!qrColourPresets.some((preset) => foreground.toUpperCase() === preset.value)} onClick={() => document.getElementById("qr-foreground")?.focus()}><i className={styles.customColourSwatch} aria-hidden="true" /><span>Custom</span>{!qrColourPresets.some((preset) => foreground.toUpperCase() === preset.value) && <><Check aria-hidden="true" /><span className="sr-only">Selected</span></>}</button></div></fieldset>
        <details className={`${styles.advanced} ${styles.qrExamples}`}><summary>Example</summary><dl><div><dt>Instagram</dt><dd>Scan to follow</dd></div><div><dt>Restaurant</dt><dd>Scan to view menu</dd></div><div><dt>Portfolio</dt><dd>Scan to visit</dd></div><div><dt>Wi-Fi</dt><dd>Scan to connect</dd></div></dl><p className={styles.fieldHint}>These are examples of a QR card caption. Add your own destination above.</p></details>
        <details className={styles.advanced}><summary>Customise</summary><div className={styles.row}><div className={styles.field}><label htmlFor="qr-correction">Error correction</label><select id="qr-correction" value={errorCorrection} onChange={(event) => setErrorCorrection(event.target.value as ErrorCorrection)}><option value="L">Standard</option><option value="M">Balanced</option><option value="Q">High</option><option value="H">Maximum</option></select></div><div className={styles.field}><label htmlFor="qr-margin">Quiet-zone margin</label><select id="qr-margin" value={margin} onChange={(event) => setMargin(Number(event.target.value))}><option value="1">Compact</option><option value="2">Standard</option><option value="4">Wide</option></select></div></div></details>
        <div className={styles.actions}><button type="button" className={styles.button} onClick={generate} disabled={busy}>{busy ? "Creating…" : "Create QR"}</button><button type="button" className={styles.button} data-quiet onClick={clear}>Clear</button></div><p className={styles.status} data-error={Boolean(error)} role="status">{error}</p>
      </section>
      <section ref={resultRef} className={`${styles.panel} ${styles.qrPreviewPanel}`}>
        <h2>Preview</h2>
        {dataUrl && previewPayload ? <>
          <div className={styles.resultHero} role="status">
            <span className={styles.resultLabel}>{scanWarning ? "Check colours" : "Your QR is ready"}</span>
            <strong className={styles.resultName}>{scanWarning ? "Review this QR code." : kind === "social" ? socialPreset.label : kindLabels[kind]}</strong>
            <span className={styles.resultMetric}>{size} × {size} px</span>
            <p>{scanWarning || (kind === "social" ? socialScanInstruction(socialService, socialPreset.label) : "Generated successfully with a clear quiet zone and practical contrast.")}</p>
          </div>
          <div className={styles.preview}><div className={styles.qrCard}><Image unoptimized className={styles.qr} src={dataUrl} width={size} height={size} alt={`Generated ${kindLabels[kind]} QR code`} />{caption && <p>{caption}</p>}</div></div>
          <dl className={styles.stats}><div><dt>Type</dt><dd>{kindLabels[kind]}</dd></div>{kind === "social" && <div><dt>Service</dt><dd>{socialPreset.label}</dd></div>}{kind === "wifi" && <div><dt>Network</dt><dd>{wifiName}</dd></div>}<div><dt>Quiet zone</dt><dd>{margin} modules</dd></div><div><dt>Contrast</dt><dd>{contrast.toFixed(1)}:1</dd></div></dl>
          <div className={styles.encodedValue}><span>{kind === "website" || kind === "social" ? "Link" : "Encoded text"}</span><code>{encodedValue}</code><button type="button" className={styles.button} data-quiet onClick={() => void copyEncoded()}>{copied ? "Copied" : kind === "website" || kind === "social" ? "Copy link" : "Copy encoded text"}</button></div>
          <div className={styles.downloadChoices}><div><button type="button" className={styles.button} aria-label="Download QR code as PNG" disabled={contrastIsCritical} onClick={() => { download(dataUrl, `${filenameBase}.png`); trackProductEvent("qr_downloaded", { qr_type: kind, output_format: "png" }); }}>Download PNG</button><small>Best for sharing and everyday use.</small></div><div><button type="button" className={styles.button} data-quiet disabled={contrastIsCritical || !caption} onClick={downloadCard}>Download QR card</button><small>{caption ? "Includes your caption and is ready to print or share." : "Add a caption to make a ready-to-share QR card."}</small></div></div>
          <div className={styles.actions}><button type="button" className={styles.button} data-quiet disabled={contrastIsCritical} onClick={downloadSvg}>Download SVG</button><button type="button" className={styles.button} data-quiet disabled={contrastIsCritical} onClick={() => window.print()}>Print</button></div>
          {scanWarning && <div className={styles.contrastWarning} role="alert"><span className={styles.contrastSwatches} aria-label={`QR colour ${foregroundHex}; background ${backgroundHex}`}><i style={{ backgroundColor: foreground }} /><code>{foregroundHex}</code><i style={{ backgroundColor: background }} /><code>{backgroundHex}</code></span><p>{scanWarning}</p></div>}
          <p>Test the code with your phone before publishing it.</p>
        </> : <p>Your QR code will appear here.</p>}
      </section>
    </div>
  </div>;
}
