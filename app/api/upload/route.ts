import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { createJob } from "@/lib/jobs";
import { saveUpload, ensureStorage } from "@/lib/storage";
import { CATEGORIES } from "@/lib/categories";
import type { ProductJob } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    await ensureStorage();
    const form = await req.formData();
    const file = form.get("photo");
    const description = String(form.get("description") || "");
    const category = String(form.get("category") || "shoes");
    const promptOverride = form.get("prompt") ? String(form.get("prompt")) : null;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "photo is required" }, { status: 400 });
    }
    if (description.length < 3) {
      return NextResponse.json({ error: "description too short" }, { status: 400 });
    }
    const cat = CATEGORIES.find((c) => c.id === category);
    if (!cat) {
      return NextResponse.json({ error: "invalid category" }, { status: 400 });
    }

    const jobId = nanoid(12);
    const buffer = Buffer.from(await file.arrayBuffer());
    const photoUrl = await saveUpload(buffer, file.name || "photo.jpg", jobId);

    const job: ProductJob = {
      id: jobId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: "pending",
      category: cat.id,
      description,
      prompt: promptOverride || cat.defaultPrompt,
      originalPhotoUrl: photoUrl,
    };
    await createJob(job);

    return NextResponse.json({ jobId, job });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "upload failed" },
      { status: 500 },
    );
  }
}
