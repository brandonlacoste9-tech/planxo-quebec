/**
 * Planxo Quebec Compliance Module
 * 
 * Law 25 (Privacy) + Bill 96 (Language) compliance utilities.
 * Import from "@calcom/lib/quebec" in your cal.diy modules.
 */

export { logAudit, logPiiAccess } from "./audit-logger";
export { eraseUserData } from "./erase-user";
export { default as consentHandler } from "./consent-api";
