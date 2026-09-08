const BASE_URL = "https://api.minimax.io";
const API_KEY = process.env.MINIMAX_API_KEY || "";

function authHeaders(): Record<string, string> {
  if (!API_KEY) throw new Error("MINIMAX_API_KEY is not set");
  return {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  };
}

export interface ImageGenInput {
  prompt: string;
  aspectRatio?: "1:1" | "16:9" | "4:3" | "3:2" | "2:3" | "3:4" | "9:16" | "21:9";
  referenceImageUrl?: string;
  n?: number;
}

export interface ImageGenResponse {
  imageUrls: string[];
  usage?: { success_count: number; failed_count: number };
}

export async function generateImage(input: ImageGenInput): Promise<ImageGenResponse> {
  const body: Record<string, unknown> = {
    model: "image-01",
    prompt: input.prompt,
    aspect_ratio: input.aspectRatio ?? "1:1",
    response_format: "url",
    n: input.n ?? 1,
  };

  if (input.referenceImageUrl) {
    body.subject_reference = [
      { type: "character", image_file: input.referenceImageUrl },
    ];
  }

  const res = await fetch(`${BASE_URL}/v1/image_generation`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`MiniMax image_generation failed (${res.status}): ${await res.text()}`);
  }
  const data = (await res.json()) as {
    data?: { image_urls?: string[] };
    metadata?: { success_count: number; failed_count: number };
  };
  return {
    imageUrls: data.data?.image_urls ?? [],
    usage: data.metadata,
  };
}

export interface VideoGenInput {
  imageUrl: string;
  prompt: string;
  durationSec?: 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
  resolution?: "480P" | "768P" | "2K";
  model?: "MiniMax-H3" | "MiniMax-H3-Max";
}

export interface VideoGenResponse {
  taskId: string;
}

export async function generateVideoFromImage(input: VideoGenInput): Promise<VideoGenResponse> {
  const body = {
    model: input.model ?? "MiniMax-H3",
    content: [
      { type: "text", text: input.prompt },
      {
        type: "image_url",
        image_url: { url: input.imageUrl },
        role: "first_frame",
      },
    ],
    resolution: input.resolution ?? "768P",
    duration: input.durationSec ?? 5,
    ratio: "adaptive",
    callback_url: `${process.env.APP_BASE_URL}/api/webhooks/minimax`,
  };

  const res = await fetch(`${BASE_URL}/v2/video_generation`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`MiniMax video_generation failed (${res.status}): ${await res.text()}`);
  }
  const data = (await res.json()) as { task_id?: string };
  if (!data.task_id) throw new Error("MiniMax did not return task_id");
  return { taskId: data.task_id };
}

export type VideoTaskStatus =
  | "queued"
  | "running"
  | "succeeded"
  | "failed"
  | "cancelled";

export interface VideoTask {
  id: string;
  status: VideoTaskStatus;
  content?: { url?: string };
  error?: { code: string; message: string };
  created_at?: number;
  updated_at?: number;
}

export async function getVideoTask(taskId: string): Promise<VideoTask> {
  const res = await fetch(
    `${BASE_URL}/v2/query/video_generation/${taskId}`,
    { headers: authHeaders() },
  );
  if (!res.ok) {
    throw new Error(`MiniMax task fetch failed (${res.status}): ${await res.text()}`);
  }
  const data = (await res.json()) as { task: VideoTask };
  return data.task;
}

export async function handleWebhookChallenge(rawBody: string): Promise<string | null> {
  try {
    const event = JSON.parse(rawBody) as { challenge?: string };
    return event.challenge ?? null;
  } catch {
    return null;
  }
}
