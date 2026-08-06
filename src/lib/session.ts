import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function getSession() {
  const h = await headers();
  const session = await auth.api.getSession({ headers: h });
  return session;
}

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}
