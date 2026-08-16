"use client";

import { useEffect, useState } from "react";

/**
 * Renders a timestamp in the BROWSER's timezone.
 *
 * The server stores and ships UTC; server-rendered toLocaleString would use
 * the server's timezone instead of the viewer's. This component renders the
 * formatted string after hydration (suppressHydrationWarning keeps the brief
 * server/client mismatch from blowing up React).
 */
export function ClientTime({
  utc,
  format = "datetime",
  className,
}: {
  utc: string | Date;
  format?: "datetime" | "date" | "time" | "relative";
  className?: string;
}) {
  const d = typeof utc === "string" ? new Date(utc) : utc;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (Number.isNaN(d.getTime())) return null;

  let text: string;
  switch (format) {
    case "date":
      text = d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      break;
    case "time":
      text = d.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
      break;
    case "relative": {
      if (!mounted) {
        text = "";
      } else {
        const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
        if (seconds < 60) text = `${seconds}s ago`;
        else if (seconds < 3600) text = `${Math.floor(seconds / 60)}m ago`;
        else if (seconds < 86400)
          text = `${Math.floor(seconds / 3600)}h ago`;
        else text = `${Math.floor(seconds / 86400)}d ago`;
      }
      break;
    }
    case "datetime":
    default:
      // Day-first format (16 Aug, 14:30) without the year — these stamps
      // are always recent, so the year is noise.
      text = d.toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
      break;
  }

  return (
    <time
      dateTime={d.toISOString()}
      className={className}
      suppressHydrationWarning
    >
      {text}
    </time>
  );
}
