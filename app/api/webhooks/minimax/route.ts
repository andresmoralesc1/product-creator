import { NextResponse } from "next/server";
import { getJob, updateJob } from "@/lib/jobs";
import { downloadToStorage } from "@/lib/storage";
import { verifyWebhookSignature } from "@/lib/minimax";
import type { MiniMaxTaskResponse } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const raw = await req.text();
    const signature = req.headers.get("x-minimax-signature");
    if (!verifyWebhookSignature(raw, signature)) {
      return NextResponse.json({ error: "invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(raw) as {
      task_id: string;
      status: MiniMaxTaskResponse["status"];
      output?: MiniMaxTaskResponse["output"];
      error?: string;
      type?: "image_edit" | "image_to_video";
    };

    const jobs = await import("@/lib/jobs");
    const allJobs = await jobs.loadJobs();
    const matchedEntry = Object.entries(allJobs).find(
      ([, j]) =>
        j.minimaxEditTaskId === event.task_id ||
        j.minimaxVideoTaskId === event.task_id,
    );
    if (!matchedEntry) {
      return NextResponse.json({ ok: true, ignored: true });
    }
    const [jobId, job] = matchedEntry;

    if (event.status === "failed") {
      await updateJob(jobId, { status: "failed", errorMessage: event.error || "task failed" });
      return NextResponse.json({ ok: true });
    }

    if (event.status !== "succeeded" || !event.output) {
      return NextResponse.json({ ok: true, pending: true });
    }

    if (job.minimaxEditTaskId === event.task_id) {
      const imageUrl = event.output.images?.[0] || event.output.url;
      if (!imageUrl) {
        await updateJob(jobId, { status: "failed", errorMessage: "no image in output" });
        return NextResponse.json({ ok: true });
      }
      const stored = await downloadToStorage(imageUrl, "output", `${jobId}-edited`);
      await updateJob(jobId, { editedPhotoUrl: stored });
    } else if (job.minimaxVideoTaskId === event.task_id) {
      const videoUrl = event.output.videos?.[0] || event.output.url;
      if (!videoUrl) {
        await updateJob(jobId, { status: "failed", errorMessage: "no video in output" });
        return NextResponse.json({ ok: true });
      }
      const stored = await downloadToStorage(videoUrl, "output", `${jobId}-video`);
      await updateJob(jobId, { status: "ready", videoUrl: stored });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "webhook failed" },
      { status: 500 },
    );
  }
}
