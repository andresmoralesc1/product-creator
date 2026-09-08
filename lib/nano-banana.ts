const ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent";
const API_KEY = process.env.GEMINI_API_KEY || "";

function base64ToBuffer(input: string): { mime: string; data: Buffer } {
  const match = input.match(/^data:([^;]+);base64,(.*)$/);
  if (match) {
    return { mime: match[1], data: Buffer.from(match[2], "base64") };
  }
  return { mime: "image/jpeg", data: Buffer.from(input, "base64") };
}

export interface EditImageInput {
  imageUrl: string;
  imageBase64?: string;
  prompt: string;
}

export interface EditImageResponse {
  imageBase64: string;
  mime: string;
}

export async function editProductImage(input: EditImageInput): Promise<EditImageResponse> {
  if (!API_KEY) throw new Error("GEMINI_API_KEY is not set");

  let imagePart: { inline_data: { mime_type: string; data: string } };
  if (input.imageBase64) {
    const { mime, data } = base64ToBuffer(input.imageBase64);
    imagePart = {
      inline_data: { mime_type: mime, data: data.toString("base64") },
    };
  } else {
    const res = await fetch(input.imageUrl);
    if (!res.ok) throw new Error(`Failed to fetch input image: ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    const contentType = res.headers.get("content-type") || "image/jpeg";
    const mime = contentType.split(";")[0];
    imagePart = {
      inline_data: { mime_type: mime, data: buffer.toString("base64") },
    };
  }

  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: input.prompt }, imagePart],
      },
    ],
    generationConfig: {
      responseModalities: ["IMAGE"],
    },
  };

  const res = await fetch(`${ENDPOINT}?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`nano-banana edit failed (${res.status}): ${await res.text()}`);
  }

  const data = (await res.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string; inline_data?: { mime_type: string; data: string } }> };
    }>;
  };

  const parts = data.candidates?.[0]?.content?.parts ?? [];
  const imagePart2 = parts.find((p) => p.inline_data);
  if (!imagePart2?.inline_data) {
    throw new Error("nano-banana returned no image");
  }

  return {
    imageBase64: imagePart2.inline_data.data,
    mime: imagePart2.inline_data.mime_type,
  };
}
