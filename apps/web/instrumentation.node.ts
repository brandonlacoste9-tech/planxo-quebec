// This file is loaded ONLY by the Node.js runtime (Next.js 15+/16.x feature).
// The edge bundler never processes this file, which is why Node.js-only Sentry
// integrations (httpIntegration, prismaIntegration) can safely live in
// sentry.server.config.ts without causing edge-bundle resolution errors.
import process from "node:process";

export async function register() {
  if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_SENTRY_DSN) {
    await import("./sentry.server.config");
  }
}
