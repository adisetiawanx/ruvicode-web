/**
 * Client-side syntax highlighting using highlight.js.
 * Only the most common playground languages are registered to keep the
 * bundle small; additional languages can be added as needed.
 */
import hljs from "highlight.js/lib/core";
import python from "highlight.js/lib/languages/python";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import bash from "highlight.js/lib/languages/bash";
import json from "highlight.js/lib/languages/json";
import go from "highlight.js/lib/languages/go";
import sql from "highlight.js/lib/languages/sql";
import yaml from "highlight.js/lib/languages/yaml";
import css from "highlight.js/lib/languages/css";
import xml from "highlight.js/lib/languages/xml";

hljs.registerLanguage("python", python);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("js", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("ts", typescript);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("sh", bash);
hljs.registerLanguage("json", json);
hljs.registerLanguage("go", go);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("yaml", yaml);
hljs.registerLanguage("yml", yaml);
hljs.registerLanguage("css", css);
hljs.registerLanguage("html", xml);
hljs.registerLanguage("xml", xml);

/** Highlight a code string, optionally auto-detecting the language. */
export function highlight(code: string, language?: string): string {
  if (language && hljs.getLanguage(language)) {
    try {
      return hljs.highlight(code, { language }).value;
    } catch {
      // fall through to auto-detect
    }
  }
  try {
    const result = hljs.highlightAuto(code);
    return result.value;
  } catch {
    return code; // plain text fallback
  }
}

/** Languages we registered (for the language badge). */
export const registeredLanguages = new Set([
  "python",
  "javascript",
  "js",
  "typescript",
  "ts",
  "bash",
  "sh",
  "json",
  "go",
  "sql",
  "yaml",
  "yml",
  "css",
  "html",
  "xml",
]);