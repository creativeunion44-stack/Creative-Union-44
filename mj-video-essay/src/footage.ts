// Your own night shots. Until a file is set here, the scene shows its
// illustration instead. To use a shot: put the clip in public/footage/
// (vertical 9:16 works best) and write its name, e.g. "footage/hook.mp4".
// `from` trims the start of the clip, in seconds.
export type Shot = { src: string; from?: number } | null;

export const FOOTAGE: Record<"hook" | "feed" | "putDown", Shot> = {
  // Scene 1, 0-10 s: close-up of your face lit by the phone, scrolling.
  hook: null,
  // Scene 4, 60-75 s: over-the-shoulder shot of the endless feed on the phone.
  feed: null,
  // Scene 5, 75-90 s: you put the phone down, the screen goes dark.
  putDown: null,
};
