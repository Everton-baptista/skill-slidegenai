# Website evidence and image acquisition

Use when a website informs the presentation or provides relevant original assets. Work with the tools actually exposed in the current session. This guide does not add network access, an uploader or a slide editor to a host.

## Distinguish the stages

1. **Read content:** a text-extraction tool can establish statements, names and links. It may discard CSS, image markup and layout.
2. **Inspect appearance:** a rendered browser/screenshot or accessible stylesheet can establish visible colors, layout and typography within its actual scope.
3. **Acquire an asset:** obtain a usable image's bytes or a supported import URL and inspect its contents.
4. **Import it:** transfer that asset through the editor's documented image/upload mechanism.

A failure at one stage does not prove that all stages are impossible. Identify the specific gap rather than saying “the skill only works with screenshots” or asking the user to supply every asset immediately.

## Find the available route

| Available capability | Useful action | Boundary |
| --- | --- | --- |
| Rendered browser with DOM/computed style access | Inspect the relevant hero/content sections, actual font/color values, image `currentSrc`/`srcset` and CSS backgrounds | Use documented browser tools; screenshots alone do not identify exact fonts |
| Raw HTTP and local files via a shell, script or connector | Fetch a representative public HTML page, inspect linked stylesheets and image metadata, save selected assets | Raw HTML is not a browser render; JS-only content may remain absent |
| Text reader with exposed image/asset links | Follow those actual links through a permitted fetch/download tool | Reader text alone does not establish appearance |
| Editor accepting remote image URLs | Import a verified accessible original image URL | Verify the actual imported result; preview URLs may expire or require cookies |
| Editor requiring local/uploaded files | Download selected bytes using an available tool, then pass the actual local file or upload handle through its supported mechanism | A filesystem path in one environment is not automatically visible to another |
| No asset retrieval or transfer path | Continue with accessible evidence and suitable original text/diagram layouts | Request a specific essential asset only after confirming the relevant capability gap |

Use the host's first-party browsing or download capability where provided. If permitted shell/network access is available, a public file can be saved with a normal HTTP client; do not conclude that local-file-only import requires a human upload. For example, after obtaining a real asset URL, adapting paths to the environment:

```sh
curl --fail --location --max-time 30 --output ./assets/product.jpg 'https://example.org/actual-image.jpg'
```

This is an illustrative command, not a known image URL or an instruction to assume curl exists. Check the response/file type and view the image before use; extensions can be misleading. Use existing tools or standard libraries rather than installing a dependency solely to fetch an image. Honor environment network/permission controls.

## Inspect representative sources

Look for normal image sources, lazy-loaded attributes, responsive candidates, `<picture>` sources, CSS `background-image`, Open Graph images and original logo links. Resolve relative URLs against the actual page/base URL. Follow relevant linked stylesheets when useful. Prefer an appropriately sized original to a tracking pixel, logo thumbnail or social card. Do not mirror a whole site or download unrelated assets.

A public press/media page may provide suitable product assets when the main page is dynamic. Inspect that page and its actual links; do not guess arbitrary endpoint paths or assume reuse permission. Keep a short source/asset record with URL, intended role, available rights information and actual local/import handle.

Request only representative evidence needed for the current presentation. Avoid repeated unchanged fetch failures: after a failure, use an independent supported path if one exists, then record the specific unavailable capability. Do not bypass authentication, paywalls or access restrictions.

## Use and fallback

Preserve original logos and product proportions. Avoid presenting a crop, source photograph or generated concept as evidence of a different product/place. Preserve required notices and record unresolved rights. Public access does not establish an asset license.

If exact CSS/font evidence is unavailable, keep the distinction explicit: “original editorial adaptation informed by accessible content,” not “verified official identity.” If adaptation is acceptable, continue authoring the deck with deliberate original choices. If faithful reproduction is required and the missing evidence is essential, ask for the specific screenshot/template/guide needed.

If images cannot reach the editor despite successful acquisition, disclose the transfer limit, preserve usable assets for delivery if supported and continue the deck's independent work. For image-led content where substitution would change the meaning, request the precise missing file or supported import method. For optional decorative imagery, choose a suitable typographic or native-shape composition. Never claim an image was imported until it appears in the authored result.
