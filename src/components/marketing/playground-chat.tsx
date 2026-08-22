"use client";
import { trackPlaygroundMessage } from "@/lib/analytics";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ModelPicker } from "@/components/shared/model-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Send,
  Loader2,
  ChevronRight,
  KeyRound,
  Lock,
  Heart,
  TrendingDown,
} from "lucide-react";
import { toast } from "sonner";
import type { ModelWithPricing } from "@/lib/db/queries/models";
import { publicPlaygroundFallbackModel, displayModelName } from "@/lib/playground";
import { formatRate } from "@/lib/models/display";
import {
  ChatCodeBlock,
  parseMessageContent,
} from "@/components/chat/code-block";
import { MarkdownMessage } from "@/components/chat/markdown-message";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  reasoning?: string;
  /** Why generation stopped, shown under the message when not a normal end. */
  stopReason?: string;
}

interface PlaygroundChatProps {
  models: ModelWithPricing[];
  endpoint: string;
  lockModel?: string;
  /** Label of the API key the dashboard playground bills to. */
  activeKeyLabel?: string;
  /** Selectable API keys for the dashboard playground (id + label). */
  apiKeys?: Array<{ id: string; label: string }>;
  statsPosition?: "left" | "right";
  showSignupCta?: boolean;
  /** Public free playground shows a Free badge; the dashboard does not. */
  showFreeBadges?: boolean;
  hint?: string;
  hintSub?: string;
}

interface StreamChunk {
  choices?: Array<{
    delta?: {
      content?: string;
      reasoning?: string;
      reasoning_content?: string;
    };
    finish_reason?: string | null;
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    prompt_cache_hit_tokens?: number;
    cached_tokens?: number;
    completion_tokens_details?: {
      reasoning_tokens?: number;
    };
    prompt_tokens_details?: {
      cached_tokens?: number;
    };
  };
  usage_from_consumer?: {
    prompt_tokens?: number;
    completion_tokens?: number;
  };
  usage_from_provider?: {
    prompt_tokens?: number;
    completion_tokens?: number;
  };
}

const requestLimits = {
  maxTokensMin: 256,
  maxTokensMax: 4096,
  maxTokensStep: 256,
  tempMin: 0,
  tempMax: 2,
  tempStep: 0.1,
};

function costOf(
  model: ModelWithPricing | undefined,
  usage: { prompt: number; completion: number; cached?: number },
) {
  if (!model) return null;
  // Cached prompt tokens bill at the cache read rate (ADR-032); models
  // without a cache price bill everything at the normal input rate.
  const cached = Math.min(usage.cached ?? 0, usage.prompt);
  const cacheRate =
    model.user_cache_read > 0 ? model.user_cache_read : model.user_input;
  const billable = usage.prompt - cached;
  const input =
    (billable / 1_000_000) * model.user_input + (cached / 1_000_000) * cacheRate;
  const output = (usage.completion / 1_000_000) * model.user_output;
  const total = input + output;
  // What the same tokens would cost at the reference price, so the UI can
  // show how much the user saved versus paying full list price.
  const refCacheRate =
    model.ref_cache_read > 0 ? model.ref_cache_read : model.ref_input;
  const refInput =
    (billable / 1_000_000) * model.ref_input + (cached / 1_000_000) * refCacheRate;
  const refOutput = (usage.completion / 1_000_000) * model.ref_output;
  const refTotal = refInput + refOutput;
  const saved = Math.max(0, refTotal - total);
  return { input, output, total, saved, savedPct: refTotal > 0 ? (saved / refTotal) * 100 : 0 };
}


export function PlaygroundChat({
  models,
  endpoint,
  lockModel,
  activeKeyLabel,
  apiKeys,
  showFreeBadges = false,
  statsPosition = "left",
  showSignupCta = true,
  hint = "Try any model. No account needed.",
  hintSub = "Free, no account needed. Fair-use limits apply.",
}: PlaygroundChatProps) {
  const locked = lockModel ?? null;
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(
    apiKeys?.[0]?.id ?? null,
  );
  const [showKeyPicker, setShowKeyPicker] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const model = locked ?? selectedModel ?? models[0]?.model ?? publicPlaygroundFallbackModel;
  // Freedom serves ids like "MiniMax-M2.5" while catalog slugs are
  // lowercase ("minimax-m2.5"); compare case-insensitively so the
  // price panel still finds the matching catalog entry.
  const modelPricing = models.find(
    (m) => m.model.toLowerCase() === model.toLowerCase(),
  );

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // Privacy notice rendered under the chat input on both playgrounds.
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [needKey, setNeedKey] = useState(false);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [temperature, setTemperature] = useState(0.7);
  const [lastCost, setLastCost] = useState<{
    input: number;
    output: number;
    total: number;
    saved: number;
    savedPct: number;
  } | null>(null);
  const [lastUsage, setLastUsage] = useState<{
    prompt: number;
    completion: number;
  } | null>(null);
  const [lastReasoningTokens, setLastReasoningTokens] = useState(0);
  const [lastCachedTokens, setLastCachedTokens] = useState(0);

  // Chat scroll container: auto-follow the latest message while streaming,
  // but stop the moment the user scrolls up to read.
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);

  useEffect(() => {
    const el = scrollRef.current;
    if (el && stickToBottom.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  const handleChunk = useCallback(
    (chunk: StreamChunk, activeIndex: number) => {
      const finish = chunk.choices?.[0]?.finish_reason;
      if (finish && finish !== "stop") {
        const why =
          finish === "length"
            ? "Stopped at the max token limit. Raise it in the settings panel for longer replies."
            : finish === "content_filter"
              ? "Stopped by the safety filter."
              : `Stopped early (${finish}).`;
        setMessages((prev) =>
          prev.map((m, i) => (i === activeIndex ? { ...m, stopReason: why } : m)),
        );
      }

      const delta = chunk.choices?.[0]?.delta;
      const content = delta?.content ?? "";
      const reasoning =
        delta?.reasoning ?? delta?.reasoning_content ?? "";
      if (content || reasoning) {
        setMessages((prev) =>
          prev.map((m, i) => {
            if (i !== activeIndex) return m;
            return {
              ...m,
              content: m.content + content,
              reasoning: m.reasoning + reasoning,
            };
          }),
        );
      }

      // Provider may send usage as "usage" (standard) or
      // "usage_from_consumer" / "usage_from_provider" (vLLM).
      const rawUsage = chunk.usage ?? chunk.usage_from_consumer ?? chunk.usage_from_provider;
      if (rawUsage && (rawUsage.prompt_tokens ?? 0) > 0) {
        const usage = {
          prompt: rawUsage.prompt_tokens ?? 0,
          completion: rawUsage.completion_tokens ?? 0,
          cached:
            chunk.usage?.prompt_cache_hit_tokens ??
            chunk.usage?.cached_tokens ??
            chunk.usage?.prompt_tokens_details?.cached_tokens ??
            0,
        };
        setLastUsage(usage);
        setLastCachedTokens(usage.cached);
        setLastCost(costOf(modelPricing, usage));
        setLastReasoningTokens(
          chunk.usage?.completion_tokens_details?.reasoning_tokens ?? 0,
        );
        setLastCachedTokens(
          chunk.usage?.prompt_tokens_details?.cached_tokens ?? 0,
        );
      }
    },
    [modelPricing],
  );

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
          // ignore partial
        }
      }
    }
  }

  async function handleSend() {
    if (!input.trim() || loading) return;
    setLoading(true);
    setNeedKey(false);

    const userMessage: ChatMessage = { role: "user", content: input };
        const newMessages: ChatMessage[] = [...messages, userMessage, { role: "assistant", content: "", reasoning: "" }];
    const activeIndex = newMessages.length - 1;
    setMessages(newMessages);
    setInput("");

    try {
      trackPlaygroundMessage(endpoint.includes("dashboard") ? "dashboard" : "public");
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          ...(selectedKeyId ? { keyId: selectedKeyId } : {}),
          // Full conversation so the model remembers earlier turns. The
          // identity context is added server-side (in the public route for
          // the free playground, at the gateway for the dashboard), so it
          // is never visible in browser payloads.
          //
          // Empty assistant messages (a turn that stopped at the token
          // limit before any text arrived) are dropped: most upstreams
          // reject them with a 400 invalid-request error, which used to
          // leave the playground unable to send the next message.
          messages: [...messages, userMessage]
            .filter((m) => m.content.trim() !== "")
            .map((m) => ({
              role: m.role,
              content: m.content,
            })),
          max_tokens: maxTokens,
          temperature,
        }),
      });

      if (!res.ok) {
        let data: { error?: string; code?: string } = {};
        try { data = (await res.json()) as typeof data; } catch { /* ignore */ }
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

  // ─── Info bar ────────────────────────────────────────────
  const infoBar = (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border-default bg-surface p-4">
      <div className="flex items-center gap-3">
        {!locked ? (
          <div className="min-w-0 max-w-[220px]">
            <ModelPicker
              compact
              models={models}
              value={model}
              onChange={(v) => {
                setSelectedModel(v);
                setMessages([]);
                setLastCost(null);
                setLastUsage(null);
                setLastCachedTokens(0);
                setInput("");
              }}
            />
          </div>
        ) : (
          <span className="text-[15px] font-medium text-text-primary">
            {displayModelName(locked)}
          </span>
        )}
        <span className="hidden text-xs text-text-muted sm:inline">
          {maxTokens.toLocaleString()} tokens · {temperature.toFixed(1)} temp
        </span>
        <span className="hidden items-center gap-1.5 text-xs text-text-muted sm:inline-flex">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-success"></span>
          </span>
          stream: true
        </span>
        {showFreeBadges && (
          <Badge variant="outline" className="border-success/40 text-success">
            Free
          </Badge>
        )}
        {apiKeys && apiKeys.length > 0 && (
          <button
            type="button"
            onClick={() => setShowKeyPicker(true)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-border-subtle bg-surface-2 px-3 py-1 text-xs text-text-primary transition-colors hover:border-border-default"
          >
            <KeyRound className="h-3 w-3 text-accent-text" />
            <span className="max-w-[120px] truncate">
              {apiKeys.find((k) => k.id === selectedKeyId)?.label ?? apiKeys[0]?.label ?? ""}
            </span>
            <ChevronRight className="h-3 w-3 text-text-muted" />
          </button>
        )}
        {!apiKeys && activeKeyLabel && (
          <span className="hidden items-center gap-1.5 text-xs text-text-muted sm:inline-flex">
            <KeyRound className="h-3 w-3" />
            Key: <span className="font-medium text-text-secondary">{activeKeyLabel}</span>
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {lastCost && (
          <span className="font-mono text-xs tabular text-text-muted">
            ${lastCost.total.toFixed(6)}
          </span>
        )}
      </div>
    </div>
  );

  // ─── Settings panel (slide-out / inline) ──────────────────
  const settingsPanel = (
    <div className="space-y-5 rounded-lg border border-border-default bg-surface p-5">
      <div>
        {locked ? (
          <div className="space-y-2 rounded-md border border-border-subtle bg-surface-2 px-3 py-2.5">
            <p className="text-sm text-text-primary">
              {displayModelName(locked)}
            </p>
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-text-muted">Input</span>
              <span className="whitespace-nowrap tabular text-text-secondary">
                <span className="mr-1 text-[10px] text-text-muted line-through">
                  ${modelPricing ? modelPricing.ref_input.toFixed(3) : "?"}
                </span>
                ${modelPricing ? modelPricing.user_input.toFixed(3) : "?"}/1M
              </span>
            </div>
            {modelPricing && modelPricing.user_cache_read > 0 && (
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-text-muted">Cached</span>
                <span className="whitespace-nowrap tabular text-text-secondary">
                  <span className="mr-1 text-[10px] text-text-muted line-through">
                    ${formatRate(modelPricing.ref_cache_read)}
                  </span>
                  ${formatRate(modelPricing.user_cache_read)}/1M
                </span>
              </div>
            )}
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-text-muted">Output</span>
              <span className="whitespace-nowrap tabular text-text-secondary">
                <span className="mr-1 text-[10px] text-text-muted line-through">
                  ${modelPricing ? modelPricing.ref_output.toFixed(3) : "?"}
                </span>
                ${modelPricing ? modelPricing.user_output.toFixed(3) : "?"}/1M
              </span>
            </div>
          </div>
        ) : null}

        {!locked && modelPricing && (
          <div className="space-y-2 rounded-md border border-border-subtle bg-surface-2 px-3 py-2.5">
            <p className="text-sm text-text-primary">
              {modelPricing.display_name}
            </p>
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-text-muted">Input</span>
              <span className="whitespace-nowrap tabular text-text-secondary">
                <span className="mr-1 text-[10px] text-text-muted line-through">
                  ${modelPricing.ref_input.toFixed(3)}
                </span>
                ${modelPricing.user_input.toFixed(3)}/1M
              </span>
            </div>
            {modelPricing.user_cache_read > 0 && (
              <div className="flex items-center justify-between font-mono text-xs">
                <span className="text-text-muted">Cached</span>
                <span className="whitespace-nowrap tabular text-text-secondary">
                  <span className="mr-1 text-[10px] text-text-muted line-through">
                    ${formatRate(modelPricing.ref_cache_read)}
                  </span>
                  ${formatRate(modelPricing.user_cache_read)}/1M
                </span>
              </div>
            )}
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-text-muted">Output</span>
              <span className="whitespace-nowrap tabular text-text-secondary">
                <span className="mr-1 text-[10px] text-text-muted line-through">
                  ${modelPricing.ref_output.toFixed(3)}
                </span>
                ${modelPricing.user_output.toFixed(3)}/1M
              </span>
            </div>
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-text-muted">vs reference</span>
              <span className="tabular text-success">
                −{modelPricing.user_discount_pct.toFixed(0)}%
              </span>
            </div>
          </div>
        )}
      </div>


      <div className="space-y-3 rounded-md border border-border-subtle bg-surface-2 p-3">
        <p className="text-xs font-medium text-text-secondary">Request settings</p>
        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <span className="text-xs text-text-muted">Max tokens</span>
            <span className="font-mono text-xs tabular text-text-secondary">
              {maxTokens.toLocaleString()}
            </span>
          </div>
          <Slider
            value={maxTokens}
            onValueChange={(v) => setMaxTokens(Number(v))}
            min={requestLimits.maxTokensMin}
            max={requestLimits.maxTokensMax}
            step={requestLimits.maxTokensStep}
          />
        </div>
        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <span className="text-xs text-text-muted">Temperature</span>
            <span className="font-mono text-xs tabular text-text-secondary">
              {temperature.toFixed(1)}
            </span>
          </div>
          <Slider
            value={temperature}
            onValueChange={(v) => setTemperature(Number(v))}
            min={requestLimits.tempMin}
            max={requestLimits.tempMax}
            step={requestLimits.tempStep}
          />
        </div>
        {!showSignupCta && <p className="text-xs text-text-muted">Billed to your wallet</p>}
      </div>


      <div className="space-y-2 rounded-lg border border-border-subtle bg-surface-2 p-3">
        <p className="text-xs font-medium text-text-secondary">Last request</p>
        {showFreeBadges && (
          <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success-subtle px-2 py-0.5 text-[10px] font-medium text-success">
            <Heart className="h-2.5 w-2.5" />
            Covered by Ruvicode
          </span>
        )}

        {/* Cost */}
        <div>
          <p className="text-[10px] uppercase tracking-wider text-text-muted">Cost</p>
          <p className="font-mono text-base tabular font-semibold text-text-primary">
            ${(lastCost?.total ?? 0).toFixed(6)}
          </p>
        </div>

        {/* Savings */}
        {(lastCost?.saved ?? 0) > 0 && (
          <div className="rounded-md bg-success-subtle px-2.5 py-1.5">
            <p className="text-[10px] uppercase tracking-wider text-success">You saved</p>
            <p className="font-mono text-[11px] tabular text-success">
              ${(lastCost?.saved ?? 0).toFixed(6)} ({(lastCost?.savedPct ?? 0).toFixed(0)}% vs ref)
            </p>
          </div>
        )}

        {/* Input */}
        <div className="rounded-md border border-border-subtle bg-surface px-2.5 py-1.5">
          <p className="text-[10px] uppercase tracking-wider text-text-muted">Input</p>
          <p className="font-mono text-[11px] tabular text-text-secondary">
            ${(lastCost?.input ?? 0).toFixed(6)}
          </p>
          <p className="font-mono text-[11px] tabular font-medium text-accent-text">
            {lastUsage?.prompt ?? 0} tokens
          </p>
          <p className="font-mono text-[11px] tabular text-text-muted">
            {lastCachedTokens} cached
          </p>
        </div>

        {/* Output */}
        <div className="rounded-md border border-border-subtle bg-surface px-2.5 py-1.5">
          <p className="text-[10px] uppercase tracking-wider text-text-muted">Output</p>
          <p className="font-mono text-[11px] tabular text-text-secondary">
            ${(lastCost?.output ?? 0).toFixed(6)}
          </p>
          <p className="font-mono text-[11px] tabular font-medium text-accent-text">
            {lastUsage?.completion ?? 0} tokens
            {lastReasoningTokens > 0 ? ` (+${lastReasoningTokens})` : ""}
          </p>
        </div>
      </div>

      {/* API key picker dialog (dashboard playground) */}
      <Dialog open={showKeyPicker} onOpenChange={setShowKeyPicker}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Choose an API key</DialogTitle>
          </DialogHeader>
          <div className="max-h-[320px] space-y-1 overflow-y-auto">
            {(apiKeys ?? []).map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={() => {
                  setSelectedKeyId(k.id);
                  setShowKeyPicker(false);
                }}
                className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                  k.id === selectedKeyId
                    ? "border-accent/40 bg-accent-subtle text-text-primary"
                    : "border-border-subtle bg-surface-2 text-text-primary hover:border-border-default"
                }`}
              >
                <span className="truncate">{k.label}</span>
                {k.id === selectedKeyId && (
                  <span className="text-xs text-accent-text">Active</span>
                )}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {needKey && (
        <Button
          variant="primary"
          className="w-full"
          nativeButton={false}
          render={<Link href="/dashboard/keys" />}
        >
          <KeyRound className="mr-2 h-4 w-4" />
          Create API Key
        </Button>
      )}
    </div>
  );

  // ─── Chat area ────────────────────────────────────────────
  // The chat area needs a bounded height, otherwise the message list grows
  // the whole page instead of scrolling internally.
  const chatArea = (
    <div className="flex h-[600px] max-h-[75vh] flex-col rounded-lg border-2 border-border-strong bg-surface shadow-card">
      <div
        ref={scrollRef}
        onScroll={() => {
          const el = scrollRef.current;
          if (!el) return;
          // Keep auto-scrolling only while the user is parked near the bottom;
          // never yank them back down when they scrolled up to read.
          stickToBottom.current =
            el.scrollHeight - el.scrollTop - el.clientHeight < 48;
        }}
        className="flex-1 space-y-4 overflow-y-auto p-4"
      >
        {messages.length === 0 && (
          <div className="mt-16 text-center text-text-muted">
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
                className={`max-w-[85%] space-y-2 rounded-xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-accent text-text-inverse rounded-br-md"
                    : "bg-surface-2 text-text-primary rounded-bl-md"
                }`}
              >
                {msg.reasoning && (
                  <details
                    open={isStreamingSlot}
                    className="rounded-md bg-black/15 px-2 py-1 text-xs"
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
                    <ChatCodeBlock key={si} code={seg.content} language={seg.language} />
                  ) : (
                    <div key={si}>
                      <MarkdownMessage text={seg.content} />
                      {isStreamingSlot &&
                        si === parseMessageContent(msg.content).length - 1 &&
                        seg.type === "text" && (
                          <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse rounded-sm bg-accent" />
                        )}
                    </div>
                  ),
                )}
                {msg.stopReason && !isStreamingSlot && (
                  <p className="mt-2 rounded-md border border-warning/30 bg-warning-subtle px-2 py-1.5 text-xs text-[color:var(--warning)]">
                    {msg.stopReason}
                  </p>
                )}
                {isStreamingSlot && msg.content === "" && (
                  <Loader2 className="h-5 w-5 animate-spin text-text-muted" />
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
            placeholder="Type a message... (chats are not saved)"
            className="min-h-[44px] resize-none rounded-xl bg-surface-2"
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
            className="h-[44px] w-[44px] shrink-0 rounded-xl"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-text-muted">
          <Lock className="h-3 w-3 shrink-0" />
          Chat history is not stored. Clearing this page or your browser
          session removes the conversation.
        </p>
      </div>
    </div>
  );

  // ─── Layout assembly ──────────────────────────────────────
  // For the public playground (statsPosition="left"), settings sits to the
  // left of the chat. For the dashboard (statsPosition="right"), it sits to
  // the right. The info bar always spans the full width above both.
  if (statsPosition === "right") {
    return (
      <div className="space-y-4">
        {infoBar}
        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
          <div className="lg:order-1">{chatArea}</div>
          <div className="lg:order-2">{settingsPanel}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {infoBar}
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <div>{settingsPanel}</div>
        <div>{chatArea}</div>
      </div>
    </div>
  );
}