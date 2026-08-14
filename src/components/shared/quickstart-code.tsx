"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";

export interface HighlightedCodeTab {
  label: string;
  /** Raw source, used by the copy button. */
  code: string;
  /** Pre-rendered Shiki HTML (highlighted server-side, zero client JS). */
  highlightedHtml: string;
}

export function QuickstartCode({ tabs }: { tabs: HighlightedCodeTab[] }) {
  const [activeLabel, setActiveLabel] = useState(tabs[0]?.label ?? "");
  const [copied, setCopied] = useState(false);

  function copyToClipboard() {
    const active = tabs.find((t) => t.label === activeLabel);
    if (!active) return;
    navigator.clipboard.writeText(active.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border-default bg-code-bg">
      <Tabs
        value={activeLabel}
        onValueChange={(v) => setActiveLabel(v as string)}
      >
        <div className="flex items-center justify-between border-b border-border-subtle bg-surface px-2">
          <TabsList variant="line" className="h-10">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.label} value={tab.label}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={copyToClipboard}
            aria-label="Copy code"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-success" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
        {tabs.map((tab) => (
          <TabsContent key={tab.label} value={tab.label} className="mt-0">
            <div
              className="overflow-x-auto text-sm [&_pre]:!m-0 [&_pre]:!bg-transparent [&_pre]:!p-4 [&_code]:!font-mono"
              dangerouslySetInnerHTML={{ __html: tab.highlightedHtml }}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
