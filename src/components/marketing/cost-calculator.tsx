"use client";

import { useState, useMemo, useRef } from "react";
import { trackCalculatorUse } from "@/lib/analytics";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { LinkButton } from "@/components/shared/link-button";
import type { ModelWithPricing } from "@/lib/db/queries/models";

/** Common usage profiles for one-click fills. */
const PRESETS = [
  { label: "Light agent", input: 1_000_000, output: 500_000 },
  { label: "Coding assistant", input: 10_000_000, output: 2_000_000 },
  { label: "Heavy pipeline", input: 100_000_000, output: 20_000_000 },
];

function formatTokens(n: number): string {
  return n.toLocaleString("en-US");
}

export function CostCalculator({
  models,
}: {
  models: ModelWithPricing[];
}) {
  const [inputTokens, setInputTokens] = useState(1_000_000);
  const [outputTokens, setOutputTokens] = useState(500_000);
  const [selectedModel, setSelectedModel] = useState(models[0]?.model ?? "");

  const engaged = useRef(false);

  // Fire the engagement event once, on the first interaction (not mount)
  const onEngage = () => {
    if (engaged.current) return;
    engaged.current = true;
    trackCalculatorUse();
  };

  const selected = models.find((m) => m.model === selectedModel);

  const calculation = useMemo(() => {
    if (!selected) return null;

    const officialInputCost =
      (inputTokens / 1_000_000) * selected.ref_input;
    const officialOutputCost =
      (outputTokens / 1_000_000) * selected.ref_output;
    const officialTotal = officialInputCost + officialOutputCost;

    const ruvicodeInputCost =
      (inputTokens / 1_000_000) * selected.user_input;
    const ruvicodeOutputCost =
      (outputTokens / 1_000_000) * selected.user_output;
    const ruvicodeTotal = ruvicodeInputCost + ruvicodeOutputCost;

    const savings = officialTotal - ruvicodeTotal;
    const savingsPct =
      officialTotal > 0 ? (savings / officialTotal) * 100 : 0;

    return {
      official: officialTotal,
      ruvicode: ruvicodeTotal,
      savings,
      savingsPct,
      monthlySavings: savings,
      yearlySavings: savings * 12,
    };
  }, [selected, inputTokens, outputTokens]);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Input panel */}
      <div className="space-y-6 rounded-xl border border-border-default bg-surface p-6 md:p-8">
        <div>
          <label className="mb-2 block text-sm font-medium">Model</label>
          <Select
            value={selectedModel}
            onValueChange={(v) => { onEngage(); setSelectedModel(v as string); }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {models.map((m) => (
                <SelectItem key={m.model} value={m.model}>
                  {m.display_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selected && (
            <p className="mt-2 font-mono text-xs text-text-muted">
              ${selected.user_input < 1 ? selected.user_input.toFixed(4) : selected.user_input.toFixed(2)} in · $
              {selected.user_output < 1 ? selected.user_output.toFixed(4) : selected.user_output.toFixed(2)} out per 1M
              {selected.context && ` · ${selected.context} context`}
            </p>
          )}
        </div>

        {/* Usage presets */}
        <div>
          <p className="mb-2 text-sm font-medium">Usage profile</p>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setInputTokens(p.input);
                  setOutputTokens(p.output);
                }}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  inputTokens === p.input && outputTokens === p.output
                    ? "border-accent/40 bg-accent-subtle text-accent-text"
                    : "border-border-subtle text-text-secondary hover:border-border-default hover:text-text-primary"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Input tokens / month
          </label>
          <Input
            type="number"
            value={inputTokens}
            onChange={(e) => {
              onEngage();
              setInputTokens(Math.max(0, Number(e.target.value)));
            }}
            className="font-mono tabular"
          />
          <p className="mt-1 font-mono text-xs text-text-muted">
            {formatTokens(inputTokens)} tokens
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Output tokens / month
          </label>
          <Input
            type="number"
            value={outputTokens}
            onChange={(e) => {
              onEngage();
              setOutputTokens(Math.max(0, Number(e.target.value)));
            }}
            className="font-mono tabular"
          />
          <p className="mt-1 font-mono text-xs text-text-muted">
            {formatTokens(outputTokens)} tokens
          </p>
        </div>
      </div>

      {/* Results panel */}
      <div className="space-y-4">
        {calculation && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-border-default bg-surface p-6"
            >
              <p className="mb-1 text-xs text-text-secondary">
                Official provider price
              </p>
              <p className="font-mono tabular text-2xl text-text-muted line-through">
                ${calculation.official.toFixed(2)}/mo
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-lg border-2 border-accent bg-accent-subtle p-6"
            >
              <p className="mb-1 text-xs text-accent-text">Ruvicode price</p>
              <p className="font-mono tabular text-3xl text-text-primary">
                ${calculation.ruvicode.toFixed(2)}/mo
              </p>
              <div className="mt-4 border-t border-accent/20 pt-4">
                <p className="text-sm text-text-secondary">You save</p>
                <p className="font-mono tabular text-xl text-success">
                  ${calculation.monthlySavings.toFixed(2)}/mo · $
                  {calculation.yearlySavings.toFixed(2)}/yr
                </p>
                <p className="mt-1 font-mono text-sm text-success">
                  −{calculation.savingsPct.toFixed(0)}%
                </p>
              </div>
            </motion.div>

            <LinkButton href="/register" variant="primary" size="lg" className="w-full">
              Get Started →
            </LinkButton>
          </>
        )}
      </div>
    </div>
  );
}
