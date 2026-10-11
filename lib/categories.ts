import type { CategoryPreset, CategoryId } from "./types";

export const CATEGORIES: CategoryPreset[] = [
  {
    id: "shoes",
    label: "Tenis",
    emoji: "👟",
    defaultPrompt:
      "Professional commercial e-commerce studio product photograph of the sneaker. Completely remove any hands, fingers, arms, or human body parts holding or touching the shoes. Strictly preserve and protect all original sneaker details: exact colors, textures, materials, brand logos, silhouette, stitching, shoelaces, and sole tread without alteration or distortion. The sneaker is resting cleanly on a minimalist studio podium with natural soft contact shadows. Clean neutral light gray studio backdrop with gentle gradient, diffuse softbox studio lighting, ultra-sharp focus, crisp 4K advertising catalog look.",
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
    "High-end commercial advertisement for the sneakers. Dynamic yet elegant camera motion with a smooth 360-degree rotational orbit and gentle push-in close-up emphasizing the sneaker's premium materials, sole, and design. Clean luxury studio lighting with subtle moving soft reflections across the sneaker, minimalist commercial stage, crisp fluid motion, professional 4K television commercial cinematography.",
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
