import type { CategoryPreset, CategoryId } from "./types";

export const CATEGORIES: CategoryPreset[] = [
  {
    id: "shoes",
    label: "Zapatos",
    emoji: "👟",
    defaultPrompt:
      "Studio product photo of premium footwear, clean white background, soft shadows, e-commerce ready, sharp focus on materials and stitching, 4K.",
  },
  {
    id: "clothing",
    label: "Ropa",
    emoji: "👕",
    defaultPrompt:
      "High-end fashion product photography, garment laid flat or on invisible mannequin, neutral background, vibrant colors, soft even lighting, e-commerce catalog style, 4K.",
  },
  {
    id: "electronics",
    label: "Electrónica",
    emoji: "📱",
    defaultPrompt:
      "Modern tech product photography of the device, sleek minimalist setup, soft gradient background, subtle reflections, professional ad-quality lighting, e-commerce ready, 4K.",
  },
  {
    id: "cosmetics",
    label: "Cosméticos",
    emoji: "💄",
    defaultPrompt:
      "Luxury cosmetics product shot, soft pastel backdrop, dewy highlights, macro detail on packaging, elegant and clean, beauty campaign style, 4K.",
  },
  {
    id: "food",
    label: "Alimentos",
    emoji: "🍽️",
    defaultPrompt:
      "Appetizing food photography, rustic wooden table or marble surface, natural daylight, steam or freshness cues, vibrant colors, restaurant menu style, 4K.",
  },
  {
    id: "home",
    label: "Hogar",
    emoji: "🏠",
    defaultPrompt:
      "Cozy home product photography in a styled interior, warm natural light, tasteful decor, inviting atmosphere, lifestyle catalog look, 4K.",
  },
];

export const VIDEO_MOTION_PROMPTS: Record<CategoryId, string> = {
  shoes:
    "Slow cinematic 360 degree rotation of the shoe on a clean studio turntable, soft shadows, smooth camera orbit.",
  clothing:
    "Gentle camera pan over the garment flowing slightly in the breeze, soft fabric movement, elegant retail showcase.",
  electronics:
    "Sleek reveal shot of the device with subtle parallax and a soft glowing product highlight, modern ad energy.",
  cosmetics:
    "Macro close-up with slow zoom on the packaging and a soft bokeh background, luxurious beauty motion.",
  food:
    "Delicious slow motion steam rising from the dish, gentle camera push-in, warm cozy ambiance.",
  home:
    "Warm inviting lifestyle pan across the styled interior setting, soft daylight shifts, smooth dolly move.",
};

export function getCategory(id: CategoryId): CategoryPreset {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];
}
