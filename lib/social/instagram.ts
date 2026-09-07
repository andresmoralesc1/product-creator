import type { SocialPostResult } from "../types";

export async function postToInstagram(opts: {
  imageUrl: string;
  caption: string;
  videoUrl?: string;
}): Promise<SocialPostResult> {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const businessId = process.env.INSTAGRAM_BUSINESS_ID;
  if (!accessToken || !businessId) throw new Error("Instagram credentials missing");

  const mediaUrl = opts.videoUrl || opts.imageUrl;
  const mediaType = opts.videoUrl ? "VIDEO" : "IMAGE";

  const containerRes = await fetch(
    `https://graph.facebook.com/v20.0/${businessId}/media`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_token: accessToken,
        media_type: mediaType,
        url: mediaUrl,
        caption: opts.caption,
      }),
    },
  );
  if (!containerRes.ok) {
    throw new Error(`Instagram container failed: ${await containerRes.text()}`);
  }
  const { id: creationId } = (await containerRes.json()) as { id: string };

  const publishRes = await fetch(
    `https://graph.facebook.com/v20.0/${businessId}/media_publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_token: accessToken,
        creation_id: creationId,
      }),
    },
  );
  if (!publishRes.ok) {
    throw new Error(`Instagram publish failed: ${await publishRes.text()}`);
  }
  const { id: postId } = (await publishRes.json()) as { id: string };

  return { platform: "instagram", postId, url: `https://instagram.com/p/${postId}` };
}
