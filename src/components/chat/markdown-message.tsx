"use client";

import { Fragment, type ReactNode } from "react";

/**
 * Minimal markdown renderer for chat messages. Handles the subset models
 * actually emit in chat: bold, italic, inline code, fenced code blocks
 * (rendered by the parent's ChatCodeBlock), headings, lists, and GFM
 * tables. No external dependency, no dangerouslySetInnerHTML on user or
 * model text.
 */

/** Split inline markup (bold/italic/code/links) into React nodes. */
function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  // bold/italic/code/link, ordered so ** wins over *
  const pattern =
    /(\*\*[^*]+\*\*)|(\*[^*\n]+\*)|(`[^`\n]+`)|(\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = pattern.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const tok = m[0];
    const key = `${keyPrefix}-${i++}`;
    if (tok.startsWith("**")) {
      nodes.push(
        <strong key={key} className="font-semibold">
          {tok.slice(2, -2)}
        </strong>,
      );
    } else if (tok.startsWith("`")) {
      nodes.push(
        <code
          key={key}
          className="rounded bg-black/20 px-1 py-0.5 font-mono text-[0.85em]"
        >
          {tok.slice(1, -1)}
        </code>,
      );
    } else if (tok.startsWith("[")) {
      const label = tok.slice(1, tok.indexOf("]"));
      const href = tok.slice(tok.indexOf("(") + 1, -1);
      nodes.push(
        <a key={key} href={href} className="text-accent-text underline" target="_blank" rel="noreferrer">
          {label}
        </a>,
      );
    } else {
      nodes.push(
        <em key={key} className="italic">
          {tok.slice(1, -1)}
        </em>,
      );
    }
    last = m.index + tok.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

interface Block {
  type: "p" | "h" | "ul" | "ol" | "table" | "hr";
  level?: number;
  text?: string;
  items?: string[];
  rows?: string[][];
}

/** Parse a message body into simple blocks (code fences handled upstream). */
function parseBlocks(body: string): Block[] {
  const lines = body.split("\n");
  const blocks: Block[] = [];
  let i = 0;

  const isTableRow = (l: string) => /^\s*\|.*\|\s*$/.test(l);
  const isTableDivider = (l: string) => /^\s*\|[\s:|-]+\|\s*$/.test(l);
  const splitRow = (l: string) =>
    l.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());

  while (i < lines.length) {
    const line: string = lines[i] ?? "";
    if (!line.trim()) {
      i++;
      continue;
    }
    // heading
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      blocks.push({ type: "h", level: h[1]?.length ?? 1, text: h[2] ?? "" });
      i++;
      continue;
    }
    // hr
    if (/^\s*(-{3,}|\*{3,})\s*$/.test(line)) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }
    // table
    const nextLine: string = lines[i + 1] ?? "";
    if (isTableRow(line) && isTableDivider(nextLine)) {
      const rows: string[][] = [splitRow(line)];
      i += 2;
      while (i < lines.length && isTableRow(lines[i] ?? "")) {
        rows.push(splitRow(lines[i] ?? ""));
        i++;
      }
      blocks.push({ type: "table", rows });
      continue;
    }
    // unordered list
    if (/^\s*[-*+]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i] ?? "")) {
        items.push((lines[i] ?? "").replace(/^\s*[-*+]\s+/, ""));
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }
    // ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i] ?? "")) {
        items.push((lines[i] ?? "").replace(/^\s*\d+\.\s+/, ""));
        i++;
      }
      blocks.push({ type: "ol", items });
      continue;
    }
    // paragraph: gather until blank line or block start
    const para: string[] = [line];
    i++;
    while (
      i < lines.length &&
      (lines[i] ?? "").trim() &&
      !/^(#{1,4}\s|\s*[-*+]\s|\s*\d+\.\s)/.test(lines[i] ?? "") &&
      !isTableRow(lines[i] ?? "")
    ) {
      para.push(lines[i] ?? "");
      i++;
    }
    blocks.push({ type: "p", text: para.join("\n") });
  }
  return blocks;
}

export function MarkdownMessage({ text }: { text: string }) {
  const blocks = parseBlocks(text);
  return (
    <div className="space-y-2.5 text-sm leading-relaxed">
      {blocks.map((b, bi) => {
        switch (b.type) {
          case "h": {
            const size =
              b.level === 1
                ? "text-base font-bold"
                : b.level === 2
                  ? "text-sm font-bold"
                  : "text-sm font-semibold";
            return (
              <p key={bi} className={`${size} text-text-primary`}>
                {renderInline(b.text ?? "", `h${bi}`)}
              </p>
            );
          }
          case "hr":
            return <hr key={bi} className="border-border-subtle" />;
          case "ul":
            return (
              <ul key={bi} className="list-disc space-y-1 pl-5">
                {b.items?.map((it, ii) => (
                  <li key={ii}>{renderInline(it, `ul${bi}-${ii}`)}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={bi} className="list-decimal space-y-1 pl-5">
                {b.items?.map((it, ii) => (
                  <li key={ii}>{renderInline(it, `ol${bi}-${ii}`)}</li>
                ))}
              </ol>
            );
          case "table":
            return (
              <div key={bi} className="overflow-x-auto rounded-md border border-border-subtle">
                <table className="w-full text-xs">
                  <thead className="bg-black/15">
                    <tr>
                      {(b.rows?.[0] ?? []).map((c, ci) => (
                        <th key={ci} className="px-2.5 py-1.5 text-left font-semibold">
                          {renderInline(c, `th${bi}-${ci}`)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows?.slice(1).map((row, ri) => (
                      <tr key={ri} className="border-t border-border-subtle">
                        {row.map((c, ci) => (
                          <td key={ci} className="px-2.5 py-1.5">
                            {renderInline(c, `td${bi}-${ri}-${ci}`)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          default:
            return (
              <p key={bi} className="whitespace-pre-wrap">
                <Fragment>{renderInline(b.text ?? "", `p${bi}`)}</Fragment>
              </p>
            );
        }
      })}
    </div>
  );
}
