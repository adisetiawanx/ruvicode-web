"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Check, Copy } from "lucide-react";

interface CodeTab {
  label: string;
  code: string;
}

export function QuickstartCode({ tabs }: { tabs: CodeTab[] }) {
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
    <div className="overflow-hidden rounded-lg border border-border-default">
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
            <pre className="overflow-x-auto bg-inset p-4 text-sm">
              <code className="font-mono text-text-primary">{tab.code}</code>
            </pre>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
