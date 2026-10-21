import timeline from "./timeline.json";
import { sec } from "./theme";

export const T = timeline;
export const DURATION = sec(T.duration);

// Which music plays when: "old" over 1980s images, "new" over today.
// Returns the gain of each stem at time t (seconds), with short crossfades.
const FADE = 0.6;

const windowGain = (t: number, from: number, to: number) => {
  if (t <= from - FADE / 2 || t >= to + FADE / 2) return 0;
  const a = Math.min(1, (t - (from - FADE / 2)) / FADE);
  const b = Math.min(1, (to + FADE / 2 - t) / FADE);
  return Math.min(a, b);
};

const oldWindows: [number, number][] = [
  T.then as [number, number],
  ...T.reasons.map((r) => [r.then, r.now] as [number, number]),
  // the song fades out just before the end
  [T.outroChord, T.duration - 1],
];

// Music dips under the tape rewind and the PLAY click so they are heard.
const REWIND: [number, number] = [T.then[0] - 0.7, T.then[0] + 0.05];
const duck = (t: number) => 1 - 0.8 * windowGain(t, REWIND[0], REWIND[1]);

export const oldGain = (t: number) =>
  duck(t) * Math.max(...oldWindows.map(([a, b]) => windowGain(t, a, b)));

export const newGain = (t: number) => {
  if (t >= T.outroChord) return windowGain(t, -1, T.outroChord - 0.4);
  return (
    duck(t) * (1 - Math.max(...oldWindows.map(([a, b]) => windowGain(t, a, b))))
  );
};
