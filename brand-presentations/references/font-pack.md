# Bundled offline fonts

The skill includes **46 families / 140 original TTF files** under `assets/fonts/`, approximately 54.1 MB. This covers the **24 families explicitly loaded by the inspected SlideGenAI application** plus six pairing/open-alternative complements and 16 expressive display families. Generic CSS families and proprietary system fonts are not font binaries in the application and are not redistributed.

Every included family has its original SIL Open Font License 1.1 in its directory. [The font manifest](../assets/fonts/manifest.json) records the pinned upstream commit, exact source URL, SHA-256, size, style, weight range and variable axes of every file. The files are unmodified upstream binaries from [Google Fonts](https://github.com/google/fonts). Preserve each family's license and copyright notices when redistributing the pack; the font licenses are separate from the repository's own licensing status.

## What is included

**Application families:** Montserrat, Playfair Display, Roboto Mono, Inter, Oswald, Lato, Poppins, Raleway, Open Sans, Nunito, Space Grotesk, DM Sans, Merriweather, Crimson Text, Source Serif 4, Bebas Neue, Archivo Black, Righteous, Fira Code, Source Code Pro, IBM Plex Mono, Roboto, Lora and JetBrains Mono.

**Complements:** Manrope, Barlow Condensed, Bodoni Moda, Cormorant Garamond, Syne and Comic Neue. The pairing catalog's families are all included.

**Expressive extension:** Unbounded, Anybody, Bungee, Bungee Shade, Bungee Outline, Rubik Glitch, Dela Gothic One, Climate Crisis, Fraunces, DM Serif Display, Orbitron, Audiowide, Instrument Serif, Tilt Warp, Rubik Mono One and Caveat. See [selection and usage](expressive-typography.md) and the [live type lab](../assets/fonts/expressive.html).

The manifest maps earlier local system-font choices to explicit open alternatives, for example Impact → Bebas Neue, Didot → Bodoni Moda, Avenir Next → Manrope and Comic Sans MS → Comic Neue. These are design alternatives, not identical metrics or original font files. Preserve an explicitly required brand font when it is legitimately available; otherwise record the substitution and reflow.

## Verify the downloaded repository

From the installed skill folder:

```sh
python3 -B scripts/validate_fonts.py
```

This uses the Python 3.9+ standard library and no network. It checks declared font files, hashes, sizes, signatures, per-family licenses, application-family coverage and local CSS references. During preparation, fontTools parsed all 140 font files and confirmed a Portuguese accented-text/numeral sample in every cmap. The standard-library verifier does not reproduce fontTools parsing or certify rendering, embedding, every language or OS installation.

## HTML: use the local files directly

Copy the complete `assets/fonts/` directory into the presentation project, retaining licenses and manifest. Link the stylesheet relative to the generated HTML:

```html
<link rel="stylesheet" href="assets/fonts/fonts.css">
<style>
  .headline { font-family: 'Space Grotesk', sans-serif; font-weight: 700; }
  .body { font-family: 'Manrope', sans-serif; font-weight: 400; }
  .label { font-family: 'IBM Plex Mono', monospace; font-weight: 500; }
</style>
```

The stylesheet has no remote imports or font requests. Its weight ranges describe the actual bundled files. Wait for `document.fonts.ready` before measuring or exporting text, then verify requested faces/weights are loaded. Test the local [font specimen](../assets/fonts/specimen.html) through a local HTTP server; some hosts restrict local-file font access. Its CSS, JavaScript and font resources are included, with no CDN dependency.

## Native slide tools: register the selected fonts

A TTF beside a PPTX does not register a font in PowerPoint, Keynote or an authoring library. Install the fonts or register their local paths with the renderer's documented API before measuring text. Restart or refresh applications when needed. The optional copy helper is dry-run by default, validates the pack, accepts selected families and refuses to replace different existing files:

```sh
python3 -B scripts/install_fonts.py --dest /path/to/font-folder --family Inter --family Manrope
# Add --install to copy after checking the listed destination.
```

**macOS, current user:**

```sh
python3 -B scripts/install_fonts.py --dest "$HOME/Library/Fonts" --family Inter --family Manrope --install
```

**Linux, current user:**

```sh
python3 -B scripts/install_fonts.py --dest "$HOME/.local/share/fonts/slidegenai" --family Inter --family Manrope --install
fc-cache -f
```

**Windows, current user:** stage a flat folder, then select its TTF files and choose **Install** in Explorer, or drag the files into Windows Font Settings:

```powershell
py -3 scripts/install_fonts.py --dest "$env:TEMP/slidegenai-fonts" --family Inter --family Manrope --install
```

Omit the repeated `--family` arguments to stage all 46 families. The helper copies files; it does not edit a system registry, invoke administrator elevation, refresh applications or certify OS registration. macOS/Linux copy destinations follow common user-font conventions; only temporary-directory copying and local browser loading were tested in this implementation. Windows installation and native slide-app font registration remain untested here.

## Variable fonts and export

Several upstream files are variable fonts. Modern browsers can use them through the included CSS; native presentation tools/exporters differ. Check the selected tool's font registration, weight support and export behavior. When it cannot use a variable font, choose a suitable bundled static family/face or obtain licensed static instances through a documented workflow. Do not claim that a TTF file was embedded just because text renders on the author's machine.

Resolve real weights; do not request unsupported weights and mistake synthesized bold for a supplied face. Re-measure text after any fallback and inspect all affected slides. For authoring-based outlines, use native transparent glyph fill/stroke where supported. Drawn outline fonts such as Bungee Outline offer a separate method; verify their glyph shapes and native-font support independently.

## Brand-specific packaging

The strict packager accepts the font manifest and per-family `OFL.txt` files only in the expected `assets/fonts/` structure, and invokes the offline font verifier before archiving. Include the verifier and its local dependencies if copying the packaging helper into another skill. Keep the original license files, manifest and local CSS together when retaining the full pack. A deliberately reduced pack needs a matching reduced manifest, CSS and coverage declarations; do not delete files while retaining stale references.

## Size-limited Claude.ai distribution

The complete repository retains 46 families and 140 original fonts. A Claude.ai profile can retain all families/licenses while selecting normal 400/700 faces where present and the expressive specimen faces. Read DISTRIBUTION.json and assets/fonts/manifest.json in the installed bundle for actual counts, weights and omitted files. Binaries and internal font names are unchanged; fonts are not subsetted. The Claude.ai profile normalizes filenames to portable family-face-NN.ttf paths (unique basenames across families, including when staged in one font directory) and records every original source path in its manifests. CSS and the manifest match the selected files. Additional styles require the complete repository or a confirmed available fallback. This profile addresses an observed 30 MB uncompressed Claude.ai upload limit; activation and rendering still need testing.
