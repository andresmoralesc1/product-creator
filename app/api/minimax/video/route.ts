import { NextResponse } from "next/server";
import { getJob, updateJob } from "@/lib/jobs";
import { generateVideoFromImage } from "@/lib/minimax";
import { VIDEO_MOTION_PROMPTS } from "@/lib/categories";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { jobId } = (await req.json()) as { jobId: string };
    const job = await getJob(jobId);
    if (!job) {
      return NextResponse.json({ error: "job not found" }, { status: 404 });
    }
    if (job.status !== "editing" || !job.editedPhotoUrl) {
      return NextResponse.json(
        { error: "edited image required before video" },
        { status: 400 },
      );
    }

    const motionPrompt = VIDEO_MOTION_PROMPTS[job.category];
    const task = await generateVideoFromImage({
      imageUrl: job.editedPhotoUrl,
      motionPrompt,
      durationSec: 5,
    });

    await updateJob(jobId, {
      status: "video_processing",
      minimaxVideoTaskId: task.task_id,
    });

    return NextResponse.json({ taskId: task.task_id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "video failed" },
      { status: 500 },
    );
  }
}
