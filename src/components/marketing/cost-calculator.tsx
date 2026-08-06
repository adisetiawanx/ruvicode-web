"use client";

import { useState, useMemo } from "react";
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

export function CostCalculator({
  models,
}: {
  models: ModelWithPricing[];
}) {
  const [inputTokens, setInputTokens] = useState(1_000_000);
  const [outputTokens, setOutputTokens] = useState(500_000);
  const [selectedModel, setSelectedModel] = useState(models[0]?.model ?? "");

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
      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium">Model</label>
          <Select
            value={selectedModel}
            onValueChange={(v) => setSelectedModel(v as string)}
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
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Input tokens / month
          </label>
          <Input
            type="number"
            value={inputTokens}
            onChange={(e) =>
              setInputTokens(Math.max(0, Number(e.target.value)))
            }
            className="font-mono tabular"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Output tokens / month
          </label>
          <Input
            type="number"
            value={outputTokens}
            onChange={(e) =>
              setOutputTokens(Math.max(0, Number(e.target.value)))
            }
            className="font-mono tabular"
          />
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
