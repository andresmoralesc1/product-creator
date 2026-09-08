import { NextResponse } from "next/server";
import { getJob, updateJob, loadJobs } from "@/lib/jobs";
import { downloadToStorage } from "@/lib/storage";
import { handleWebhookChallenge } from "@/lib/minimax";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const raw = await req.text();

  const challenge = await handleWebhookChallenge(raw);
  if (challenge !== null) {
    return NextResponse.json({ challenge });
  }

  let event: {
    task?: {
      id: string;
      status: "queued" | "running" | "succeeded" | "failed" | "cancelled";
      content?: { url?: string };
      error?: { code: string; message: string };
    };
  };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const task = event.task;
  if (!task) return NextResponse.json({ ok: true, ignored: true });

  const allJobs = await loadJobs();
  const matchedEntry = Object.entries(allJobs).find(
    ([, j]) => j.minimaxVideoTaskId === task.id,
  );
  if (!matchedEntry) {
    return NextResponse.json({ ok: true, ignored: true });
  }
  const [jobId, job] = matchedEntry;

  if (task.status === "failed") {
    await updateJob(jobId, {
      status: "failed",
      errorMessage: task.error?.message || "video task failed",
    });
    return NextResponse.json({ ok: true });
  }

  if (task.status !== "succeeded" || !task.content?.url) {
    return NextResponse.json({ ok: true, pending: true });
  }

  const videoUrl = await downloadToStorage(
    task.content.url,
    "output",
    `${jobId}-video`,
  );
  await updateJob(jobId, { status: "ready", videoUrl });

  return NextResponse.json({ ok: true });
}
