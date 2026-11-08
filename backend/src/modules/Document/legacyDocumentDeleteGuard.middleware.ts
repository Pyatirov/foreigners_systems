import type { RequestHandler } from "express";

const LEGACY_DOCUMENT_PREFIXES = [
  "/passports",
  "/visas",
  "/education_documents",
  "/petitions",
  "/medical_reports",
  "/migration_cards",
  "/arrival_notifications",
  "/education_agreements",
  "/termination_notifications",
];

/**
 * The old per-type endpoints are superseded by /api/documents. Block their DELETE
 * methods so they cannot bypass the new rule that physical document deletion is
 * allowed only through the admin-only, archive-only generic endpoint.
 */
export const blockLegacyDocumentHardDelete: RequestHandler = (req, res, next) => {
  if (req.method !== "DELETE") {
    next();
    return;
  }

  const isLegacyDocumentRoute = LEGACY_DOCUMENT_PREFIXES.some(
    (prefix) => req.path === prefix || req.path.startsWith(`${prefix}/`)
  );

  if (!isLegacyDocumentRoute) {
    next();
    return;
  }

  res.status(410).json({
    message: "Физическое удаление через устаревшие endpoints отключено. Используйте архивирование через /api/documents.",
  });
};
