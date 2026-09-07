import type { SocialPostResult } from "../types";

export async function postToTikTok(opts: {
  videoUrl: string;
  caption: string;
}): Promise<SocialPostResult> {
  const accessToken = process.env.TIKTOK_ACCESS_TOKEN;
  const openId = process.env.TIKTOK_OPEN_ID;
  if (!accessToken || !openId) throw new Error("TikTok credentials missing");
  if (!opts.videoUrl) throw new Error("TikTok requires a video");

  const initRes = await fetch(
    "https://open.tiktokapis.com/v2/post/publish/video/init/",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        post_info: {
          title: opts.caption.slice(0, 2200),
          privacy_level: "PUBLIC_TO_EVERYONE",
        },
        source_info: {
          source: "PULL_FROM_URL",
          video_url: opts.videoUrl,
        },
      }),
    },
  );
  if (!initRes.ok) {
    throw new Error(`TikTok init failed: ${await initRes.text()}`);
  }
  const { data } = (await initRes.json()) as { data: { publish_id: string } };

  return {
    platform: "tiktok",
    postId: data.publish_id,
  };
}
