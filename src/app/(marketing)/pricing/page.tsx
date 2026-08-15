import { redirect } from "next/navigation";

/**
 * /pricing was merged into /models (the two pages overlapped almost
 * entirely). Keep the redirect for old links and SEO history.
 */
export default function PricingRedirect() {
  redirect("/models");
}
