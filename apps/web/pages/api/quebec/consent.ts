/**
 * Law 25 Consent API — Quebec privacy compliance
 *
 * Re-exports the secure, session-validated consent handler from the core libraries.
 * Authenticates requests using Next-Auth to prevent BOLA/IDOR vulnerabilities.
 */

import consentHandler from "@calcom/lib/quebec/consent-api";

export default consentHandler;
