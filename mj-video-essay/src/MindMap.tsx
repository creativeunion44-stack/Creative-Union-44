// Unit 13 Task 1: a mind map of the concept for the Michael Jackson video,
// as a single 1920x1080 image (render with `remotion still MindMap`).
import React from "react";
import { AbsoluteFill, Composition } from "remotion";
import { BODY, HEADING } from "./fonts";
import { BLUE, CREAM, GOLD, INK, RED } from "./theme";

type Branch = {
  title: string;
  color: string;
  items: string[];
  x: number;
  y: number;
};

const W = 1920;
const H = 1080;
const CX = W / 2;
const CY = 555;
const CARD_W = 540;

const COL_L = 90;
const COL_R = W - 90 - CARD_W;
const ROWS = [165, 450, 735];

const BRANCHES: Branch[] = [
  {
    title: "Then",
    color: GOLD,
    items: [
      "Few TV channels, MTV for everyone",
      "A music video was a world event",
      "Thriller: best-selling album ever",
    ],
    x: COL_L,
    y: ROWS[0],
  },
  {
    title: "Story",
    color: CREAM,
    items: [
      "Hook: scrolling at night",
      "Three reasons: then / now",
      "End: a question for viewers",
    ],
    x: COL_L,
    y: ROWS[1],
  },
  {
    title: "How to film",
    color: RED,
    items: [
      "Night shots on my phone",
      "Stock clips for the past",
      "Split screen: then / now",
    ],
    x: COL_L,
    y: ROWS[2],
  },
  {
    title: "Now",
    color: "#8FAEF7",
    items: [
      "Everyone has their own feed",
      "Thousands of new songs a day",
      "A trend lasts a few days",
    ],
    x: COL_R,
    y: ROWS[0],
  },
  {
    title: "Look and sound",
    color: "#3FA7A0",
    items: [
      "Warm past, cold blue present",
      "Captions tell the story, no voice",
      "70s ballad vs modern music",
    ],
    x: COL_R,
    y: ROWS[1],
  },
  {
    title: "Audience",
    color: BLUE,
    items: [
      "Adults 20–40",
      "TikTok, Reels, Shorts",
      "A question in the comments",
    ],
    x: COL_R,
    y: ROWS[2],
  },
];

const Card: React.FC<{ b: Branch; width: number }> = ({ b, width }) => (
  <div
    style={{
      position: "absolute",
      left: b.x,
      top: b.y,
      width,
      background: "#24212C",
      border: `3px solid ${b.color}`,
      borderRadius: 22,
      padding: "22px 26px",
      boxSizing: "border-box",
    }}
  >
    <div
      style={{
        fontFamily: HEADING,
        fontWeight: 700,
        fontSize: 40,
        textTransform: "uppercase",
        color: b.color,
        marginBottom: 10,
      }}
    >
      {b.title}
    </div>
    {b.items.map((it) => (
      <div
        key={it}
        style={{
          fontFamily: BODY,
          fontSize: 23,
          lineHeight: 1.35,
          color: "#DCD6E6",
          display: "flex",
          gap: 10,
        }}
      >
        <span style={{ color: b.color }}>•</span>
        <span>{it}</span>
      </div>
    ))}
  </div>
);

const MindMap: React.FC = () => {
  const lines: [number, number, string][] = BRANCHES.map((b) => [
    b.x === COL_L ? COL_L + CARD_W : COL_R,
    b.y + 95,
    b.color,
  ]);
  return (
    <AbsoluteFill style={{ background: INK }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 18,
          height: H,
          background: `linear-gradient(180deg, ${GOLD}, ${RED}, ${BLUE})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 70,
          top: 42,
          fontFamily: HEADING,
          fontWeight: 700,
          fontSize: 60,
          color: CREAM,
          textTransform: "uppercase",
        }}
      >
        Mind map{" "}
        <span
          style={{
            color: GOLD,
            fontSize: 34,
            fontFamily: BODY,
            fontWeight: 500,
            textTransform: "none",
          }}
        >
          · Unit 13 · Idea 1
        </span>
      </div>
      <svg
        width={W}
        height={H}
        style={{ position: "absolute", left: 0, top: 0 }}
      >
        {lines.map(([x, y, c], i) => (
          <line
            key={i}
            x1={CX}
            y1={CY}
            x2={x}
            y2={y}
            stroke={c}
            strokeWidth={4}
            strokeLinecap="round"
            opacity={0.85}
          />
        ))}
      </svg>
      {BRANCHES.map((b) => (
        <Card key={b.title} b={b} width={CARD_W} />
      ))}
      <div
        style={{
          position: "absolute",
          left: CX - 270,
          top: CY - 150,
          width: 540,
          height: 300,
          borderRadius: "50%",
          background: GOLD,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "0 60px",
          boxSizing: "border-box",
          boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            fontFamily: HEADING,
            fontWeight: 700,
            fontSize: 38,
            lineHeight: 1.08,
            color: INK,
            textTransform: "uppercase",
          }}
        >
          Why is it so hard to be as famous as Michael Jackson today?
        </div>
        <div
          style={{
            fontFamily: BODY,
            fontWeight: 500,
            fontSize: 22,
            color: INK,
            marginTop: 10,
          }}
        >
          Fame then and now
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const MindMapComposition: React.FC = () => (
  <Composition
    id="MindMap"
    component={MindMap}
    durationInFrames={1}
    fps={30}
    width={W}
    height={H}
  />
);
