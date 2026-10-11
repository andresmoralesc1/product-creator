import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";

const STORAGE_DIR = process.env.STORAGE_DIR || path.join(process.cwd(), "data");

export const STORAGE_PATHS = {
  uploads: path.join(STORAGE_DIR, "uploads"),
  outputs: path.join(STORAGE_DIR, "outputs"),
  jobs: path.join(STORAGE_DIR, "jobs.json"),
};

export async function ensureStorage() {
  await fs.mkdir(STORAGE_PATHS.uploads, { recursive: true });
  await fs.mkdir(STORAGE_PATHS.outputs, { recursive: true });
}

export function safeExtension(url: string): string {
  const match = url.match(/\.(jpg|jpeg|png|webp|mp4|mov|webm)(\?|$)/i);
  return match ? `.${match[1].toLowerCase()}` : ".bin";
}

export async function downloadToStorage(
  remoteUrl: string,
  prefix: "upload" | "output",
  jobId: string,
): Promise<string> {
  await ensureStorage();
  const ext = safeExtension(remoteUrl);
  const filename = `${prefix}-${jobId}-${crypto.randomBytes(6).toString("hex")}${ext}`;
  const filepath = prefix === "output"
    ? path.join(STORAGE_PATHS.outputs, filename)
    : path.join(STORAGE_PATHS.uploads, filename);

  const res = await fetch(remoteUrl);
  if (!res.ok) throw new Error(`Failed to download ${remoteUrl}: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  await fs.writeFile(filepath, buffer);

  return `/api/files/${prefix}/${filename}`;
}

export async function saveUpload(
  buffer: Buffer,
  originalName: string,
  jobId: string,
): Promise<string> {
  await ensureStorage();
  const ext = path.extname(originalName) || ".jpg";
  const filename = `upload-${jobId}${ext}`;
  const filepath = path.join(STORAGE_PATHS.uploads, filename);
  await fs.writeFile(filepath, buffer);
  return `/api/files/upload/${filename}`;
}

export async function readFileBytes(storagePath: string): Promise<{ buffer: Buffer; mime: string }> {
  const filepath = path.join(STORAGE_DIR, storagePath.replace(/^\/api\/files\//, ""));
  const buffer = await fs.readFile(filepath);
  const ext = path.extname(filepath).toLowerCase();
  const mime =
    ext === ".png" ? "image/png" :
    ext === ".webp" ? "image/webp" :
    ext === ".mp4" ? "video/mp4" :
    ext === ".webm" ? "video/webm" :
    "image/jpeg";
  return { buffer, mime };
}

export async function saveVideo(
  buffer: Buffer,
  jobId: string,
  ext: string = ".mp4",
): Promise<string> {
  await ensureStorage();
  const filename = `output-${jobId}-video${ext}`;
  const filepath = path.join(STORAGE_PATHS.outputs, filename);
  await fs.writeFile(filepath, buffer);
  return `/api/files/output/${filename}`;
}
