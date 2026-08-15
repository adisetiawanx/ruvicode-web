"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ModelPicker } from "@/components/shared/model-picker";
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
  statsPosition?: "left" | "right";
  showSignupCta?: boolean;
  /** Public free playground shows Free/Unlimited badges; the dashboard does not. */
  showFreeBadges?: boolean;
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
    finish_reason?: string | null;
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    completion_tokens_details?: {
      reasoning_tokens?: number;
    };
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
  usage: { prompt: number; completion: number },
) {
  if (!model) return null;
  const input = (usage.prompt / 1_000_000) * model.user_input;
  const output = (usage.completion / 1_000_000) * model.user_output;
  const total = input + output;
  // What the same tokens would cost at the reference price, so the UI can
  // show how much the user saved versus paying full list price.
  const refInput = (usage.prompt / 1_000_000) * model.ref_input;
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
  showFreeBadges = false,
  statsPosition = "left",
  showSignupCta = true,
  hint = "Try any model. No account needed.",
  hintSub = "Free, no account needed. Fair-use limits apply.",
}: PlaygroundChatProps) {
  const locked = lockModel ?? null;
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const model = locked ?? selectedModel ?? models[0]?.model ?? publicPlaygroundFallbackModel;
  const modelPricing = models.find((m) => m.model === model);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  // Privacy notice rendered under the chat input on both playgrounds.
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
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
      if (chunk.meta?.remaining !== undefined) {
        setRemaining(chunk.meta.remaining);
      }

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
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          // Full conversation so the model remembers earlier turns. The
          // identity context is added server-side in the route, so it is
          // never visible in browser payloads.
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
        <span className="text-[15px] font-medium text-text-primary">
          {locked ? displayModelName(locked) : (modelPricing?.display_name ?? model)}
        </span>
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
          <>
            <Badge variant="outline" className="border-success/40 text-success">
              Free
            </Badge>
            <Badge variant="outline" className="border-accent/40 text-accent-text">
              Unlimited
            </Badge>
          </>
        )}
        {activeKeyLabel && (
          <span className="hidden items-center gap-1.5 text-xs text-text-muted sm:inline-flex">
            <KeyRound className="h-3 w-3" />
            Key: <span className="font-medium text-text-secondary">{activeKeyLabel}</span>
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {remaining !== null && remaining <= 2 && (
          <Badge variant="destructive" className="text-xs">
            Slow down
          </Badge>
        )}
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
        <p className="mb-2 text-[13px] font-medium text-text-secondary">Model</p>
        {locked ? (
          <div className="space-y-2 rounded-md border border-border-subtle bg-surface-2 px-3 py-2.5">
            <p className="text-sm text-text-primary">
              {locked ? displayModelName(locked) : (modelPricing?.display_name ?? model)}
            </p>
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-text-muted">Input</span>
              <span className="tabular text-text-secondary">
                ${modelPricing ? modelPricing.user_input.toFixed(4) : "?"}/1M
              </span>
            </div>
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-text-muted">Output</span>
              <span className="tabular text-text-secondary">
                ${modelPricing ? modelPricing.user_output.toFixed(4) : "?"}/1M
              </span>
            </div>
          </div>
        ) : (
          <ModelPicker
            models={models}
            value={model}
            onChange={(v) => {
              setSelectedModel(v);
              setMessages([]);
              setLastCost(null);
              setLastUsage(null);
              setInput("");
            }}
          />
        )}

        {!locked && modelPricing && (
          <div className="mt-2 space-y-2 rounded-md border border-border-subtle bg-surface-2 px-3 py-2.5">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-text-muted">Input</span>
              <span className="tabular text-text-secondary">
                ${modelPricing.user_input.toFixed(4)}/1M
              </span>
            </div>
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-text-muted">Output</span>
              <span className="tabular text-text-secondary">
                ${modelPricing.user_output.toFixed(4)}/1M
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

      {activeKeyLabel && (
        <div className="space-y-1 rounded-md border border-border-subtle bg-surface-2 p-3">
          <p className="text-xs text-text-secondary">Billing key</p>
          <p className="flex items-center gap-1.5 text-sm text-text-primary">
            <KeyRound className="h-3.5 w-3.5 text-accent" />
            {activeKeyLabel}
          </p>
          <p className="text-xs text-text-muted">
            Requests use this key&apos;s rate and spend limits and bill your wallet.
          </p>
        </div>
      )}

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


      <div className="space-y-3 rounded-lg border border-border-subtle bg-surface-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-text-secondary">Last request</p>
          {showFreeBadges && (
            <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success-subtle px-2 py-0.5 text-[11px] font-medium text-success">
              <Heart className="h-3 w-3" />
              Covered by Ruvicode
            </span>
          )}
        </div>

        {/* Cost */}
        <div>
          <p className="mb-0.5 text-[11px] uppercase tracking-wider text-text-muted">
            Cost
          </p>
          <p className="font-mono text-lg tabular font-semibold text-text-primary">
            ${(lastCost?.total ?? 0).toFixed(6)}
          </p>
        </div>

        {/* Savings */}
        {(lastCost?.saved ?? 0) > 0 && (
          <div className="rounded-lg border border-success/20 bg-success-subtle px-3 py-2">
            <p className="mb-0.5 text-[11px] uppercase tracking-wider text-success">
              You saved
            </p>
            <p className="font-mono text-sm tabular font-medium text-success">
              ${(lastCost?.saved ?? 0).toFixed(6)} ({(lastCost?.savedPct ?? 0).toFixed(0)}% vs reference)
            </p>
          </div>
        )}

        {/* Input breakdown */}
        <div className="rounded-lg border border-border-subtle bg-surface px-3 py-2.5">
          <p className="mb-1 text-[11px] uppercase tracking-wider text-text-muted">
            Input
          </p>
          <div className="flex items-baseline justify-between">
            <p className="font-mono text-xs tabular text-text-secondary">
              ${(lastCost?.input ?? 0).toFixed(6)}
            </p>
            <p className="font-mono text-xs tabular font-medium text-accent-text">
              {lastUsage?.prompt ?? 0} tokens
            </p>
          </div>
        </div>

        {/* Output breakdown */}
        <div className="rounded-lg border border-border-subtle bg-surface px-3 py-2.5">
          <p className="mb-1 text-[11px] uppercase tracking-wider text-text-muted">
            Output
          </p>
          <div className="flex items-baseline justify-between">
            <p className="font-mono text-xs tabular text-text-secondary">
              ${(lastCost?.output ?? 0).toFixed(6)}
            </p>
            <p className="font-mono text-xs tabular font-medium text-accent-text">
              {lastUsage?.completion ?? 0} tokens
              {lastReasoningTokens > 0 ? ` (+${lastReasoningTokens})` : ""}
            </p>
          </div>
        </div>
      </div>

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