import { NextResponse } from "next/server";
import { getJob, updateJob } from "@/lib/jobs";
import { editImage } from "@/lib/minimax";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { jobId } = (await req.json()) as { jobId: string };
    const job = await getJob(jobId);
    if (!job) {
      return NextResponse.json({ error: "job not found" }, { status: 404 });
    }
    if (job.status !== "pending") {
      return NextResponse.json(
        { error: `cannot edit from status ${job.status}` },
        { status: 400 },
      );
    }

    const task = await editImage({
      imageUrl: job.originalPhotoUrl,
      prompt: job.prompt,
    });

    await updateJob(jobId, {
      status: "editing",
      minimaxEditTaskId: task.task_id,
    });

    return NextResponse.json({ taskId: task.task_id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "edit failed" },
      { status: 500 },
    );
  }
}
