/**
 * Law 25 Consent API — Quebec privacy compliance
 *
 * POST   /api/quebec/consent  — Record user consent for specific purposes
 * GET    /api/quebec/consent  — Get user's consent status
 * DELETE /api/quebec/consent  — Withdraw consent
 */

import { getServerSession } from "@calcom/features/auth/lib/getServerSession";
import { logAudit, logPiiAccess } from "@calcom/lib/quebec/audit-logger";
import { prisma } from "@calcom/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession({ req });

  if (!session?.user?.id) {
    return res.status(401).json({ error: "Non autorisé — veuillez vous connecter." });
  }

  const userId = parseInt(String(session.user.id), 10);
  const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "unknown";
  const ua = req.headers["user-agent"] || "unknown";

  // ── GET: Read consent status ──
  if (req.method === "GET") {
    await logPiiAccess(userId, "ConsentRecord", undefined, "User viewed consent status", {
      ipAddress: ip,
      userAgent: ua,
    });

    const [records, user] = await Promise.all([
      prisma.consentRecord.findMany({
        where: { userId },
        select: { purpose: true, granted: true, createdAt: true },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { consentGiven: true, consentGivenAt: true, consentPurposes: true },
      }),
    ]);

    return res.status(200).json({ records, user });
  }

  // ── POST: Grant consent ──
  if (req.method === "POST") {
    const { purposes } = req.body; // string[] of purposes

    if (!Array.isArray(purposes) || !purposes.length) {
      return res.status(400).json({ error: "Veuillez spécifier au moins une finalité de consentement." });
    }

    const validPurposes = ["essential", "analytics", "marketing", "email_notifications", "calendar_sync"];
    const invalid = purposes.filter((p: string) => !validPurposes.includes(p));
    if (invalid.length) {
      return res.status(400).json({ error: `Finalités invalides: ${invalid.join(", ")}` });
    }

    // Upsert consent records
    for (const purpose of purposes) {
      await prisma.consentRecord.upsert({
        where: { userId_purpose: { userId, purpose } },
        update: { granted: true, ipAddress: ip, userAgent: ua },
        create: { userId, purpose, granted: true, ipAddress: ip, userAgent: ua },
      });
    }

    // Update user-level consent
    await prisma.user.update({
      where: { id: userId },
      data: {
        consentGiven: true,
        consentGivenAt: new Date(),
        consentPurposes: purposes,
      },
    });

    await logAudit({
      userId,
      action: "consent_change",
      resource: "User",
      resourceId: String(userId),
      detail: `User granted consent for: ${purposes.join(", ")}`,
      ipAddress: ip,
      userAgent: ua,
    });

    return res.status(200).json({ status: "success", purposes });
  }

  // ── DELETE: Withdraw all consent ──
  if (req.method === "DELETE") {
    await prisma.consentRecord.deleteMany({ where: { userId } });
    await prisma.user.update({
      where: { id: userId },
      data: { consentGiven: false, consentPurposes: [] },
    });

    await logAudit({
      userId,
      action: "consent_change",
      resource: "User",
      resourceId: String(userId),
      detail: "User withdrew all consent",
      ipAddress: ip,
      userAgent: ua,
    });

    return res.status(200).json({ status: "success", message: "Consentement retiré." });
  }

  return res.status(405).json({ error: "Méthode non supportée." });
}
