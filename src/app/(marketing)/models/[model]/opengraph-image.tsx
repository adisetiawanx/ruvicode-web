import { ImageResponse } from "next/og";
import { getModelBySlug } from "@/lib/db/queries/models";

// The model detail page queries Postgres, so this image must run on the
// Node runtime (the pg driver does not run on the edge).
export const runtime = "nodejs";
export const alt = "Ruvicode model API pricing";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Same slug validation as the page: lowercase alphanumeric, hyphens, dots,
// and colons (variant slugs like "kimi-k2.5:web" use them).
const SLUG_REGEX = /^[a-z0-9.:-]+$/;

function formatPrice(price: number): string {
  if (price < 1) return price.toFixed(4);
  return price.toFixed(2);
}

export default async function Image({
  params,
}: {
  params: Promise<{ model: string }>;
}) {
  const { model: slug } = await params;
  if (!SLUG_REGEX.test(slug)) return new Response("Not found", { status: 404 });
  const model = await getModelBySlug(slug);
  if (!model) return new Response("Not found", { status: 404 });

  return new ImageResponse(
    (
      <div
        style={{
          background: "#0F0F0E",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{ width: 36, height: 36, background: "#D97757", borderRadius: 10 }}
          />
          <span style={{ color: "#D97757", fontSize: 26, fontWeight: 600 }}>
            Ruvicode
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <span
            style={{
              color: "#FAF9F5",
              fontSize: 56,
              fontWeight: 700,
              lineHeight: 1.1,
              maxWidth: "1000px",
            }}
          >
            {model.display_name.length > 60
              ? model.display_name.slice(0, 60) + "..."
              : model.display_name}
          </span>
          <div style={{ display: "flex", gap: "40px", color: "#FAF9F5", fontSize: 34 }}>
            <span>Input ${formatPrice(model.user_input)}/1M</span>
            <span>Output ${formatPrice(model.user_output)}/1M</span>
          </div>
          <span
            style={{
              color: "#8FA876",
              fontSize: 26,
            }}
          >
            Save {model.user_discount_pct.toFixed(0)}% vs OpenRouter
          </span>
        </div>

        <div style={{ color: "#6B6A63", fontSize: 18 }}>
          ruvicode.com/models/{model.model}
        </div>
      </div>
    ),
    { ...size },
  );
}
