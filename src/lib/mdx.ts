import rehypePrettyCode, {
  type Options as PrettyCodeOptions,
} from "rehype-pretty-code";

/**
 * Shared rehype config for MDX content (docs + blog).
 *
 * rehype-pretty-code wraps Shiki, so code fences get the same VS Code-grade
 * highlighting as the marketing pages, with zero client JS.
 */
const prettyCodeOptions: PrettyCodeOptions = {
  theme: "github-dark",
  keepBackground: true,
};

// Typed as a mutable tuple so it satisfies unified's PluggableList without
// importing `unified` directly (it is a transitive dependency here).
export const mdxRehypePlugins: [typeof rehypePrettyCode, PrettyCodeOptions][] =
  [[rehypePrettyCode, prettyCodeOptions]];
