"use client";

/**
 * Law 25 Consent Banner — Quebec privacy compliance
 *
 * Granular consent for cookies, analytics, and marketing.
 * Shown on first visit; remembers choice in localStorage.
 * Conformément à la Loi 25 du Québec.
 */

import { useCallback, useEffect, useState } from "react";

type Purpose = "essential" | "analytics" | "marketing";
type ConsentMap = Record<Purpose, boolean>;

const STORAGE_KEY = "planxo_consent_v1";
const CONSENT_API = "/api/quebec/consent";

const PURPOSE_LABELS: Record<Purpose, { fr: string; desc: string }> = {
  essential: {
    fr: "Essentiels",
    desc: "Nécessaires au fonctionnement de la plateforme de réservation. Requis en tout temps.",
  },
  analytics: {
    fr: "Analytiques",
    desc: "Nous aident à comprendre comment vous utilisez le service pour l'améliorer.",
  },
  marketing: {
    fr: "Marketing",
    desc: "Utilisés pour vous informer des nouveaux services et fonctionnalités.",
  },
};

function loadConsent(): ConsentMap | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveConsent(map: ConsentMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {}
}

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [showCustomize, setShowCustomize] = useState(false);
  const [consent, setConsent] = useState<ConsentMap>({
    essential: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const existing = loadConsent();
    if (!existing) {
      setVisible(true);
    }
  }, []);

  const toggle = (p: Purpose) => {
    if (p === "essential") return;
    setConsent((prev) => ({ ...prev, [p]: !prev[p] }));
  };

  const acceptAll = useCallback(() => {
    const all: ConsentMap = { essential: true, analytics: true, marketing: true };
    saveConsent(all);
    setVisible(false);
    // Fire-and-forget to consent API if userId available
    trySendConsent(all);
  }, []);

  const acceptSelected = useCallback(() => {
    saveConsent(consent);
    setVisible(false);
    trySendConsent(consent);
  }, [consent]);

  const declineAll = useCallback(() => {
    const minimal: ConsentMap = { essential: true, analytics: false, marketing: false };
    saveConsent(minimal);
    setVisible(false);
    trySendConsent(minimal);
  }, []);

  function trySendConsent(map: ConsentMap) {
    const purposes = Object.entries(map)
      .filter(([, v]) => v)
      .map(([k]) => k);
    // Try to get userId from window if available (injected by booking page)
    const userId = (window as any).__planxo_userId;
    if (userId) {
      fetch(CONSENT_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, purposes }),
      }).catch(() => {});
    }
  }

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div style={styles.backdrop} />

      {/* Banner */}
      <div style={styles.banner}>
        <div style={styles.header}>
          <span style={styles.shield}>🛡️</span>
          <div>
            <h3 style={styles.title}>Respect de votre vie privée</h3>
            <p style={styles.subtitle}>
              Conformément à la <strong>Loi 25 du Québec</strong>, nous recueillons votre consentement
              explicite avant d'utiliser des témoins non-essentiels.
            </p>
          </div>
        </div>

        {showCustomize && (
          <div style={styles.purposes}>
            {(["essential", "analytics", "marketing"] as Purpose[]).map((p) => {
              const { fr, desc } = PURPOSE_LABELS[p];
              return (
                <label key={p} style={styles.purposeRow}>
                  <div style={{ flex: 1 }}>
                    <div style={styles.purposeName}>{fr}</div>
                    <div style={styles.purposeDesc}>{desc}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={consent[p]}
                    onChange={() => toggle(p)}
                    disabled={p === "essential"}
                    style={styles.checkbox}
                  />
                </label>
              );
            })}
          </div>
        )}

        <div style={styles.actions}>
          {!showCustomize ? (
            <>
              <button onClick={() => setShowCustomize(true)} style={styles.btnOutline}>
                Personnaliser
              </button>
              <button onClick={declineAll} style={styles.btnOutline}>
                Refuser
              </button>
              <button onClick={acceptAll} style={styles.btnPrimary}>
                Tout accepter
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setShowCustomize(false)} style={styles.btnOutline}>
                ← Retour
              </button>
              <button onClick={acceptSelected} style={styles.btnPrimary}>
                Confirmer la sélection
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    zIndex: 99998,
  },
  banner: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    background: "#fff",
    borderTop: "1px solid rgba(0,0,0,0.08)",
    boxShadow: "0 -4px 24px rgba(0,0,0,0.1)",
    padding: "20px 24px",
    zIndex: 99999,
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    maxWidth: 600,
    margin: "0 auto",
    borderRadius: "12px 12px 0 0",
  },
  header: { display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 16 },
  shield: { fontSize: 28, flexShrink: 0 },
  title: { margin: 0, fontSize: 16, fontWeight: 700, color: "#242424" },
  subtitle: { margin: "4px 0 0", fontSize: 13, color: "#6b7280", lineHeight: 1.5 },
  purposes: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginBottom: 16,
    padding: "12px 0",
    borderTop: "1px solid rgba(0,0,0,0.06)",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
  },
  purposeRow: { display: "flex", alignItems: "center", gap: 12, cursor: "pointer", padding: "6px 0" },
  purposeName: { fontSize: 13, fontWeight: 600, color: "#242424" },
  purposeDesc: { fontSize: 11, color: "#898989", marginTop: 1 },
  checkbox: { width: 18, height: 18, cursor: "pointer", accentColor: "#242424" },
  actions: { display: "flex", gap: 8, justifyContent: "flex-end", flexWrap: "wrap" as any },
  btnPrimary: {
    padding: "10px 20px",
    borderRadius: 8,
    border: "none",
    background: "#242424",
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
  },
  btnOutline: {
    padding: "10px 20px",
    borderRadius: 8,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "#fff",
    color: "#242424",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'Inter', sans-serif",
  },
};
