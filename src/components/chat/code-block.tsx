"use client";

import { useState } from "react";
import { Copy, Check, ChevronRight } from "lucide-react";

interface CodeBlockProps {
  code: string;
  language?: string;
}

/**
 * Renders a fenced code block extracted from the assistant's message.
 * Styled with the Ruvicode design tokens: dark background, monospace text,
 * language badge, and a copy-to-clipboard button.
 */
export function ChatCodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 overflow-hidden rounded-lg border border-border-default bg-inset">
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
      {/* Code */}
      <pre className="overflow-x-auto p-3 font-mono text-sm leading-relaxed text-code-text">
        <code>{code}</code>
      </pre>
    </div>
  );
}

/** Parse the first fenced code block from a message string. */
const fenceRegex = /```(\w+)?\n([\s\S]*?)```/g;

export interface ContentSegment {
  type: "text" | "code";
  content: string;
  language?: string;
}

/**
 * Split a message body into text and fenced-code segments so they can be
 * rendered differently (code gets the ChatCodeBlock treatment).
 */
export function parseMessageContent(body: string): ContentSegment[] {
  const segments: ContentSegment[] = [];
  let lastIndex = 0;

  for (const match of body.matchAll(fenceRegex)) {
    // Text before this code fence.
    const before = body.slice(lastIndex, match.index);
    if (before) segments.push({ type: "text", content: before });

    segments.push({
      type: "code",
      content: match[2] ?? "",
      language: match[1] ?? undefined,
    });
    lastIndex = (match.index ?? 0) + match[0].length;
  }

  // Remaining text after the last fence.
  const tail = body.slice(lastIndex);
  if (tail) segments.push({ type: "text", content: tail });

  return segments;
}