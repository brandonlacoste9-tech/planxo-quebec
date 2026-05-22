/**
 * Law 25 Consent API — Quebec privacy compliance
 * 
 * POST   /api/quebec/consent  — Record consent for specific purposes
 * GET    /api/quebec/consent  — Get user's consent status  
 * DELETE /api/quebec/consent  — Withdraw all consent
 */

import type { NextApiRequest, NextApiResponse } from "next";

const VALID_PURPOSES = ["essential", "analytics", "marketing", "email_notifications", "calendar_sync"];

// Inline Prisma access — resolved at runtime via @calcom/prisma
async function getPrisma() {
  const { prisma } = await import("@calcom/prisma");
  return prisma;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const prisma = await getPrisma();
  const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "unknown";
  const ua = req.headers["user-agent"] || "unknown";

  // ── GET: Read consent status for a user ──
  if (req.method === "GET") {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "userId requis" });
    }
    const uid = parseInt(String(userId), 10);
    if (isNaN(uid)) return res.status(400).json({ error: "userId invalide" });

    try {
      const [records, user] = await Promise.all([
        prisma.consentRecord.findMany({
          where: { userId: uid },
          select: { purpose: true, granted: true, createdAt: true },
        }),
        prisma.user.findUnique({
          where: { id: uid },
          select: { consentGiven: true, consentGivenAt: true, consentPurposes: true },
        }),
      ]);
      return res.status(200).json({ records, user });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  // ── POST: Grant consent ──
  if (req.method === "POST") {
    const { userId, purposes } = req.body;
    if (!userId || !Array.isArray(purposes) || !purposes.length) {
      return res.status(400).json({ error: "userId et purposes (tableau) requis" });
    }

    const invalid = purposes.filter((p: string) => !VALID_PURPOSES.includes(p));
    if (invalid.length) {
      return res.status(400).json({ error: `Finalités invalides: ${invalid.join(", ")}` });
    }

    try {
      for (const purpose of purposes) {
        await prisma.consentRecord.upsert({
          where: { userId_purpose: { userId, purpose } },
          update: { granted: true, ipAddress: ip, userAgent: ua },
          create: { userId, purpose, granted: true, ipAddress: ip, userAgent: ua },
        });
      }

      await prisma.user.update({
        where: { id: userId },
        data: { consentGiven: true, consentGivenAt: new Date(), consentPurposes: purposes },
      });

      // Log the consent change
      try {
        await prisma.auditLog.create({
          data: {
            userId,
            action: "consent_change",
            resource: "User",
            resourceId: String(userId),
            detail: `Consentement accordé: ${purposes.join(", ")}`,
            ipAddress: ip,
            userAgent: ua,
            performedBy: "system",
          },
        });
      } catch (_) {}

      return res.status(200).json({ status: "success", purposes });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  // ── DELETE: Withdraw all consent ──
  if (req.method === "DELETE") {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "userId requis" });

    try {
      await prisma.consentRecord.deleteMany({ where: { userId } });
      await prisma.user.update({
        where: { id: userId },
        data: { consentGiven: false, consentPurposes: [] },
      });

      try {
        await prisma.auditLog.create({
          data: {
            userId,
            action: "consent_change",
            resource: "User",
            resourceId: String(userId),
            detail: "Consentement retiré",
            ipAddress: ip,
            userAgent: ua,
            performedBy: "system",
          },
        });
      } catch (_) {}

      return res.status(200).json({ status: "success", message: "Consentement retiré." });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: "Méthode non supportée." });
}
