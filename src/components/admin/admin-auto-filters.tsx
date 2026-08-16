"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

export function AdminAutoFilters({ fields }: { fields: string[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const handler = () => {
      const params = new URLSearchParams();
      new FormData(form).forEach((value, key) => { if (typeof value === "string" && value) params.set(key, value); });
      router.replace(`${pathname}?${params.toString()}`);
    };
    fields.forEach((field) => {
      const element = form.elements.namedItem(field);
      if (element instanceof HTMLElement) element.addEventListener("change", handler);
    });
    return () => fields.forEach((field) => {
      const element = form.elements.namedItem(field);
      if (element instanceof HTMLElement) element.removeEventListener("change", handler);
    });
  }, [fields, pathname, router]);
  return null;
}
