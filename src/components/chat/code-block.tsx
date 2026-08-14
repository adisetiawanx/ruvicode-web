"use client";

import { useMemo, useState } from "react";
import { Copy, Check, ChevronRight } from "lucide-react";
import { highlight } from "@/lib/highlight";

interface CodeBlockProps {
  code: string;
  language?: string;
}

/**
 * Renders a fenced code block with syntax highlighting, a language badge,
 * and a copy-to-clipboard button. Wrapped in a dark container with the
 * Ruvicode design tokens.
 */
export function ChatCodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const highlighted = useMemo(
    () => highlight(code, language),
    [code, language],
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 overflow-hidden rounded-lg border border-border-default bg-code-bg">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border-subtle bg-surface-2 px-3 py-1.5">
        {language ? (
          <span className="font-mono text-xs text-text-muted">{language}</span>
        ) : (
          <span />
        )}
        <button
          onClick={handleCopy}
          className="text-text-muted transition-colors hover:text-text-primary"
          aria-label="Copy code"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-success" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
      {/* Highlighted code */}
      <pre className="overflow-x-auto p-3 font-mono text-sm leading-relaxed">
        <code
          className="hljs"
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </pre>
    </div>
  );
}

/** Parse fenced code blocks from a message body. */
const fenceRegex = /```(\w+)?\n?([\s\S]*?)```/g;

export interface ContentSegment {
  type: "text" | "code";
  content: string;
  language?: string;
}

/**
 * Split a message into text and fenced-code segments so they can be rendered
 * differently (code gets ChatCodeBlock, text goes through markdown rendering).
 */
export function parseMessageContent(body: string): ContentSegment[] {
  const segments: ContentSegment[] = [];
  let lastIndex = 0;

  for (const match of body.matchAll(fenceRegex)) {
    const before = body.slice(lastIndex, match.index);
    if (before) segments.push({ type: "text", content: before });

    segments.push({
      type: "code",
      content: (match[2] ?? match[1] ?? "").trim(),
      language: match[1] ?? undefined,
    });
    lastIndex = (match.index ?? 0) + match[0].length;
  }

  const tail = body.slice(lastIndex);
  if (tail) segments.push({ type: "text", content: tail });

  return segments;
}