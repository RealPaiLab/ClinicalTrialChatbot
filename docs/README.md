# Camille documentation

The engineering documentation site, built with [Fumadocs](https://fumadocs.dev) on Next.js and
exported as a static site for GitHub Pages.

```bash
pnpm install
pnpm dev      # http://localhost:3000
pnpm build    # static export into ./out
pnpm start    # serve ./out
```

## Structure

| Path | Holds |
| --- | --- |
| `content/docs/` | The pages, as MDX. `meta.json` sets the sidebar order and the section labels. |
| `app/(home)/page.tsx` | The landing page, including the hero cross-section illustration. |
| `app/docs/` | The docs layout and the page route (title, actions row, last-updated). |
| `app/global.css` | The app's design tokens ported onto Fumadocs' theme variables. |
| `components/home/` | Landing-page illustrations (SVG, no image assets). |
| `components/mdx/` | The components usable from MDX. See below. |
| `components/scroll-reset.tsx` | Resets scroll on navigation, which the layout does not do on its own. |
| `lib/shared.ts` | Site name, repository, and the facts shown in the hero. |
| `public/shots/` | Screenshots referenced by `<Shot>`. |

## MDX components

Registered in `components/mdx.tsx` and available in any page without importing.

| Component | Renders |
| --- | --- |
| `<Mermaid chart={...} />` | A diagram, themed to the product palette in light and dark mode. |
| `<Shot src alt caption width />` | A screenshot from `public/`, with a placeholder when the file is missing. |
| `<PanelMap />` | The three-panel layout schematic on the Interface page. |
| `<Palette />` | The colour token cards. |
| `<Swatch tone>` | An inline colour chip, used to key a diagram legend to its nodes. |
| `<Backers />` | The three project logos. |

## Diagrams

Diagrams are Mermaid, rendered client-side. Use the component rather than a fenced block:

```mdx
<Mermaid
  chart={`
flowchart LR
  A[Question] --> B[Trials]
`}
/>
```

Diagram nodes reuse one palette across every page, so a colour means the same thing everywhere:
navy for the ordinary path, yellow for a guard or an external service, red for a refusal, pale for a
data store, light blue for the person at either end.

## Writing

- **No em dashes.** Colons, commas, parentheses or periods instead.
- **Underline sparingly** with `<u>`, one or two keywords per section, for the phrase that carries
  the point. Bold names a mechanism; the underline emphasises the claim.
- **Headings are `h2` with `h3` children**, so the table of contents is navigable.
- Pages document the `main` branch, not whatever is on a working branch.

## Generated routes

Four route handlers produce files that are not pages. All of them are statically exported.

| Route | Purpose |
| --- | --- |
| `/api/search` | The static Orama index behind the search box. |
| `/llms.txt` | An index of the site in Markdown, following the [llms.txt](https://llmstxt.org) convention. |
| `/llms-full.txt` | Every page concatenated into one Markdown file. |
| `/llms.mdx/docs/<slug>/content.md` | One page as raw Markdown. |
| `/og/docs/<slug>/image.png` | The social preview image for a page. |

The `llms` routes are **not an assistant on the site**. They exist so that a model reading these docs
gets Markdown instead of scraped HTML: `llms.txt` for an agent that wants to find the right page,
`llms-full.txt` for one that wants the whole thing in a single request. The per-page `content.md` is
also what the **Copy Markdown** button and the view-options menu on each page link to, so a reader
can paste a page into their own tools.

## Deploying

`DOCS_BASE_PATH` sets the base path for a GitHub Pages project site. The workflow at
`.github/workflows/docs.yml` builds with `DOCS_BASE_PATH=/ClinicalTrialChatbot` and publishes `out/`.
