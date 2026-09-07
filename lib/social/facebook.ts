import type { SocialPostResult } from "../types";

export async function postToFacebook(opts: {
  imageUrl: string;
  caption: string;
  videoUrl?: string;
}): Promise<SocialPostResult> {
  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;
  const pageId = process.env.FACEBOOK_PAGE_ID;
  if (!accessToken || !pageId) throw new Error("Facebook credentials missing");

  const endpoint = `https://graph.facebook.com/v20.0/${pageId}/${opts.videoUrl ? "videos" : "photos"}`;
  const payload = opts.videoUrl
    ? { access_token: accessToken, file_url: opts.videoUrl, description: opts.caption }
    : { access_token: accessToken, url: opts.imageUrl, caption: opts.caption };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Facebook post failed: ${await res.text()}`);
  const { id: postId } = (await res.json()) as { id: string };

  return { platform: "facebook", postId };
}
