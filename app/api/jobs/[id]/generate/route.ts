import { NextResponse } from "next/server";
import { getJob, updateJob } from "@/lib/jobs";
import { generateVideoFromImage } from "@/lib/minimax";
import { editProductImage } from "@/lib/nano-banana";
import { VIDEO_MOTION_PROMPTS } from "@/lib/categories";
import { STORAGE_PATHS } from "@/lib/storage";
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

    const edit = await editProductImage({
      imageUrl: job.originalPhotoUrl,
      prompt: job.prompt,
    });
    const marketingPhotoUrl = await saveBase64Image(
      edit.imageBase64,
      edit.mime,
      id,
    );

    const motionPrompt = `${VIDEO_MOTION_PROMPTS[job.category]} ${job.prompt}`;
    const videoRes = await generateVideoFromImage({
      imageUrl: job.originalPhotoUrl,
      prompt: motionPrompt,
      durationSec: 5,
      resolution: "768P",
    });

    await updateJob(id, {
      status: "video_processing",
      marketingPhotoUrl,
      minimaxVideoTaskId: videoRes.taskId,
    });

    return NextResponse.json({
      marketingPhotoUrl,
      videoTaskId: videoRes.taskId,
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
