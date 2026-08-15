"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CodeTab {
  label: string;
  /** Pre-highlighted HTML from Shiki (server-side). */
  highlightedHtml: string;
  /** Raw code text for clipboard copy. */
  rawCode: string;
}

interface CodeDemoProps {
  tabs: CodeTab[];
}

export function CodeDemo({ tabs }: CodeDemoProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const activeTab = tabs[activeIndex];
  if (!activeTab) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeTab.rawCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border-default">
      {/* Tab bar */}
      <div className="flex items-center justify-between border-b border-border-subtle bg-inset px-4 py-2">
        <div className="flex gap-1">
          {tabs.map((tab, i) => (
            <button
              key={tab.label}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "rounded-md px-3 py-1 text-xs transition-colors",
                i === activeIndex
                  ? "bg-surface-3 text-text-primary"
                  : "text-text-muted hover:text-text-secondary",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={handleCopy}
          className="text-text-muted transition-colors hover:text-text-primary"
          aria-label="Copy code"
        >
          {copied ? (
            <Check className="h-4 w-4 text-success" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
      {/* Code — Shiki HTML with inline styles.
          overflow-auto on the inner container so long lines scroll
          inside the card instead of blowing out the grid column. */}
      <div
        className="max-h-[420px] min-w-0 overflow-auto text-sm [&_pre]:!overflow-x-auto [&_pre]:!bg-inset [&_pre]:!p-4 [&_pre]:!m-0 [&_code]:!font-mono"
        dangerouslySetInnerHTML={{ __html: activeTab.highlightedHtml }}
      />
    </div>
  );
}
