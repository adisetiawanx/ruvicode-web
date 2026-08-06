import {
  createHighlighter,
  type BundledLanguage,
  type BundledTheme,
} from "shiki";

/**
 * Shiki singleton — initialized once, reused across renders.
 * Uses "github-dark" theme as the closest match to Ruvicode's warm dark palette.
 * (Shiki doesn't have a built-in warm-terracotta theme; github-dark is the
 * industry standard for dev tooling and pairs well with our dark canvas.)
 *
 * The generated HTML uses inline styles (Shiki's default), so no extra CSS
 * is needed. We just set the container background to --code-bg in the component.
 */
let highlighterPromise: ReturnType<typeof createHighlighter> | null = null;

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["github-dark"],
      langs: ["bash", "python", "typescript"],
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
    theme: "github-dark" as BundledTheme,
  });
}
