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
import { Send, Loader2, ChevronRight, KeyRound } from "lucide-react";
import { toast } from "sonner";
import type { ModelWithPricing } from "@/lib/db/queries/models";
import { publicPlaygroundModel } from "@/lib/playground";
import { ChatCodeBlock, parseMessageContent } from "@/components/chat/code-block";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  reasoning?: string;
}

interface PlaygroundChatProps {
  models: ModelWithPricing[];
  /** Chat route to POST to. Public and dashboard pages pass their own. */
  endpoint: string;
  /** Lock the model selector to one model (public playground). */
  lockModel?: string;
  /** Side the stats/cost panel sits on. Dashboard prefers the right. */
  statsPosition?: "left" | "right";
  showSignupCta?: boolean;
  hint?: string;
  hintSub?: string;
}

interface StreamChunk {
  meta?: { remaining?: number };
  choices?: Array<{
    delta?: {
      content?: string;
      reasoning?: string;
      reasoning_content?: string;
    };
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    completion_tokens_details?: {
      reasoning_tokens?: number;
    };
  };
}

function costOf(
  model: ModelWithPricing | undefined,
  usage: { prompt: number; completion: number },
) {
  if (!model) return null;
  const input = (usage.prompt / 1_000_000) * model.user_input;
  const output = (usage.completion / 1_000_000) * model.user_output;
  return { input, output, total: input + output };
}

export function PlaygroundChat({
  models,
  endpoint,
  lockModel,
  statsPosition = "left",
  showSignupCta = true,
  hint = "Try any model. No account needed.",
  hintSub = "5 free requests per day.",
}: PlaygroundChatProps) {
  const locked = lockModel ?? null;
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const model = locked ?? selectedModel ?? models[0]?.model ?? publicPlaygroundModel;
  const modelPricing = models.find((m) => m.model === model);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [remaining, setRemaining] = useState<number | null>(null);
    const [needKey, setNeedKey] = useState(false);
    const [lastCost, setLastCost] = useState<{
      input: number;
      output: number;
      total: number;
    } | null>(null);
    const [lastUsage, setLastUsage] = useState<{
      prompt: number;
      completion: number;
    } | null>(null);
    const [lastReasoningTokens, setLastReasoningTokens] = useState(0);
    // Default request settings shown in the stats panel.
    const requestSettings = {
      maxTokens: 4096,
      temperature: 0.7,
    };

  function handleChunk(chunk: StreamChunk, activeIndex: number) {
    if (chunk.meta?.remaining !== undefined) {
      setRemaining(chunk.meta.remaining);
    }

    const delta = chunk.choices?.[0]?.delta;
    const content = delta?.content ?? "";
    const reasoning = delta?.reasoning ?? delta?.reasoning_content ?? "";
    if (content || delta?.reasoning || delta?.reasoning_content) {
      setMessages((prev) =>
        prev.map((m, i) => {
          if (i !== activeIndex) return m;
          const next: ChatMessage = {
            ...m,
            content: m.content + content,
            reasoning: m.reasoning + reasoning,
          };
          return next;
        }),
      );
    }

    if (chunk.usage && (chunk.usage.prompt_tokens ?? 0) > 0) {
      const usage = {
        prompt: chunk.usage.prompt_tokens ?? 0,
        completion: chunk.usage.completion_tokens ?? 0,
      };
      setLastUsage(usage);
      setLastCost(costOf(modelPricing, usage));
      setLastReasoningTokens(
        chunk.usage.completion_tokens_details?.reasoning_tokens ?? 0,
      );
    }
  }

  async function readStream(res: Response, activeIndex: number) {
    const reader = res.body?.getReader();
    if (!reader) return;
    const decoder = new TextDecoder();
    let buffer = "";

    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(":")) continue;
        if (!trimmed.startsWith("data:")) continue;

        const payload = trimmed.slice(5).trim();
        if (payload === "[DONE]") return;
        try {
          handleChunk(JSON.parse(payload) as StreamChunk, activeIndex);
        } catch {
          // Partial or non-JSON line; ignore.
        }
      }
    }
  }

  async function handleSend() {
    if (!input.trim() || loading) return;
    setLoading(true);
    setNeedKey(false);

    const userMessage: ChatMessage = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    // Reserve the assistant slot so streaming appends into it.
    newMessages.push({ role: "assistant", content: "", reasoning: "" });
    const activeIndex = newMessages.length - 1;
    setMessages(newMessages);
    setInput("");

    try {
      const res = await fetch(endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                model,
                messages: [{ role: "user", content: input }],
                max_tokens: requestSettings.maxTokens,
                temperature: requestSettings.temperature,
              }),
            });

      if (!res.ok) {
        let data: { error?: string; code?: string } = {};
        try {
          data = (await res.json()) as typeof data;
        } catch {
          // Non-JSON error body.
        }
        toast.error(data.error ?? "Something went wrong. Please try again.");
        if (data.code === "no_active_key") setNeedKey(true);
        setMessages((prev) => prev.filter((_, i) => i !== activeIndex));
        return;
      }

      await readStream(res, activeIndex);
    } catch {
      toast.error("Something went wrong. Please try again.");
      setMessages((prev) => prev.filter((_, i) => i !== activeIndex));
    } finally {
      setLoading(false);
    }
  }

  const statsPanel = (
    <div className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium">Model</label>
        {locked ? (
          <div className="rounded-lg border border-border-default bg-surface px-3 py-2">
            <p className="text-sm font-medium text-text-primary">
              {modelPricing?.display_name ?? model}
            </p>
            <p className="font-mono text-xs text-text-secondary">
              ${modelPricing?.user_input.toFixed(2) ?? "?"}/1M input
            </p>
          </div>
        ) : (
          <Select
                      value={model}
                      onValueChange={(v) => {
                        setSelectedModel(v);
                        setMessages([]);
                        setLastCost(null);
                        setLastUsage(null);
                        setInput("");
                      }}
                    >
                      <SelectTrigger className="!w-full">
                        <SelectValue />
                      </SelectTrigger>
            <SelectContent>
              {models.map((m) => (
                <SelectItem key={m.model} value={m.model}>
                  {m.display_name} · ${m.user_input.toFixed(2)}/1M
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

            {/* Request settings */}
            <div className="space-y-1 rounded-lg border border-border-default bg-surface p-3">
              <p className="text-xs text-text-secondary">Request settings</p>
              <div className="space-y-0.5 font-mono text-xs text-text-muted tabular">
                <p>Max tokens: {requestSettings.maxTokens.toLocaleString()}</p>
                <p>Temperature: {requestSettings.temperature}</p>
                {!showSignupCta && <p>Billed to your wallet (per-key rate)</p>}
              </div>
            </div>

            {lastCost && lastUsage && (
        <div className="space-y-1 rounded-lg border border-border-default bg-surface p-4">
          <p className="text-xs text-text-secondary">Last request cost</p>
          <p className="font-mono tabular text-lg text-text-primary">
            ${lastCost.total.toFixed(6)}
          </p>
          <div className="space-y-0.5 text-xs text-text-muted">
            <p>
              Input: ${lastCost.input.toFixed(6)} ({lastUsage.prompt} tokens)
            </p>
            <p>
              Output: ${lastCost.output.toFixed(6)} (
              {lastUsage.completion} tokens
              {lastReasoningTokens > 0
                ? `, ${lastReasoningTokens} reasoning`
                : ""}
              )
            </p>
          </div>
        </div>
      )}

      {remaining !== null && (
        <Badge
          variant={remaining > 0 ? "default" : "destructive"}
          className="w-full justify-center"
        >
          {remaining} free requests remaining today
        </Badge>
      )}

      {needKey && (
        <div className="space-y-2 rounded-lg border border-border-default bg-surface p-4">
          <p className="text-sm text-text-secondary">
            You need an active API key to use the playground.
          </p>
          <Button
            variant="primary"
            className="w-full"
            nativeButton={false}
            render={<Link href="/dashboard/keys" />}
          >
            <KeyRound className="mr-2 h-4 w-4" />
            Create API Key
          </Button>
        </div>
      )}

      {showSignupCta && (
        <Button
          variant="primary"
          className="w-full"
          nativeButton={false}
          render={<Link href="/register" />}
        >
          Sign up for unlimited →
        </Button>
      )}
    </div>
  );

  const chatPanel = (
    <div className="flex h-[500px] flex-col rounded-lg border border-border-default bg-surface">
      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.length === 0 && (
          <div className="mt-20 text-center text-text-muted">
            <p>{hint}</p>
            <p className="mt-1 text-xs">{hintSub}</p>
          </div>
        )}
        {messages.map((msg, i) => {
          const isStreamingSlot = i === messages.length - 1 && loading;
          return (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] space-y-2 rounded-lg px-4 py-2 ${
                  msg.role === "user"
                    ? "bg-accent text-text-inverse"
                    : "bg-surface-2 text-text-primary"
                }`}
              >
                {msg.reasoning && (
                  <details
                    open={isStreamingSlot}
                    className="rounded-md bg-black/20 px-2 py-1 text-xs"
                  >
                    <summary className="flex cursor-pointer select-none items-center gap-1 text-text-secondary">
                      <ChevronRight className="h-3 w-3" />
                      Reasoning
                    </summary>
                    <p className="mt-1 whitespace-pre-wrap text-text-muted">
                      {msg.reasoning}
                    </p>
                  </details>
                )}
                                {parseMessageContent(msg.content).map((seg, si) =>
                                  seg.type === "code" ? (
                                    <ChatCodeBlock
                                      key={si}
                                      code={seg.content}
                                      language={seg.language}
                                    />
                                  ) : (
                                    <p key={si} className="whitespace-pre-wrap text-sm">
                                      {seg.content}
                                      {isStreamingSlot &&
                                        si === parseMessageContent(msg.content).length - 1 && (
                                          <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-accent" />
                                        )}
                                    </p>
                                  ),
                                )}
                                {isStreamingSlot && msg.content === "" && (
                                  <Loader2 className="h-4 w-4 animate-spin text-text-secondary" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

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
  );

  if (statsPosition === "right") {
    return (
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="lg:order-1">{chatPanel}</div>
        <div className="lg:order-2">{statsPanel}</div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <div>{statsPanel}</div>
      <div>{chatPanel}</div>
    </div>
  );
}
