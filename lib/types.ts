export type CategoryId =
  | "shoes"
  | "clothing"
  | "electronics"
  | "cosmetics"
  | "food"
  | "home";

export interface CategoryPreset {
  id: CategoryId;
  label: string;
  emoji: string;
  defaultPrompt: string;
}

export type JobStatus =
  | "pending"
  | "generating_image"
  | "video_processing"
  | "ready"
  | "failed";

export interface ProductJob {
  id: string;
  createdAt: number;
  updatedAt: number;
  status: JobStatus;
  category: CategoryId;
  description: string;
  prompt: string;
  originalPhotoUrl: string;
  marketingPhotoUrl?: string;
  videoUrl?: string;
  errorMessage?: string;
  minimaxVideoTaskId?: string;
  socialPosts?: {
    instagram?: string;
    tiktok?: string;
    facebook?: string;
  };
}

export interface SocialPostResult {
  platform: "instagram" | "tiktok" | "facebook";
  postId: string;
  url?: string;
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
}
