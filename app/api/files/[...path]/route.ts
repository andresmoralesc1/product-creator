import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs";
import { readFileBytes } from "@/lib/storage";
import { STORAGE_PATHS } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path: segments } = await ctx.params;
    if (segments.length !== 2) {
      return NextResponse.json({ error: "bad path" }, { status: 400 });
    }
    const [kind, filename] = segments;
    const baseDir = kind === "upload" ? STORAGE_PATHS.uploads : STORAGE_PATHS.outputs;
    const filepath = path.join(baseDir, filename);

    if (!filepath.startsWith(baseDir)) {
      return NextResponse.json({ error: "bad path" }, { status: 400 });
    }
    if (!fs.existsSync(filepath)) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const { buffer, mime } = await readFileBytes(`/${kind}/${filename}`);
    const url = new URL(_req.url);
    const forceDownload = url.searchParams.get("download") === "1" || url.searchParams.get("download") === "true";

    const headers: Record<string, string> = {
      "Content-Type": mime,
      "Cache-Control": "public, max-age=31536000",
    };
    if (forceDownload) {
      headers["Content-Disposition"] = `attachment; filename="${filename}"`;
    }

    return new NextResponse(new Uint8Array(buffer), { headers });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "file fetch failed" },
      { status: 500 },
    );
  }
}
