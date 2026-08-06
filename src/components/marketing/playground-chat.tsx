"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { playgroundChat } from "@/app/(marketing)/playground/actions";
import type { ModelWithPricing } from "@/lib/db/queries/models";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function PlaygroundChat({
  models,
}: {
  models: ModelWithPricing[];
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [model, setModel] = useState(models[0]?.model ?? "glm-5.2");
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [lastCost, setLastCost] = useState<{
    input: number;
    output: number;
    total: number;
  } | null>(null);
  const [lastUsage, setLastUsage] = useState<{
    prompt_tokens: number;
    completion_tokens: number;
  } | null>(null);

  async function handleSend() {
    if (!input.trim() || loading) return;
    setLoading(true);

    const userMessage: Message = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");

    const result = await playgroundChat({
      model,
      messages: [{ role: "user", content: input }],
      max_tokens: 500,
    });

    setLoading(false);

    if (!result.ok) {
      toast.error(result.error);
      if (result.remaining !== undefined) setRemaining(result.remaining);
      return;
    }

    setRemaining(result.data.remaining);
    setLastCost(result.data.cost);
    setLastUsage(result.data.usage);
    setMessages([
      ...newMessages,
      { role: "assistant", content: result.data.content },
    ]);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      {/* Settings panel */}
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Model</label>
          <Select value={model} onValueChange={(v) => setModel(v as string)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {models.map((m) => (
                <SelectItem key={m.model} value={m.model}>
                  {m.display_name} — ${m.user_input.toFixed(2)}/1M
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Cost estimate display */}
        {lastCost && lastUsage && (
          <div className="space-y-1 rounded-lg border border-border-default bg-surface p-4">
            <p className="text-xs text-text-secondary">Last request cost</p>
            <p className="font-mono tabular text-lg text-text-primary">
              ${lastCost.total.toFixed(6)}
            </p>
            <div className="space-y-0.5 text-xs text-text-muted">
              <p>
                Input: ${lastCost.input.toFixed(6)} (
                {lastUsage.prompt_tokens} tokens)
              </p>
              <p>
                Output: ${lastCost.output.toFixed(6)} (
                {lastUsage.completion_tokens} tokens)
              </p>
            </div>
          </div>
        )}

        {remaining !== null && (
          <Badge
            variant={remaining > 0 ? "default" : "destructive"}
            className="w-full justify-center"
          >
            {remaining} free requests remaining
          </Badge>
        )}

        <Button variant="primary" className="w-full" nativeButton={false} render={<Link href="/register" />}>
          Sign up for unlimited →
        </Button>
      </div>

      {/* Chat interface */}
      <div className="flex h-[500px] flex-col rounded-lg border border-border-default bg-surface">
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.length === 0 && (
            <div className="mt-20 text-center text-text-muted">
              <p>Try any model. No account needed.</p>
              <p className="mt-1 text-xs">5 free requests per hour.</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  msg.role === "user"
                    ? "bg-accent text-text-inverse"
                    : "bg-surface-2 text-text-primary"
                }`}
              >
                {/* Content is sanitized server-side via DOMPurify */}
                <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-lg bg-surface-2 px-4 py-2">
                <Loader2 className="h-4 w-4 animate-spin text-text-secondary" />
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="border-t border-border-subtle p-4">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="resize-none"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button
              variant="primary"
              size="icon"
              onClick={handleSend}
              disabled={loading || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
