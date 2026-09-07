import crypto from "node:crypto";
import type { MiniMaxTaskResponse } from "./types";

const BASE_URL = process.env.MINIMAX_BASE_URL || "https://api.minimax.io/v1";
const API_KEY = process.env.MINIMAX_API_KEY || "";

function authHeaders(): Record<string, string> {
  if (!API_KEY) throw new Error("MINIMAX_API_KEY is not set");
  return {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  };
}

async function request<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`MiniMax ${path} failed (${res.status}): ${text}`);
  }
  return (await res.json()) as T;
}

export interface ImageEditInput {
  imageUrl: string;
  prompt: string;
}

export interface VideoGenInput {
  imageUrl: string;
  motionPrompt: string;
  durationSec?: number;
}

export async function editImage(input: ImageEditInput): Promise<MiniMaxTaskResponse> {
  return request<MiniMaxTaskResponse>("/image/edit", {
    image: input.imageUrl,
    prompt: input.prompt,
    webhook_url: `${process.env.APP_BASE_URL}/api/webhooks/minimax`,
  });
}

export async function generateVideoFromImage(input: VideoGenInput): Promise<MiniMaxTaskResponse> {
  return request<MiniMaxTaskResponse>("/video/image-to-video", {
    image: input.imageUrl,
    motion_prompt: input.motionPrompt,
    duration: input.durationSec ?? 5,
    webhook_url: `${process.env.APP_BASE_URL}/api/webhooks/minimax`,
  });
}

export async function getTask(taskId: string): Promise<MiniMaxTaskResponse> {
  const res = await fetch(`${BASE_URL}/tasks/${taskId}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`MiniMax task fetch failed (${res.status})`);
  return (await res.json()) as MiniMaxTaskResponse;
}

export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
): boolean {
  const secret = process.env.MINIMAX_WEBHOOK_SECRET;
  if (!secret) return true;
  if (!signature) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}
