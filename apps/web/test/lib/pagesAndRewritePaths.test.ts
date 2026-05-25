import { describe, expect, it } from "vitest";
import {
  topLevelRouteNamesWhitelistedForRewrite,
  topLevelRoutesExcludedFromOrgRewrite,
} from "../../pagesAndRewritePaths.js";

describe("pagesAndRewritePaths", () => {
  describe("beforeFiles must exclude top-level routes in pages/app router", () => {
    const ROUTES_EXCLUDED_FROM_ORG_REWRITE = [
      "apps",
      "availability",
      "booking",
      "error",
      "getting-started",
      "maintenance",
      "more",
      "not-found",
      "reschedule",
      "settings",
      "upgrade",
      "video",
      "bookings",
      "event-types",
      "icons",
      "payment",
      "signup",
      "d",
    ];

    it("should include all required top-level route names", () => {
      ROUTES_EXCLUDED_FROM_ORG_REWRITE.forEach((route) => {
        expect(topLevelRoutesExcludedFromOrgRewrite).toContain(route);
      });
    });

    it("should NOT include whitelisted routes", () => {
      topLevelRouteNamesWhitelistedForRewrite.forEach((route) => {
        expect(topLevelRoutesExcludedFromOrgRewrite).not.toContain(route);
      });
    });
  });
});
