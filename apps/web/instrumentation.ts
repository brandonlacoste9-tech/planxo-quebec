import process from "node:process";
import * as Sentry from "@sentry/nextjs";
import type { Instrumentation } from "next";

export async function register() {
  // Node.js Sentry init is handled by instrumentation.node.ts (Next.js 15+ feature)
  // which is never processed by the edge bundler — keeping Node.js-only integrations safe.
  if (process.env.NODE_ENV === "production") {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN && process.env.NEXT_RUNTIME === "edge") {
      await import("./sentry.edge.config");
    }
  }
}

export const onRequestError: Instrumentation.onRequestError = (err, request, context) => {
  if (process.env.NODE_ENV === "production") {
    Sentry.captureRequestError(err, request, context);
  }
};
