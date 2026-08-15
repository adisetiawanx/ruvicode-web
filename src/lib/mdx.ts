import rehypePrettyCode, {
  type Options as PrettyCodeOptions,
} from "rehype-pretty-code";
import remarkGfm from "remark-gfm";

/**
 * Shared MDX pipeline config (docs + blog).
 *
 * remark-gfm enables GitHub-style tables and task lists, rehype-pretty-code
 * wraps Shiki so code fences get VS Code-grade highlighting with zero
 * client JS.
 */
const prettyCodeOptions: PrettyCodeOptions = {
  theme: "github-dark",
  keepBackground: true,
};

export const mdxRemarkPlugins = [remarkGfm];

// Typed as a mutable tuple so it satisfies unified's PluggableList without
// importing `unified` directly (it is a transitive dependency here).
export const mdxRehypePlugins: [typeof rehypePrettyCode, PrettyCodeOptions][] =
  [[rehypePrettyCode, prettyCodeOptions]];
