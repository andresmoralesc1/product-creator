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
  | "editing"
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
  editedPhotoUrl?: string;
  videoUrl?: string;
  errorMessage?: string;
  minimaxEditTaskId?: string;
  minimaxVideoTaskId?: string;
  socialPosts?: {
    instagram?: string;
    tiktok?: string;
    facebook?: string;
  };
}

export interface MiniMaxTaskResponse {
  task_id: string;
  status: "pending" | "running" | "succeeded" | "failed";
  output?: {
    url?: string;
    images?: string[];
    videos?: string[];
  };
  error?: string;
}

export interface SocialPostResult {
  platform: "instagram" | "tiktok" | "facebook";
  postId: string;
  url?: string;
}
