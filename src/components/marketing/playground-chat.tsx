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
  Settings2,
  X,
  KeyRound,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import type { ModelWithPricing } from "@/lib/db/queries/models";
import { publicPlaygroundModel } from "@/lib/playground";
import {
  ChatCodeBlock,
  parseMessageContent,
} from "@/components/chat/code-block";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  reasoning?: string;
}

interface PlaygroundChatProps {
  models: ModelWithPricing[];
  endpoint: string;
  lockModel?: string;
  /** Label of the API key the dashboard playground bills to. */
  activeKeyLabel?: string;
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
  return { input, output, total: input + output };
}

export function PlaygroundChat({
  models,
  endpoint,
  lockModel,
  activeKeyLabel,
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
  const [showSettings, setShowSettings] = useState(true);
  const [maxTokens, setMaxTokens] = useState(4096);
  const [temperature, setTemperature] = useState(0.7);
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
          messages: [{ role: "user", content: input }],
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
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border-default bg-surface p-3">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-text-primary">
          {modelPricing?.display_name ?? model}
        </span>
        <span className="hidden text-xs text-text-muted sm:inline">
          {maxTokens.toLocaleString()} tokens · {temperature.toFixed(1)} temp
        </span>
        {activeKeyLabel && (
          <span className="hidden items-center gap-1.5 text-xs text-text-muted sm:inline-flex">
            <KeyRound className="h-3 w-3" />
            Key: <span className="font-medium text-text-secondary">{activeKeyLabel}</span>
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {remaining !== null && (
          <Badge variant={remaining > 0 ? "default" : "destructive"} className="text-xs">
            {remaining} left
          </Badge>
        )}
        {lastCost && (
          <span className="font-mono text-xs tabular text-text-muted">
            ${lastCost.total.toFixed(6)}
          </span>
        )}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="text-text-muted transition-colors hover:text-text-primary"
          aria-label="Toggle settings"
        >
          {showSettings ? <X className="h-4 w-4" /> : <Settings2 className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );

  // ─── Settings panel (slide-out / inline) ──────────────────
  const settingsPanel = showSettings && (
    <div className="space-y-4 rounded-lg border border-border-default bg-surface p-4">
      <div>
        <p className="mb-2 text-xs font-medium text-text-secondary">Model</p>
        {locked ? (
          <div className="rounded-md border border-border-subtle bg-surface-2 px-3 py-2">
            <p className="text-sm text-text-primary">{modelPricing?.display_name ?? model}</p>
            <p className="font-mono text-xs text-text-muted">
              ${modelPricing?.user_input.toFixed(2) ?? "?"}/1M input
            </p>
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

      {locked && (
        <div className="space-y-2 rounded-md border border-border-subtle bg-surface-2 p-3">
          <p className="text-xs font-medium text-text-secondary">
            Other models
          </p>
          <ul className="space-y-1">
            {models
              .filter((m) => m.model !== locked)
              .slice(0, 5)
              .map((m) => (
                <li
                  key={m.model}
                  className="flex items-center justify-between gap-2 text-xs"
                >
                  <span className="flex min-w-0 items-center gap-1.5 text-text-muted">
                    <Lock className="h-3 w-3 shrink-0" />
                    <span className="truncate">{m.display_name}</span>
                  </span>
                  <span className="shrink-0 font-mono tabular text-text-muted">
                    ${m.user_input.toFixed(2)}/1M
                  </span>
                </li>
              ))}
          </ul>
          <p className="pt-1 text-xs text-text-muted">
            Sign up to try every model in the dashboard playground.
          </p>
        </div>
      )}

      {lastCost && lastUsage && (
        <div className="space-y-1 rounded-md border border-border-subtle bg-surface-2 p-3">
          <p className="text-xs text-text-secondary">Last request</p>
          <p className="font-mono tabular text-lg text-text-primary">
            ${lastCost.total.toFixed(6)}
          </p>
          <div className="space-y-0.5 text-xs text-text-muted">
            <p>
              Input: ${lastCost.input.toFixed(6)} ({lastUsage.prompt} tokens)
            </p>
            <p>
              Output: ${lastCost.output.toFixed(6)} ({lastUsage.completion} tokens
              {lastReasoningTokens > 0 ? `, ${lastReasoningTokens} reasoning` : ""})
            </p>
          </div>
        </div>
      )}

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

  // ─── Chat area ────────────────────────────────────────────
  // The chat area needs a bounded height, otherwise the message list grows
  // the whole page instead of scrolling internally.
  const chatArea = (
    <div className="flex h-[600px] max-h-[75vh] flex-col rounded-lg border border-border-default bg-surface">
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
                    <p key={si} className="whitespace-pre-wrap text-sm leading-relaxed">
                      {seg.content}
                      {isStreamingSlot &&
                        si === parseMessageContent(msg.content).length - 1 &&
                        seg.type === "text" && (
                          <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse rounded-sm bg-accent" />
                        )}
                    </p>
                  ),
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
            placeholder="Type a message..."
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