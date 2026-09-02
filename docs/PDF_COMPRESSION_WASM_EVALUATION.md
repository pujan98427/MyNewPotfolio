# PDF compression WASM evaluation

Last reviewed: 2 September 2026

## Decision

Do not ship a Ghostscript/WebAssembly compressor yet.

Ghostscript itself is mature, but Artifex does not currently publish a first-party browser package for this use case. The browser wrappers reviewed are community-maintained and use AGPL licensing. Adding one without a licensing decision, a dependency-security review, and representative browser tests would not meet this project's production-quality requirement.

The current PDF Compressor therefore remains deliberately limited to safe structural compaction with `pdf-lib`. Its page copy states that embedded images are not recompressed. It does not claim meaningful savings for scanned or image-heavy PDFs, and it keeps the original whenever the candidate is not smaller enough.

## Candidates reviewed

| Candidate | Finding | Decision |
| --- | --- | --- |
| Artifex Ghostscript / GhostPDL | Proven PDF interpreter and `pdfwrite` output device, but distributed as native source/releases rather than an official browser SDK. AGPL or commercial licensing applies. | Suitable engine, but no approved first-party browser integration. |
| `@okathira/ghostpdl-wasm` | Community Emscripten build with npm provenance and a virtual filesystem API. | Best technical candidate for a prototype; not approved for production without licence and security review. |
| `@bentopdf/gs-wasm` | Community Ghostscript WASM package, explicitly unaffiliated with Artifex and AGPL-licensed. | Do not add silently to this portfolio. |
| `ghostscript-pdf-compress.wasm` | Demonstrates worker-based local compression, but is a small community project built on another compiled WASM artifact. | Useful reference, insufficient maintenance and supply-chain assurance for production. |
| Artifex MuPDF.js | Official, maintained browser/WASM library. | Strong PDF toolkit, but the reviewed API did not establish the image-downsampling compression workflow required here. |

## Production acceptance gate

Before enabling meaningful PDF compression, all of these must be true:

1. The owner accepts the dependency's AGPL obligations or obtains an appropriate commercial licence.
2. The exact package and WASM checksum are pinned; no runtime CDN dependency is used.
3. The worker is imported only by `/lab/pdf-compressor`, after the visitor presses **Compress PDF**.
4. The WASM asset uses a versioned, immutable cache path. The application shell must not preload it.
5. Input and output buffers are transferred to a dedicated Web Worker instead of copied where the API permits.
6. Each run uses unique virtual-filesystem paths and removes every temporary input/output file in `finally`.
7. The worker can be terminated, pending jobs rejected, and generated object URLs revoked on replacement, clear, navigation, and unmount.
8. File-size and memory limits are enforced before allocation, with understandable out-of-memory and unsupported-PDF errors.
9. Password-protected, malformed, zero-page, scanned, vector-heavy, and mixed-content fixtures are tested.
10. Chromium, Firefox, Safari, iOS Safari, Android Chrome, reduced-memory devices, cancellation, repeated runs, and route navigation are tested for leaks.
11. Output pages are visually compared with their inputs. A smaller file is never reported when output is larger or damaged.
12. The production bundle report proves that the worker and WASM are absent from homepage and `/lab` initial chunks.

## Intended route-isolated design

```text
/lab/pdf-compressor client UI
        |
        | user selects Compress PDF
        v
dynamic import of pdf-compressor.worker.ts
        |
        | transferable ArrayBuffer + selected preset
        v
dedicated worker -> lazy WASM init -> virtual FS -> Ghostscript
        |
        | transferable result buffer
        v
result Blob -> one revocable object URL -> download
```

The worker lifecycle must be owned by the compressor component, not the global layout or Lab index. The integration must expose cancellation and cleanup rather than leaving a singleton worker or virtual files behind.

## Preset mapping to validate

Ghostscript's `/screen`, `/ebook`, `/printer`, and `/prepress` presets are starting points, not user-facing guarantees. Before shipping, the three plain-language choices—Smallest file, Balanced, and Best quality—must be mapped using fixture-based output tests. The UI must continue to report measured sizes rather than predicted savings.

## Current user-facing behaviour

Until the gate above is passed, the compressor:

- processes the selected PDF locally;
- lazy-loads `pdf-lib` only inside the PDF tool;
- compacts document structure without image downsampling;
- keeps the original when the output is not meaningfully smaller;
- releases replaced and cleared result object URLs; and
- accurately explains this limitation in the interface.

