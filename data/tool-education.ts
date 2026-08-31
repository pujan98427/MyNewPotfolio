export type ToolEducation = {
  slug:string;
  summary:string;
  audience:string;
  howItWorks:string;
  steps:readonly string[];
  privacy:string;
  sections?:readonly {heading:string;body:string}[];
  commonProblems:readonly {title:string;body:string}[];
  related:readonly {href:string;label:string;description:string}[];
};

export const toolEducation:readonly ToolEducation[]=[
  {
    slug:"svg-base64-converter",
    summary:"The SVG to Base64 Converter turns readable SVG markup into a Base64 value or data URI, and decodes existing SVG Base64 back into editable XML. It handles Unicode text correctly and keeps both directions together in one focused workspace.",
    audience:"It helps frontend developers embedding small icons, designers handing off vector assets, email developers working within restrictive templates, and anyone inspecting an unfamiliar SVG data URI without installing a package or command-line tool.",
    howItWorks:"Encoding converts the SVG’s UTF-8 bytes into Base64 rather than applying btoa directly to JavaScript text, which would fail for many non-ASCII characters. Decoding reverses those bytes with a strict UTF-8 decoder, checks the size limit, and confirms that the result contains an SVG root before offering it as markup or a download.",
    steps:["Paste complete SVG markup or choose a local .svg file; the source should include an <svg> root element.","Select Encode to produce plain Base64 and a ready-to-use data:image/svg+xml;base64 URI.","For the reverse direction, paste either plain Base64 or a complete SVG Base64 data URI into the Decode field.","Review the decoded markup, copy only the format your implementation needs, and test the resulting asset in its actual context."],
    privacy:"Conversion happens entirely in your browser. Pasted markup, decoded data, and selected SVG files are not sent to the server, saved to an account, or added to Web Doctor history.",
    sections:[
      {heading:"What is SVG Base64 encoding?",body:"Base64 represents the UTF-8 bytes of an SVG document with a restricted set of text characters. The result can travel inside a data URI, CSS declaration, or HTML image source without referring to a separate file."},
      {heading:"How to convert SVG to Base64",body:"Paste complete SVG markup or choose an .svg file, then select Encode SVG. Copy raw Base64 when another system supplies the data-URI wrapper, or copy the complete data URI when you need a ready-to-use source."},
      {heading:"How to decode Base64 back to SVG",body:"Switch to Base64 → SVG and paste either raw Base64 or a complete SVG data URI. Decode it, review the readable XML, then copy the exact SVG source or download it as an .svg file."},
      {heading:"Base64 vs URL-encoded SVG",body:"Base64 is widely supported and predictable, but it usually makes SVG text larger. URL encoding keeps much of the SVG readable and can produce a smaller CSS data URI. Compare both advanced outputs in the context where you will use them."},
      {heading:"When should you embed SVG as Base64?",body:"Inline data is useful for small, self-contained graphics that belong to one component or document. Prefer a normal SVG file when artwork is large, reused across pages, changed independently, or should benefit from browser caching."},
      {heading:"Does this tool upload my SVG?",body:"No. Encoding, decoding, size calculations, formatting, and preview preparation run locally in your browser. Your SVG content is not submitted to this site or stored in an account."},
      {heading:"Common SVG Base64 problems",body:"Typical problems include copying raw Base64 where a complete data URI is expected, broken Unicode from naive btoa() conversion, unescaped # characters in CSS, incomplete SVG roots, and embedding files that are too large to be useful inline."},
    ],
    commonProblems:[
      {title:"Unicode is encoded incorrectly",body:"Direct btoa() calls cannot represent arbitrary Unicode. This tool encodes UTF-8 bytes so text, symbols, and international characters survive the round trip."},
      {title:"A complete data URI is used where Base64 is expected",body:"Some APIs want only the encoded payload; CSS and HTML image sources often accept the data URI. Copy the output that matches the receiving field."},
      {title:"Large artwork is embedded inline",body:"Base64 increases payload size and prevents an asset from being cached independently. Prefer a normal optimized SVG file when the asset is large, shared, or frequently reused."},
    ],
    related:[
      {href:"/lab/web-doctor",label:"Check a published page",description:"Inspect metadata, images, links, headings, and technical signals from a live URL."},
      {href:"/lab/meta-generator",label:"Meta Tag Generator",description:"Draft and copy accurate title and description markup for a web page."},
      {href:"/lab/contrast-checker",label:"Check SVG colour contrast",description:"Test foreground and background pairs used in icons or illustrations."},
      {href:"/lab/clamp-generator",label:"Generate fluid CSS",description:"Create bounded responsive values for interface sizing and spacing."},
    ],
  },
  {
    slug:"meta-generator",
    summary:"The Meta Tag Generator helps you draft a page title and meta description together, see how the pair reads in a search-style preview, and copy clean HTML without memorising tag syntax.",
    audience:"It is useful for site owners preparing a new page, developers checking metadata before release, and writers who want to judge whether a search result explains the destination clearly.",
    howItWorks:"Your text stays connected to the fields and preview in your browser. The tool counts Unicode characters, offers presentation guidance, escapes copied attribute values, and updates the snippet immediately. It does not predict rankings or guarantee that a search engine will display the supplied description.",
    steps:["Write a specific title that distinguishes this page from neighbouring pages.","Summarise what a visitor will actually find instead of listing search phrases.","Read the preview as one result, then revise vague or repeated wording.","Copy the HTML and place it in the document head, or translate the values into your framework’s metadata API."],
    privacy:"The title and description are processed in this browser session. They are not submitted to Web Doctor, stored in an account, or used to build an advertising profile.",
    commonProblems:[
      {title:"Every page uses the brand name only",body:"A brand-only title gives little context. Add the page’s real topic while keeping the site identity concise."},
      {title:"The description promises something the page does not contain",body:"Treat the description as an accurate invitation. Misleading copy may earn a click but creates a poor visit."},
      {title:"Character counts become the objective",body:"Counts are editing guidance, not ranking rules. Put clarity and the most useful information before arbitrary length targets."},
    ],
    related:[
      {href:"/lab/web-doctor",label:"Check published metadata",description:"Inspect the title and description returned by a live URL."},
      {href:"/lab/open-graph-preview",label:"Prepare social metadata",description:"Create the separate fields used by sharing platforms."},
      {href:"/guides/meta-descriptions",label:"Understand descriptions",description:"Learn when snippets are rewritten and how to write useful summaries."},
    ],
  },
  {
    slug:"contrast-checker",
    summary:"The Colour Contrast Checker compares a foreground and background colour and reports the mathematical contrast ratio used by WCAG text criteria.",
    audience:"It helps designers choosing palette combinations, developers reviewing CSS tokens, and content teams checking whether text remains readable before a design ships.",
    howItWorks:"Each colour is converted to relative luminance, then the lighter and darker values are compared using the WCAG contrast formula. Results are shown separately for normal text, large text, and enhanced AAA thresholds because one pass label does not cover every use.",
    steps:["Enter or choose the foreground colour used by the text.","Enter the exact background beneath it, including the resolved result of any design token.","Check the result that matches the intended text size and weight.","Test focus, hover, disabled, error, and visited states separately when their colours differ."],
    privacy:"Colour values are calculated locally in your browser. No palette, project name, screenshot, or design file is uploaded or retained.",
    commonProblems:[
      {title:"Testing the wrong background",body:"Transparent layers and gradients can change the final colour. Test the actual composited pair, especially over imagery."},
      {title:"Treating large-text AA as a universal pass",body:"The relaxed threshold applies only when the rendered text meets the relevant size and weight definition."},
      {title:"Using colour as the only signal",body:"A strong ratio does not replace labels, icons, patterns, or text that communicate status without relying on colour perception."},
    ],
    related:[
      {href:"/lab/web-doctor",label:"Inspect accessibility basics",description:"Check document language, image alternatives, headings, and viewport metadata."},
      {href:"/lab/clamp-generator",label:"Create fluid type sizes",description:"Generate bounded responsive values while preserving readable proportions."},
      {href:"/lab/meta-generator",label:"Draft page metadata",description:"Prepare accurate search-facing titles and descriptions."},
    ],
  },
  {
    slug:"clamp-generator",
    summary:"The CSS Clamp Generator creates a fluid CSS length that moves between chosen minimum and maximum values across a defined viewport range.",
    audience:"It is intended for frontend developers and designers building responsive typography, spacing, gaps, and component dimensions without stacking many small media queries.",
    howItWorks:"The tool calculates a linear slope between the two viewport boundaries, converts that slope into a viewport-width term, and combines it with an intercept. CSS clamp() then protects the result with the minimum and maximum limits you supplied.",
    steps:["Choose the smallest and largest values the property should reach.","Set the viewport widths where fluid scaling should start and stop.","Copy the generated clamp() declaration into the relevant CSS property.","Test intermediate widths and zoomed text; adjust the limits if the visual relationship stops being useful."],
    privacy:"All arithmetic happens locally. The values and generated CSS are not sent to a server or saved after the browser session.",
    commonProblems:[
      {title:"Minimum and maximum are reversed",body:"Decide whether the value should grow or shrink with the viewport and enter boundaries that describe that intention."},
      {title:"Viewport units are used without limits",body:"A bare vw value can become unusably small or large. clamp() keeps the fluid part inside deliberate bounds."},
      {title:"The formula replaces testing",body:"Fluid mathematics cannot judge line length, wrapping, zoom behaviour, or component constraints. Verify the result in the real layout."},
    ],
    related:[
      {href:"/lab/contrast-checker",label:"Check colour contrast",description:"Validate readable foreground and background combinations."},
      {href:"/lab/web-doctor",label:"Review a published page",description:"Inspect its mobile viewport, headings, metadata, and technical signals."},
      {href:"/writing/using-css-clamp-without-doing-the-maths-every-time",label:"Read the clamp implementation note",description:"See how bounded fluid values work and when a breakpoint is clearer."},
    ],
  },
  {
    slug:"open-graph-preview",
    summary:"The Open Graph Preview helps you compose social-sharing metadata and inspect a representative card before adding the tags to a page.",
    audience:"It is useful for publishers, portfolio owners, marketers, and developers who need shared links to identify the correct page without relying on a platform to invent the copy.",
    howItWorks:"The form maps your values to standard Open Graph properties and renders a neutral preview. It shows the relationship between the site, title, description, and image, but does not imitate or promise the exact interface of any particular social network.",
    steps:["Enter the canonical page URL and the title people should recognise when it is shared.","Add a concise description that remains truthful outside the page’s original context.","Provide a public HTTPS image URL with a stable landscape asset.","Copy the tags into the document head, publish the page, and use the destination platform’s debugger when one is available."],
    privacy:"Draft values are handled in the browser and are not uploaded. The preview does not request or proxy the supplied image URL, so private images are never fetched by this site.",
    commonProblems:[
      {title:"A relative image URL is supplied",body:"Sharing crawlers need an absolute public URL, including the HTTPS origin and full image path."},
      {title:"Important content sits against the image edge",body:"Platforms crop cards differently. Keep essential subjects and text away from the outer safe area."},
      {title:"The preview is treated as a guarantee",body:"Platforms cache, crop, rewrite, or omit metadata. The preview is an editing aid, not an affiliation or exact reproduction."},
    ],
    related:[
      {href:"/lab/web-doctor",label:"Inspect live Open Graph tags",description:"See which social fields a published page actually returns."},
      {href:"/guides/open-graph",label:"Read the Open Graph guide",description:"Understand images, URLs, fallbacks, and platform caching."},
      {href:"/lab/meta-generator",label:"Prepare search metadata",description:"Draft the separate title and description used for search contexts."},
    ],
  },
];

export function getToolEducation(slug:string){return toolEducation.find(item=>item.slug===slug);}
