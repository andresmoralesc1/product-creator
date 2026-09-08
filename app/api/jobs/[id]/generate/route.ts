import { NextResponse } from "next/server";
import { getJob, updateJob } from "@/lib/jobs";
import { generateVideoFromImage } from "@/lib/minimax";
import { VIDEO_MOTION_PROMPTS } from "@/lib/categories";

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

    const motionPrompt = `${VIDEO_MOTION_PROMPTS[job.category]} ${job.prompt}`;
    const videoRes = await generateVideoFromImage({
      imageUrl: job.originalPhotoUrl,
      prompt: motionPrompt,
      durationSec: 5,
      resolution: "768P",
    });

    await updateJob(id, {
      status: "video_processing",
      minimaxVideoTaskId: videoRes.taskId,
    });

    return NextResponse.json({ videoTaskId: videoRes.taskId });
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
