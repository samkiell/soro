import { canViewReport, getCurrentUser } from "@/lib/permissions";
import { PHOTO_TYPES } from "@/lib/storage/image";
import { getPhoto } from "@/lib/storage/photos";
import { findReportPhotoRef } from "@/server/services/report-service";

const NO_STORE = { "Cache-Control": "private, no-store" };

/**
 * Streams a report's photo from the private bucket after checking that the viewer
 * may see the report (its reporter, or an admin). Missing and forbidden photos
 * both return 404 so report IDs can't be probed.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) return new Response(null, { status: 401, headers: NO_STORE });

  const report = await findReportPhotoRef(id);
  if (!report?.photoKey || !canViewReport(user, report)) {
    return new Response(null, { status: 404, headers: NO_STORE });
  }

  let photo;
  try {
    photo = await getPhoto(report.photoKey);
  } catch (error) {
    console.error("[photos] storage get failed", (error as Error).name);
    return new Response(null, { status: 502, headers: NO_STORE });
  }
  if (!photo) return new Response(null, { status: 404, headers: NO_STORE });

  const contentType =
    photo.contentType in PHOTO_TYPES ? photo.contentType : "application/octet-stream";

  return new Response(photo.body, {
    headers: {
      ...NO_STORE,
      "Content-Type": contentType,
      ...(photo.contentLength
        ? { "Content-Length": String(photo.contentLength) }
        : {}),
      "Content-Disposition": "inline",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
    },
  });
}
