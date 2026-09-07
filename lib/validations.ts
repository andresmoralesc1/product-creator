import { z } from "zod";

export const categoryIds = [
  "shoes",
  "clothing",
  "electronics",
  "cosmetics",
  "food",
  "home",
] as const;

export const createJobSchema = z.object({
  description: z
    .string()
    .min(3, "La descripción debe tener al menos 3 caracteres")
    .max(500, "Máximo 500 caracteres"),
  category: z.enum(categoryIds),
  prompt: z
    .string()
    .min(10, "El prompt debe tener al menos 10 caracteres")
    .max(2000),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;

export const socialPostSchema = z.object({
  jobId: z.string().min(1),
  platforms: z.array(z.enum(["instagram", "tiktok", "facebook"])).min(1),
  caption: z.string().min(1).max(2200),
});
