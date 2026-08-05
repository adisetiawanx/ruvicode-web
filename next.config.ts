import type { NextConfig } from "next";

const config: NextConfig = {
  output: "standalone",
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    // Enable as needed
  },
};

export default config;
