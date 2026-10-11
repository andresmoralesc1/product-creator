import { NextResponse } from "next/server";
import { getJob, updateJob } from "@/lib/jobs";
import { checkVeoOperation } from "@/lib/veo";
import { saveVideo, downloadToStorage } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  let job = await getJob(id);
  if (!job) {
    return NextResponse.json({ error: "job not found" }, { status: 404 });
  }

  // If waiting on Veo video generation, check operation progress
  if (job.status === "video_processing" && job.veoOperationId) {
    try {
      const opStatus = await checkVeoOperation(job.veoOperationId);
      if (opStatus.done) {
        if (opStatus.errorMessage) {
          job = await updateJob(id, {
            status: "failed",
            errorMessage: opStatus.errorMessage,
          }) || job;
        } else if (opStatus.videoBuffer) {
          const videoUrl = await saveVideo(opStatus.videoBuffer, id, ".mp4");
          job = await updateJob(id, {
            status: "ready",
            videoUrl,
          }) || job;
        } else if (opStatus.videoUri) {
          const videoUrl = await downloadToStorage(
            opStatus.videoUri,
            "output",
            `${id}-video`,
          );
          job = await updateJob(id, {
            status: "ready",
            videoUrl,
          }) || job;
        }
      }
    } catch (err) {
      console.error(`Error polling Veo operation for job ${id}:`, err);
    }
  }

  return NextResponse.json({ job });
}

