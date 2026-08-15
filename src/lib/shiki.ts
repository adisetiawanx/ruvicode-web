import {
  createHighlighter,
  type BundledLanguage,
  type BundledTheme,
} from "shiki";

/**
 * Shiki singleton — initialized once, reused across renders.
 *
 * Dual themes: github-dark for dark mode, github-light for light mode.
 * Both are rendered as CSS variables on a single <pre> (shiki's
 * css-variables + defaultColor approach), and globals.css switches them
 * via [data-theme]. This avoids the washed-out dark theme that a plain
 * single-theme render caused in light mode.
 */
let highlighterPromise: ReturnType<typeof createHighlighter> | null = null;

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["github-dark", "github-light"],
      langs: [
        "bash", "python", "typescript", "javascript", "json", "yaml",
        "go", "rust", "sql", "css", "xml", "markdown", "diff",
      ],
    });
  }
  return highlighterPromise;
}

/**
 * Highlight a code string and return HTML with inline-styled spans.
 * Runs server-side (SSG/SSR) — zero client JS for syntax highlighting.
 */
export async function highlightCode(
  code: string,
  lang: BundledLanguage = "bash",
): Promise<string> {
  const hl = await getHighlighter();
  return hl.codeToHtml(code, {
    lang,
    themes: {
      light: "github-light" as BundledTheme,
      dark: "github-dark" as BundledTheme,
    },
    // No inline default color: spans carry --shiki-light/--shiki-dark and
    // globals.css picks the right one per theme. This keeps both modes crisp.
    defaultColor: false,
  });
}
