import { GoogleGenAI, GenerateVideosOperation } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY || "";
const DEFAULT_VEO_MODEL = process.env.VEO_MODEL || "veo-2.0-generate-001";

function getClient(): GoogleGenAI {
  if (!API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in environment");
  }
  return new GoogleGenAI({ apiKey: API_KEY });
}

export interface StartVeoVideoInput {
  imageBuffer: Buffer;
  mimeType: string;
  prompt: string;
  durationSeconds?: number;
  aspectRatio?: "16:9" | "9:16";
}

export interface StartVeoVideoResponse {
  operationName: string;
}

export interface VeoStatusResponse {
  done: boolean;
  videoBuffer?: Buffer;
  videoUri?: string;
  mimeType?: string;
  errorMessage?: string;
}

/**
 * Start async video generation using Google Veo with product image as first frame.
 */
export async function startVeoVideo(input: StartVeoVideoInput): Promise<StartVeoVideoResponse> {
  const client = getClient();
  const base64 = input.imageBuffer.toString("base64");

  const operation = await client.models.generateVideos({
    model: DEFAULT_VEO_MODEL,
    prompt: input.prompt,
    image: {
      imageBytes: base64,
      mimeType: input.mimeType || "image/jpeg",
    },
    config: {
      numberOfVideos: 1,
      durationSeconds: input.durationSeconds ?? 5,
    },
  });

  if (!operation.name) {
    throw new Error("Veo did not return an operation name");
  }

  return { operationName: operation.name };
}

/**
 * Check the status of a Veo video generation operation.
 */
export async function checkVeoOperation(operationName: string): Promise<VeoStatusResponse> {
  const client = getClient();
  const opTarget = new GenerateVideosOperation();
  opTarget.name = operationName;

  const op = await client.operations.getVideosOperation({
    operation: opTarget,
  });

  if (!op.done) {
    return { done: false };
  }

  if (op.error) {
    const errorMsg =
      typeof op.error === "object"
        ? JSON.stringify(op.error)
        : String(op.error);
    return { done: true, errorMessage: errorMsg };
  }

  const generatedVideo = op.response?.generatedVideos?.[0]?.video;
  if (!generatedVideo) {
    return {
      done: true,
      errorMessage: "Veo operation marked done but returned no video",
    };
  }

  if (generatedVideo.videoBytes) {
    return {
      done: true,
      videoBuffer: Buffer.from(generatedVideo.videoBytes, "base64"),
      mimeType: generatedVideo.mimeType || "video/mp4",
    };
  }

  if (generatedVideo.uri) {
    return {
      done: true,
      videoUri: generatedVideo.uri,
      mimeType: generatedVideo.mimeType || "video/mp4",
    };
  }

  return {
    done: true,
    errorMessage: "Veo returned video without URI or bytes",
  };
}
