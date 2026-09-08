import { NextResponse } from "next/server";
import { getJob, updateJob } from "@/lib/jobs";
import { postToInstagram, postToTikTok, postToFacebook } from "@/lib/social";
import { socialPostSchema } from "@/lib/validations";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = socialPostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { jobId, platforms, caption } = parsed.data;
    const job = await getJob(jobId);
    if (!job) {
      return NextResponse.json({ error: "job not found" }, { status: 404 });
    }
    if (job.status !== "ready" || !job.videoUrl) {
      return NextResponse.json(
        { error: "job not ready" },
        { status: 400 },
      );
    }

    const photoUrl = job.marketingPhotoUrl || job.originalPhotoUrl;

    const results: Record<string, string> = {};
    const errors: Record<string, string> = {};

    await Promise.all(
      platforms.map(async (p) => {
        try {
          if (p === "instagram") {
            const r = await postToInstagram({
              imageUrl: photoUrl,
              caption,
              videoUrl: job.videoUrl,
            });
            results.instagram = r.postId;
          } else if (p === "tiktok") {
            if (!job.videoUrl) {
              errors[p] = "video required for tiktok";
              return;
            }
            const r = await postToTikTok({ videoUrl: job.videoUrl, caption });
            results.tiktok = r.postId;
          } else if (p === "facebook") {
            const r = await postToFacebook({
              imageUrl: photoUrl,
              caption,
              videoUrl: job.videoUrl,
            });
            results.facebook = r.postId;
          }
        } catch (err) {
          errors[p] = err instanceof Error ? err.message : "post failed";
        }
      }),
    );

    const updated = await updateJob(jobId, {
      socialPosts: { ...(job.socialPosts || {}), ...results },
    });

    return NextResponse.json({ results, errors, job: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "social post failed" },
      { status: 500 },
    );
  }
}
