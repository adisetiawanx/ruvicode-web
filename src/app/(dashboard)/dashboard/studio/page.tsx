import type { Metadata } from "next";
import { ImagePlus, Wand2, Brush, Layers } from "lucide-react";
import { Container } from "@/components/layout/container";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Studio",
  robots: { index: false, follow: false },
};

const PLANNED = [
  {
    icon: Wand2,
    title: "Image generation",
    desc: "Generate images from text prompts using the same pay-per-request wallet. No subscription, no per-seat license.",
  },
  {
    icon: Brush,
    title: "Image editor",
    desc: "Inpaint, extend, and restyle images with brush-based edits and prompt control.",
  },
  {
    icon: Layers,
    title: "One wallet for everything",
    desc: "Text and image workloads share a single balance, a single API key, and one usage history.",
  },
];

export default function StudioPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Studio</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Image generation and editing, built on the Ruvicode wallet.
        </p>
      </div>

      <section className="overflow-hidden rounded-xl border border-border-default bg-surface">
        <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
          <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-border-default bg-surface-2">
            <ImagePlus className="h-6 w-6 text-text-muted" />
          </span>
          <h2 className="text-lg font-semibold text-text-primary">Coming soon</h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-text-secondary">
            Studio is where image generation and the image editor will live.
            It is not built yet. Everything below is the plan.
          </p>
        </div>

        <div className="grid gap-px border-t border-border-default bg-border-subtle sm:grid-cols-3">
          {PLANNED.map((item) => (
            <div key={item.title} className="bg-surface p-5">
              <item.icon className="mb-3 h-5 w-5 text-text-muted" />
              <h3 className="text-sm font-medium text-text-primary">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-text-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
