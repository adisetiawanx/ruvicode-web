import { ImageResponse } from "next/og";
import { getAllPosts } from "@/lib/content/blog";

// Use nodejs runtime (not edge) so we can use fs-based content loader.
export const runtime = "nodejs";
export const alt = "Ruvicode Blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Pre-compute slug→post metadata at build time.
const POSTS = getAllPosts().map((p) => ({
  slug: p.slug,
  title: p.title,
  category: p.category,
  readingTime: p.readingTime,
}));

export default async function Image({
  params,
}: {
  params: { slug: string };
}) {
  const post = POSTS.find((p) => p.slug === params.slug);
  if (!post) return new Response("Not found", { status: 404 });

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
          padding: "60px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: "#D97757",
              borderRadius: 8,
            }}
          />
          <span style={{ color: "#D97757", fontSize: 24, fontWeight: 600 }}>
            Ruvicode
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <span style={{ color: "#B0AEA5", fontSize: 20 }}>{post.category}</span>
          <span
            style={{
              color: "#FAF9F5",
              fontSize: 48,
              fontWeight: 700,
              lineHeight: 1.1,
            }}
          >
            {post.title.length > 80
              ? post.title.slice(0, 80) + "..."
              : post.title}
          </span>
        </div>
        <div
          style={{ display: "flex", gap: "24px", color: "#6B6A63", fontSize: 18 }}
        >
          <span>ruvicode.com/blog</span>
          <span>{post.readingTime}</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
