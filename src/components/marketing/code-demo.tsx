"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = {
  curl: `curl https://api.ruvicode.com/v1/chat/completions \\
  -H "Authorization: Bearer rvcd_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "glm-5.2",
    "messages": [{"role": "user", "content": "Hello"}]
  }'

# Response headers include:
# X-Cost: $0.000218`,
  python: `from openai import OpenAI

client = OpenAI(
    api_key="rvcd_...",
    base_url="https://api.ruvicode.com/v1"
)

response = client.chat.completions.create(
    model="glm-5.2",
    messages=[{"role": "user", "content": "Hello"}]
)
print(response.choices[0].message.content)`,
  node: `import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "rvcd_...",
  baseURL: "https://api.ruvicode.com/v1",
});

const response = await client.chat.completions.create({
  model: "glm-5.2",
  messages: [{ role: "user", content: "Hello" }],
});`,
} as const;

type TabKey = keyof typeof tabs;

export function CodeDemo() {
  const [activeTab, setActiveTab] = useState<TabKey>("curl");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(tabs[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border-default">
      {/* Tab bar */}
      <div className="flex items-center justify-between border-b border-border-subtle bg-inset px-4 py-2">
        <div className="flex gap-1">
          {(Object.keys(tabs) as TabKey[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "rounded-md px-3 py-1 text-xs transition-colors",
                activeTab === tab
                  ? "bg-surface-3 text-text-primary"
                  : "text-text-muted hover:text-text-secondary",
              )}
            >
              {tab}
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
      {/* Code */}
      <pre className="overflow-x-auto bg-inset p-4 font-mono text-sm text-text-primary">
        <code>{tabs[activeTab]}</code>
      </pre>
    </div>
  );
}
