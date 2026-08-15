/**
 * Client-side syntax highlighting using highlight.js.
 * A broad language set for playground chat code blocks, including
 * config formats (yaml, toml, ini, dockerfile) and systems languages.
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
import markdown from "highlight.js/lib/languages/markdown";
import rust from "highlight.js/lib/languages/rust";
import java from "highlight.js/lib/languages/java";
import kotlin from "highlight.js/lib/languages/kotlin";
import swift from "highlight.js/lib/languages/swift";
import c from "highlight.js/lib/languages/c";
import cpp from "highlight.js/lib/languages/cpp";
import csharp from "highlight.js/lib/languages/csharp";
import php from "highlight.js/lib/languages/php";
import ruby from "highlight.js/lib/languages/ruby";
import perl from "highlight.js/lib/languages/perl";
import lua from "highlight.js/lib/languages/lua";
import r from "highlight.js/lib/languages/r";
import scala from "highlight.js/lib/languages/scala";
import haskell from "highlight.js/lib/languages/haskell";
import elixir from "highlight.js/lib/languages/elixir";
import erlang from "highlight.js/lib/languages/erlang";
import clojure from "highlight.js/lib/languages/clojure";
import dart from "highlight.js/lib/languages/dart";
import powershell from "highlight.js/lib/languages/powershell";
import dockerfile from "highlight.js/lib/languages/dockerfile";
import nginx from "highlight.js/lib/languages/nginx";
import ini from "highlight.js/lib/languages/ini";
import toml from "highlight.js/lib/languages/ini";
import makefile from "highlight.js/lib/languages/makefile";
import cmake from "highlight.js/lib/languages/cmake";
import graphql from "highlight.js/lib/languages/graphql";
import protobuf from "highlight.js/lib/languages/protobuf";
import shell from "highlight.js/lib/languages/shell";
import diff from "highlight.js/lib/languages/diff";
import objectivec from "highlight.js/lib/languages/objectivec";
import vbnet from "highlight.js/lib/languages/vbnet";
import ocaml from "highlight.js/lib/languages/ocaml";
import plaintext from "highlight.js/lib/languages/plaintext";

const langs: Record<string, unknown> = {
  python, javascript, typescript, bash, json, go, sql, yaml, css, xml,
  markdown, rust, java, kotlin, swift, c, cpp, csharp, php, ruby, perl,
  lua, r, scala, haskell, elixir, erlang, clojure, dart, powershell,
  dockerfile, nginx, ini, toml, makefile, cmake, graphql, protobuf,
  shell, diff, plaintext, objectivec, vbnet, ocaml,
};

// aliases users and models commonly emit
const aliases: Record<string, string> = {
  js: "javascript", ts: "typescript", py: "python", sh: "bash", zsh: "bash",
  yml: "yaml", html: "xml", svg: "xml", jsx: "javascript", tsx: "typescript",
  "c++": "cpp", "c#": "csharp", golang: "go", rs: "rust", kot: "kotlin",
  docker: "dockerfile", pwsh: "powershell", text: "plaintext", txt: "plaintext",
  conf: "ini", properties: "ini", md: "markdown", proto: "protobuf",
  // Terminal / console output blocks models commonly emit
  terminal: "plaintext", console: "plaintext", log: "plaintext",
  output: "plaintext", none: "plaintext", "": "plaintext",
  objc: "objectivec", vb: "vbnet", "vb.net": "vbnet", ml: "ocaml",
};

for (const [name, def] of Object.entries(langs)) {
  hljs.registerLanguage(name, def as never);
}
for (const [alias, target] of Object.entries(aliases)) {
  if (hljs.getLanguage(target) && !hljs.getLanguage(alias)) {
    hljs.registerAliases(alias, { languageName: target });
  }
}

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
  ...Object.keys(langs),
  ...Object.keys(aliases),
]);
