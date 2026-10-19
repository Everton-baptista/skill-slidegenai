# SlideGenAI template catalog

Snapshot: 2026-10-18. All **177 interface templates** are indexed in [the portable JSON catalog](template-catalog.json). **174** have a matching backend style rule; **176** appear in the declared type union. `custom`, `tech-saas` and `wildlife` lack matching `STYLES` entries. `organic-pro` is absent from the declared type union. These observations describe the inspected source; no application changes were made.

The catalog transfers visual relationships rather than copying application prompts, JSX, remote assets or provider dependencies. Each row is **source-reviewed**, not a tested PPTX implementation. Palette samples are source observations, never authority to override a supplied brand. Third-party or institutional names indicate inspiration in the source, not affiliation or a bundled licensed master.

## Use the catalog

1. Keep the supplied identity and audience constraints. Use the family as a direction, not a new brand.
2. Choose an evidence or relationship pattern from [analytical construction](analytical-construction.md). A theme does not determine whether a chart is appropriate.
3. Read the matching entry only when requested or useful. `suggested_patterns` are starting points; they do not certify host support.
4. Translate the chosen relationship into measured regions, native objects and an inspected export. Never paste source-wide “always use images,” card grids, forbidden fonts or provider instructions into the skill.

All themes can use native charts or flows when the content and host support them. Families below suggest useful starting combinations.

| Family | Retain | Adapt |
| --- | --- | --- |
| analytical | Alignment, clear evidence hierarchy and consistent scales. | Avoid tiny dashboard labels and decorative mini charts. |
| editorial | Type scale, purposeful crop and deliberate whitespace. | Protect chart regions from image overlap; no invented pull quotes. |
| technical | Precise line work, labeled relationships and strong grouping. | Avoid decorative wires that imply nonexistent dependencies. |
| organic | Human scale, softer cadence and image-led variation. | Keep quantitative geometry exact; use texture only outside evidence. |
| minimal | Single focal point, restrained color and generous negative space. | Do not erase units, branches or qualifications for simplicity. |
| experimental | A deliberate expressive gesture suited to the audience. | Reserve stable reading surfaces for data; motion and effects may not export. |
| photographic | Specific subject, meaningful crop and image/text relationship. | Do not place data or faces beneath competing labels. |
| institutional | Evidenced identity, original logos and measured master relationships. | A named institution is not a reusable identity for other brands. |
| custom | The user-selected identity and capability constraints. | Resolve identity and evidence before choosing effects. |

## Visible names are not always template IDs

The application sometimes displays a poster word rather than its catalog title. These observed labels now participate in offline lookup:

| Visible label | Source title | Canonical ID |
| --- | --- | --- |
| Acid Rave | Acid Graphix | `acid-graphix` |
| Neo-Tech | Neo-Tech | `default` |
| NOVA | Fashion Editorial | `fashion-editorial` |
| Ultimate Luxury | Premium Escapes | `premium-travel` |
| Neo Tokyo | Urban Vivid | `urban-vivid` |
| MOVE | Kinetic | `kinetic` |

Use `python3 scripts/find_templates.py --name "Acid Rave"` for an exact normalized visible name, or `--query "neo tokyo"` for substring search. Case, punctuation and accents normalize; canonical IDs remain unchanged. `--id` stays exact. No fuzzy guessing is performed. A category such as **Corporate & Education** is a group of templates, not a newly invented template ID; query it to see all source entries. If a user's spelling has no match, inspect the source or ask rather than silently selecting a different style.

For composition-level adaptation of the nine demonstrated directions, read [style grammars](style-grammars.md). A palette and family name alone are insufficient to reproduce their character.

## Complete index

| ID | Source name | Source category | Portable family |
| --- | --- | --- | --- |
| `custom` | Create Your Own | Custom | custom |
| `insper-aula` | Insper Aula | Corporate & Education | institutional |
| `insper-v2` | Insper V2 Modern | Corporate & Education | institutional |
| `insper-institucional` | Insper Institucional | Corporate & Education | institutional |
| `organic-pro` | Organic Designer (Pro) | High-End | organic |
| `organic-modern` | Organic Modern | High-End | organic |
| `modern-saas` | Modern SaaS | High-End | technical |
| `apple-keynote` | Apple Keynote | High-End | minimal |
| `linear-app` | Linear App | High-End | technical |
| `spotify-wrapped` | Spotify Wrapped | High-End | experimental |
| `stripe-docs` | Stripe Docs | High-End | minimal |
| `pet` | Pet Care | Industry | organic |
| `architecture` | Architecture | Industry | technical |
| `wildlife` | Wildlife Safari | Industry | photographic |
| `halloween-playful` | Halloween Party | Seasonal | experimental |
| `solarpunk` | Solarpunk | Subculture | experimental |
| `dreamcore` | Dreamcore | Subculture | experimental |
| `steampunk` | Steampunk | Subculture | experimental |
| `weirdcore` | Weirdcore | Subculture | experimental |
| `brutal-deconstruct` | Deconstructed | Subculture | experimental |
| `magazine-cutout` | Zine Punk | Subculture | editorial |
| `isometric-3d` | Isometric | Subculture | experimental |
| `low-poly` | Low Poly | Subculture | experimental |
| `frutiger-aero` | Frutiger Aero | Hyper-Niche | experimental |
| `anti-design` | Anti-Design | Hyper-Niche | experimental |
| `biopunk` | Biopunk | Hyper-Niche | experimental |
| `risograph` | Risograph | Hyper-Niche | experimental |
| `thermal` | Thermal Vision | Hyper-Niche | experimental |
| `8bit-rpg` | 8-Bit RPG | Hyper-Niche | experimental |
| `ink-blot` | Rorschach | Hyper-Niche | experimental |
| `crystal` | Prism Crystal | Hyper-Niche | experimental |
| `liquid-metal` | Liquid Metal | Avant-Garde | experimental |
| `kinetic` | Kinetic | Avant-Garde | experimental |
| `aura` | Aura | Avant-Garde | experimental |
| `holographic` | Holo Void | Avant-Garde | experimental |
| `collage` | Collage Punk | Experimental | experimental |
| `surreal` | Surrealism | Experimental | experimental |
| `acid-graphix` | Acid Graphix | Experimental | experimental |
| `ascii` | ASCII Art | Experimental | experimental |
| `default` | Neo-Tech | Original | technical |
| `timeline` | Timeline Journey | Business | analytical |
| `risk` | Risk Assessment | Business | analytical |
| `cyberpunk` | Cyberpunk | Tech | technical |
| `synthwave` | Synthwave | Retro | experimental |
| `terminal` | Hacker Terminal | Tech | technical |
| `blueprint` | Blueprint | Engineering | technical |
| `crypto` | Blockchain | Finance | analytical |
| `ai-lab` | AI Laboratory | Tech | technical |
| `glitch` | System Error | Art | experimental |
| `consulting` | MBB Consulting | Business | analytical |
| `finance` | Wall Street | Business | analytical |
| `legal` | Legal Firm | Business | institutional |
| `medical` | Healthcare | Science | technical |
| `lux-brand` | Luxury Brand | Business | minimal |
| `real-estate` | Real Estate | Business | photographic |
| `bauhaus` | Bauhaus | Art | experimental |
| `brutalist` | Neo-Brutalism | Art | experimental |
| `pop-art` | Pop Art | Art | experimental |
| `swiss` | Swiss Style | Design | minimal |
| `pastel` | Pastel Dream | Design | experimental |
| `paper-craft` | Paper Cutout | Art | experimental |
| `fashion` | Runway | Lifestyle | photographic |
| `travel` | Wanderlust | Lifestyle | photographic |
| `foodie` | Culinary | Lifestyle | photographic |
| `sports` | Athletics | Lifestyle | photographic |
| `gaming` | E-Sports | Tech | technical |
| `cinema` | Cinema | Art | photographic |
| `neumorphism` | Neumorphism | UI | experimental |
| `claymorphism` | Claymorphism | UI | experimental |
| `gradient-mesh` | Aurora | UI | experimental |
| `duotone` | Duotone | Art | experimental |
| `retro-70s` | 70s Disco | Retro | experimental |
| `vintage-50s` | 50s Diner | Retro | experimental |
| `grunge-90s` | 90s Grunge | Retro | experimental |
| `y2k` | Y2K | Retro | experimental |
| `fire` | Inferno | Nature | experimental |
| `ice` | Frozen | Nature | experimental |
| `forest` | Deep Woods | Nature | organic |
| `sunset` | Vapor Sunset | Nature | organic |
| `midnight` | Midnight | Minimal | minimal |
| `startup` | Pitch Deck | Business | analytical |
| `glass` | Glassmorphism | Futuristic | experimental |
| `editorial` | Editorial | Minimalist | editorial |
| `modules` | Grid System | Strategy | analytical |
| `space` | Cosmic | Futuristic | experimental |
| `noir` | Noir | Minimalist | editorial |
| `minimal` | Swiss Minimalist | Minimalist | minimal |
| `creative` | Art & Design | Creative | experimental |
| `nature` | Eco | Nature | organic |
| `strategic` | Strategic Business | Business | analytical |
| `innovation-split` | Innovation Showcase | Business | analytical |
| `title` | Title Slide | Original | editorial |
| `pipeline` | Roadmap | Strategy | analytical |
| `ocean` | Deep Ocean | Nature | organic |
| `rainforest` | Jungle | Nature | organic |
| `dark` | Dark Mode | Minimalist | minimal |
| `wireframe` | UX Wireframe | Design | technical |
| `engineering` | Industrial | Industry | technical |
| `academic` | University | Education | institutional |
| `watercolor` | Watercolor | Artistic | experimental |
| `sketch` | Hand Drawn | Artistic | experimental |
| `music` | Album Cover | Entertainment | experimental |
| `monochrome-red` | Red Mono | Monochrome | minimal |
| `monochrome-blue` | Blue Mono | Monochrome | minimal |
| `desert` | Dune | Nature | organic |
| `vercel-edge` | Vercel Edge | High-End | minimal |
| `airbnb-story` | Airbnb Experience | High-End | photographic |
| `tesla-future` | Tesla Energy | Tech | technical |
| `arc-browser` | Arc Browser | High-End | experimental |
| `superhuman-email` | Superhuman | Productivity | minimal |
| `raycast-cmd` | Raycast | Productivity | minimal |
| `notion-clean` | Notion Clean | Productivity | minimal |
| `toy-bricks` | Toy Bricks | Playful | experimental |
| `urban` | Urban City | Modern | photographic |
| `communication` | Global Communication | Business | analytical |
| `cartoon` | Cartoon | Playful | experimental |
| `culinary-dark` | Fine Dining | Food | photographic |
| `streetwear` | Streetwear | Fashion | photographic |
| `film-noir` | Classic Cinema | Entertainment | photographic |
| `retro-console` | Retro Gaming | Entertainment | experimental |
| `strategy-board` | Strategic Planning | Business | analytical |
| `tech-saas` | Tech SaaS | Business | analytical |
| `photo-portfolio` | Photo Portfolio | Creative | photographic |
| `travel-adventure` | Travel Adventure | Lifestyle | photographic |
| `fashion-editorial` | Fashion Editorial | Fashion | editorial |
| `creative-vibrant` | Creative Vibrant | Creative | experimental |
| `sunset-waves` | Sunset Ocean | Nature | organic |
| `dashboard-analytics` | Dashboard Analytics | Data | analytical |
| `financial-report` | Financial Report | Data | analytical |
| `data-visualization` | Data Viz | Data | analytical |
| `metrics-board` | Metrics Board | Data | analytical |
| `stock-market` | Stock Market | Data | analytical |
| `infographic-data` | Infographic | Data | analytical |
| `magazine-layout` | Magazine Layout | Editorial | editorial |
| `newsletter` | Newsletter | Editorial | editorial |
| `article-page` | Article Page | Editorial | editorial |
| `publishing-house` | Publishing | Editorial | editorial |
| `floor-plan` | Floor Plan | Architecture | technical |
| `urban-planning` | Urban Planning | Architecture | technical |
| `3d-render` | 3D Render | Architecture | technical |
| `geographic-map` | Geographic Map | Map | technical |
| `journey-map` | Journey Map | Map | technical |
| `location-pin` | Location Pin | Map | technical |
| `pitch-deck-modern` | Pitch Deck Pro | Business | analytical |
| `executive-summary` | Executive Summary | Business | analytical |
| `business-plan` | Business Plan | Business | analytical |
| `runway` | Runway | Fashion | photographic |
| `lookbook` | Lookbook | Fashion | photographic |
| `fashion-week` | Fashion Week | Fashion | photographic |
| `beauty-product` | Beauty Product | Beauty | organic |
| `cosmetics` | Cosmetics | Beauty | organic |
| `spa-wellness` | Spa & Wellness | Beauty | organic |
| `ultra-minimal` | Ultra Minimal | Minimal | minimal |
| `japanese-minimalism` | Japanese Zen | Minimal | minimal |
| `scandinavian` | Scandinavian | Minimal | minimal |
| `monochrome-elegant` | Monochrome Elegant | Minimal | minimal |
| `health-nutrition` | Health & Nutrition | Health | organic |
| `education-modern` | Education Modern | Education | technical |
| `research-proposal` | Research Proposal | Academic | technical |
| `corporate-teal` | Corporate Teal | Business | analytical |
| `lifestyle-pink` | Lifestyle Pink | Lifestyle | photographic |
| `corporate-blue-light` | Corporate Blue Light | Business | analytical |
| `luxury-gold-black` | Luxury Gold & Black | Fashion | photographic |
| `infographic-modern` | Infographic Modern | Data | analytical |
| `portfolio-device` | Portfolio Device Mockup | Portfolio | photographic |
| `nature-creative-art` | Nature Creative Art | Creative | organic |
| `beauty-serenity` | Beauty Serenity | Beauty | organic |
| `interior-minimal` | Interior Minimal | High-End | minimal |
| `wellness-organic` | Wellness Organic | Lifestyle | organic |
| `sustainable-brand` | Sustainable | Business | organic |
| `innovation-organic` | Bio-Innovation | Tech | organic |
| `brutalist-flora` | Brutalist Flora | Creative | experimental |
| `ethereal-horizons` | Ethereal Horizons | Lifestyle | organic |
| `zen-minimal` | Zen Minimal | High-End | minimal |
| `premium-travel` | Premium Escapes | High-End | photographic |
| `modern-editorial` | Modern Zine | Creative | editorial |
| `urban-vivid` | Urban Vivid | Tech | technical |

## Query without loading all entries

```sh
python3 scripts/find_templates.py
python3 scripts/find_templates.py --id consulting
python3 scripts/find_templates.py --family organic --pattern trend-line
python3 scripts/find_templates.py --query architecture
```

These commands run from the installed skill folder. Filters retrieve source options; they do not score design quality or certify output support.

## Coverage boundary

The source chart renderer names bar, grouped-bar, stacked-bar, line, area, pie, donut, radar, bubble, gauge and polar-area. Its HTML/SVG preview is not proof of native PPTX editability. The source diagram service separates logical nodes/edges from styling, but also contains provider-specific prompts and raster/export assumptions; only the logical separation is transferred.

The analytical example and its review record identify the subset actually built and inspected. Unsupported visual types require a documented native alternative or an explicit editing limitation, not silent rasterization.

For maintainers, source hashes in the JSON identify this snapshot. Refresh against a later checkout by enumerating the full interface list again and comparing IDs, rules and declared types; portable users do not need the SlideGenAI application installed.
