import { NextResponse } from "next/server";
import { getJob, updateJob } from "@/lib/jobs";
import { generateImage, generateVideoFromImage } from "@/lib/minimax";
import { downloadToStorage } from "@/lib/storage";

export const runtime = "nodejs";

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

    await updateJob(id, { status: "generating_image" });

    const imageRes = await generateImage({
      prompt: job.prompt,
      aspectRatio: "1:1",
    });
    const firstImageUrl = imageRes.imageUrls[0];
    if (!firstImageUrl) {
      throw new Error("MiniMax returned no image URLs");
    }

    const marketingPhotoUrl = await downloadToStorage(
      firstImageUrl,
      "output",
      `${id}-marketing`,
    );

    const videoRes = await generateVideoFromImage({
      imageUrl: job.originalPhotoUrl,
      prompt: `${job.prompt} Smooth subtle camera motion, cinematic lighting.`,
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
