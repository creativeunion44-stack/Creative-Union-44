// The 1980s shots on their own — no titles, no sound — for assembling the
// video by hand in an editor (CapCut, Premiere, Canva). Full shots are
// 9:16; the split-screen pieces are 1080x960, one half of the frame.
import React from "react";
import { Composition } from "remotion";
import {
  BroadcastHalf,
  CalendarHalf,
  CassetteShot,
  ChartHalf,
  LivingRoomShot,
  RetroTvShot,
} from "./art/past";
import { RetroLook } from "./effects";
import { FPS, HEIGHT, sec, WIDTH } from "./theme";

const LENGTH = sec(8);

const CLIPS: { id: string; art: React.ReactNode; half?: boolean }[] = [
  { id: "Past1-TV", art: <RetroTvShot /> },
  { id: "Past2-LivingRoom", art: <LivingRoomShot /> },
  { id: "Past3-Cassette", art: <CassetteShot /> },
  { id: "Past4-Broadcast-half", art: <BroadcastHalf />, half: true },
  { id: "Past5-Chart-half", art: <ChartHalf />, half: true },
  { id: "Past6-Calendar-half", art: <CalendarHalf />, half: true },
];

export const ClipCompositions: React.FC = () => (
  <>
    {CLIPS.map(({ id, art, half }) => (
      <Composition
        key={id}
        id={id}
        component={() => <RetroLook seed={id}>{art}</RetroLook>}
        durationInFrames={LENGTH}
        fps={FPS}
        width={WIDTH}
        height={half ? HEIGHT / 2 : HEIGHT}
      />
    ))}
  </>
);
