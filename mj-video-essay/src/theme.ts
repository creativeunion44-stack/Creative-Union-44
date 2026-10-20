// Palette from the moodboard: gold and red for the 1980s, blue and
// near-black for today.
export const GOLD = "#E3A92B";
export const RED = "#B5422E";
export const BLUE = "#3E63C9";
export const NIGHT = "#0B0F1F";
export const CREAM = "#F5F1E8";
export const INK = "#15131A";
export const LIGHT_BLUE = "#8FAEF7";
export const SOFT_BLUE = "#BFD0FF";

export const WIDTH = 1080;
export const HEIGHT = 1920;
export const FPS = 30;

export const sec = (s: number) => Math.round(s * FPS);

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

// Reels / TikTok / Shorts overlays sit outside these lines
export const SAFE_TOP = 250;
export const SAFE_BOTTOM = 1500;
export const SIDE = 80;
