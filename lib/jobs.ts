import path from "node:path";
import fs from "node:fs/promises";
import type { ProductJob, JobStatus } from "./types";
import { STORAGE_PATHS } from "./storage";

const VALID_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  pending: ["editing", "failed"],
  editing: ["video_processing", "failed"],
  video_processing: ["ready", "failed"],
  ready: [],
  failed: [],
};

export async function loadJobs(): Promise<Record<string, ProductJob>> {
  try {
    const raw = await fs.readFile(STORAGE_PATHS.jobs, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export async function saveJobs(jobs: Record<string, ProductJob>) {
  await fs.mkdir(path.dirname(STORAGE_PATHS.jobs), { recursive: true });
  await fs.writeFile(STORAGE_PATHS.jobs, JSON.stringify(jobs, null, 2));
}

export async function getJob(id: string): Promise<ProductJob | null> {
  const jobs = await loadJobs();
  return jobs[id] || null;
}

export async function createJob(job: ProductJob): Promise<void> {
  const jobs = await loadJobs();
  jobs[job.id] = job;
  await saveJobs(jobs);
}

export async function updateJob(
  id: string,
  patch: Partial<ProductJob>,
): Promise<ProductJob | null> {
  const jobs = await loadJobs();
  const existing = jobs[id];
  if (!existing) return null;

  if (patch.status && !VALID_TRANSITIONS[existing.status].includes(patch.status)) {
    throw new Error(
      `Invalid transition: ${existing.status} -> ${patch.status} for job ${id}`,
    );
  }

  const updated: ProductJob = {
    ...existing,
    ...patch,
    id,
    updatedAt: Date.now(),
  };
  jobs[id] = updated;
  await saveJobs(jobs);
  return updated;
}
