import { NextResponse } from "next/server";
import { getJob, updateJob } from "@/lib/jobs";
import { startVeoVideo } from "@/lib/veo";
import { editProductImage } from "@/lib/nano-banana";
import { VIDEO_MOTION_PROMPTS } from "@/lib/categories";
import { STORAGE_PATHS, readFileBytes } from "@/lib/storage";
import path from "node:path";
import fs from "node:fs/promises";

export const runtime = "nodejs";

async function saveBase64Image(
  base64: string,
  mime: string,
  jobId: string,
): Promise<string> {
  const ext = mime === "image/png" ? ".png" : mime === "image/webp" ? ".webp" : ".jpg";
  const filename = `output-${jobId}-marketing${ext}`;
  const filepath = path.join(STORAGE_PATHS.outputs, filename);
  await fs.mkdir(STORAGE_PATHS.outputs, { recursive: true });
  await fs.writeFile(filepath, Buffer.from(base64, "base64"));
  return `/api/files/output/${filename}`;
}

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    const job = await getJob(id);
    if (!job) {
      return NextResponse.json({ error: "job not found" }, { status: 404 });
    }
    if (job.status !== "pending") {
      return NextResponse.json(
        { error: `cannot generate from status ${job.status}` },
        { status: 400 },
      );
    }

    await updateJob(id, { status: "editing_image" });

    const { buffer: originalBuffer, mime: originalMime } = await readFileBytes(job.originalPhotoUrl);

    // 1. nano-banana product-preserving edit
    const edit = await editProductImage({
      imageBuffer: originalBuffer,
      mimeType: originalMime,
      prompt: job.prompt,
    });
    const marketingPhotoUrl = await saveBase64Image(
      edit.imageBase64,
      edit.mime,
      id,
    );

    // 2. Google Veo video generation using the clean studio photo as starting frame
    const editedImageBuffer = Buffer.from(edit.imageBase64, "base64");
    const motionPrompt = `${VIDEO_MOTION_PROMPTS[job.category]} ${job.description ? `Product: ${job.description}.` : ""}`;
    const videoRes = await startVeoVideo({
      imageBuffer: editedImageBuffer,
      mimeType: edit.mime || "image/png",
      prompt: motionPrompt,
      durationSeconds: 5,
    });

    await updateJob(id, {
      status: "video_processing",
      marketingPhotoUrl,
      veoOperationId: videoRes.operationName,
    });

    return NextResponse.json({
      marketingPhotoUrl,
      veoOperationId: videoRes.operationName,
    });
  } catch (err) {
    try {
      const { id } = await ctx.params;
      await updateJob(id, {
        status: "failed",
        errorMessage: err instanceof Error ? err.message : "generate failed",
      });
    } catch {}
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "generate failed" },
      { status: 500 },
    );
  }
}
