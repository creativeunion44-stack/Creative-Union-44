import React, { useMemo } from "react";
import {
  AbsoluteFill,
  Composition,
  Easing,
  interpolate,
  random,
  useCurrentFrame,
} from "remotion";
import { FPS, HEIGHT, NIGHT, WIDTH, clamp, sec } from "./theme";

// Ending idea: we pull back from her window. Other windows show other
// people, each alone with a phone. Then the whole city — thousands of
// small blue lights, never one shared screen.

export const CITY_DURATION = 8.5;

const CELL_W = 210;
const CELL_H = 230;
const WIN_W = 150;
const WIN_H = 170;
const PAD = 60;
const GROUND = 1065;

type Win = { x: number; y: number; kind: "phone" | "warm" | "dark"; flip: boolean; seed: number };
type Building = { x: number; y: number; w: number; h: number; windows: Win[] };

const makeBuilding = (left: number, cols: number, rows: number, seed: string, hero = false): Building => {
  const w = cols * CELL_W + PAD;
  const h = rows * CELL_H + PAD;
  const top = GROUND - h;
  const windows: Win[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const s = random(`${seed}-${r}-${c}`);
      const isHero = hero && r === 9 && c === 2;
      windows.push({
        x: left + PAD + c * CELL_W,
        y: top + PAD + r * CELL_H,
        kind: isHero || s < 0.36 ? "phone" : s < 0.44 ? "warm" : "dark",
        flip: random(`${seed}-f-${r}-${c}`) > 0.5,
        seed: s * 1000,
      });
    }
  }
  return { x: left, y: top, w, h, windows };
};

// One plane of the city. Depth 1 = her building's street; smaller depth =
// further away (smaller, higher on screen, hazier).
const makeLayer = (depth: number, span: number, seed: string): Building[] => {
  const out: Building[] = [];
  if (depth === 1) {
    // her building: 5 columns, 14 floors, her window is row 9, column 2
    out.push(makeBuilding(-555, 5, 14, "hero", true));
  }
  for (const dir of [-1, 1]) {
    let edge = depth === 1 ? (dir < 0 ? -555 : -555 + 5 * CELL_W + PAD) : 0;
    if (depth !== 1 && dir > 0) edge = 0;
    let n = 0;
    while (Math.abs(edge) < span) {
      const r = (k: string) => random(`${seed}-${dir}-${n}-${k}`);
      const cols = 3 + Math.floor(r("c") * 4);
      const rows = 6 + Math.floor(r("r") * (depth === 1 ? 16 : 26));
      const gap = 90 + r("g") * 260;
      const w = cols * CELL_W + PAD;
      const left = dir > 0 ? edge + gap : edge - gap - w;
      out.push(makeBuilding(left, cols, rows, `${seed}-${dir}-${n}`));
      edge = dir > 0 ? left + w : left;
      n++;
    }
  }
  return out;
};

const PHONE = "#CFE0FF";

const Person: React.FC<{ flip: boolean; seed: number; t: number }> = ({ flip, seed, t }) => {
  const sway = Math.sin(t * 0.9 + seed) * 2;
  const pose = Math.floor(seed) % 3;
  return (
    <g transform={flip ? `translate(${WIN_W} 0) scale(-1 1)` : undefined}>
      {pose === 0 && (
        // sitting up in bed, phone in front of the face
        <>
          <rect x={0} y={128} width={WIN_W} height={42} fill="#0A1024" />
          <path d={`M30 170 C 34 120, 52 104, 72 104 C 96 104, 110 122, 116 170 Z`} fill="#04060D" />
          <circle cx={72 + sway} cy={82} r={19} fill="#04060D" />
          <rect x={90} y={86} width={13} height={21} rx={2} fill={PHONE} />
        </>
      )}
      {pose === 1 && (
        // lying down, phone held up
        <>
          <rect x={0} y={132} width={WIN_W} height={38} fill="#0A1024" />
          <path d={`M10 170 C 20 138, 70 132, 140 142 L 150 170 Z`} fill="#04060D" />
          <circle cx={36} cy={130 + sway * 0.5} r={17} fill="#04060D" />
          <rect x={62} y={98} width={20} height={13} rx={2} fill={PHONE} />
          <path d="M66 111 L 58 136" stroke="#04060D" strokeWidth={7} strokeLinecap="round" />
        </>
      )}
      {pose === 2 && (
        // hunched on a sofa, head down
        <>
          <path d={`M40 170 C 40 128, 58 112, 80 114 C 102 116, 112 134, 112 170 Z`} fill="#04060D" />
          <circle cx={84 + sway} cy={98} r={18} fill="#04060D" />
          <rect x={62} y={124} width={14} height={20} rx={2} fill={PHONE} />
        </>
      )}
    </g>
  );
};

const Window: React.FC<{ win: Win; t: number; detail: boolean; px: number }> = ({ win, t, detail, px }) => {
  if (win.kind === "dark") {
    return <rect x={win.x} y={win.y} width={WIN_W} height={WIN_H} fill="#0A0F1E" />;
  }
  if (win.kind === "warm") {
    return <rect x={win.x} y={win.y} width={WIN_W} height={WIN_H} fill="#3A2A18" opacity={0.55} />;
  }
  // screen light flickers as people scroll
  const flick =
    0.78 + 0.16 * Math.sin(t * (1.3 + (win.seed % 7) * 0.4) + win.seed) +
    (Math.sin(t * 5 + win.seed * 3) > 0.96 ? 0.1 : 0);
  // tiny on screen: just a blue light with a soft halo
  if (!detail) {
    const halo = Math.max(1, 6 / Math.max(px, 0.01));
    return (
      <g opacity={flick}>
        <rect x={win.x - WIN_W * 0.3 * halo} y={win.y - WIN_H * 0.3 * halo} width={WIN_W * (1 + 0.6 * halo)} height={WIN_H * (1 + 0.6 * halo)} fill="#5F8BFF" opacity={0.12} />
        <rect x={win.x} y={win.y} width={WIN_W} height={WIN_H} fill="#7FA6FF" />
      </g>
    );
  }
  return (
    <g transform={`translate(${win.x} ${win.y})`}>
      <rect width={WIN_W} height={WIN_H} fill="#0C1430" />
      <rect width={WIN_W} height={WIN_H} fill={`url(#glow${win.flip ? "L" : "R"})`} opacity={flick} />
      <Person flip={win.flip} seed={win.seed} t={t} />
      <rect width={WIN_W} height={WIN_H} fill="none" stroke="#1B2443" strokeWidth={6} />
      <line x1={WIN_W / 2} y1={0} x2={WIN_W / 2} y2={WIN_H} stroke="#1B2443" strokeWidth={3} opacity={0.6} />
    </g>
  );
};

const Layer: React.FC<{
  buildings: Building[];
  scale: number;
  fx: number;
  fy: number;
  t: number;
  depth: number;
}> = ({ buildings, scale, fx, fy, t, depth }) => {
  const px = WIN_W * scale; // window size on screen
  const detail = px > 34;
  const left = fx - WIDTH / 2 / scale;
  const right = fx + WIDTH / 2 / scale;
  const body = depth === 1 ? "#0E1428" : depth > 0.5 ? "#111A34" : "#152040";
  return (
    <g transform={`translate(${WIDTH / 2} ${HEIGHT / 2}) scale(${scale}) translate(${-fx} ${-fy})`} opacity={depth === 1 ? 1 : 0.55 + depth * 0.4}>
      <rect x={left} y={GROUND} width={right - left} height={20000} fill="#070A14" />
      <rect x={left} y={GROUND} width={right - left} height={40} fill="#2A3D7A" opacity={0.35} />
      {buildings
        .filter((b) => b.x + b.w > left && b.x < right)
        .map((b, i) => (
          <g key={i}>
            <rect x={b.x} y={b.y} width={b.w} height={b.h} fill={body} />
            <rect x={b.x} y={b.y} width={b.w} height={18} fill="#1D2847" />
            {b.windows.map((w, k) => (
              <Window key={k} win={w} t={t} detail={detail} px={px} />
            ))}
          </g>
        ))}
    </g>
  );
};

export const CityPullback: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;

  const layers = useMemo(
    () => [
      { depth: 0.32, buildings: makeLayer(0.32, 30000, "far") },
      { depth: 0.55, buildings: makeLayer(0.55, 18000, "mid") },
      { depth: 1, buildings: makeLayer(1, 9000, "near") },
    ],
    [],
  );

  // camera: from her window to the whole city, smooth on a log scale
  const k = interpolate(t, [0.3, 7.6], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const scale = Math.exp(interpolate(k, [0, 1], [Math.log(6.2), Math.log(0.11)]));
  const fx = interpolate(k, [0, 1], [WIN_W / 2 - 75, 0]);
  const fy = interpolate(k, [0, 0.5, 1], [0, -200, -5000]);

  const fadeIn = interpolate(t, [0, 0.5], [0, 1], clamp);
  const stars = useMemo(
    () =>
      new Array(90).fill(0).map((_, i) => ({
        x: random(`sx${i}`) * WIDTH,
        y: random(`sy${i}`) * HEIGHT * 0.6,
        r: 0.8 + random(`sr${i}`) * 1.6,
        p: random(`sp${i}`) * 6,
      })),
    [],
  );

  return (
    <AbsoluteFill style={{ backgroundColor: NIGHT }}>
      <svg width={WIDTH} height={HEIGHT} style={{ opacity: fadeIn }}>
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#05070F" />
            <stop offset="0.7" stopColor="#0B1330" />
            <stop offset="1" stopColor="#1A2858" />
          </linearGradient>
          <radialGradient id="glowR" cx="0.66" cy="0.55" r="0.75">
            <stop offset="0" stopColor="#8DB2FF" stopOpacity={0.95} />
            <stop offset="0.45" stopColor="#3E63C9" stopOpacity={0.55} />
            <stop offset="1" stopColor="#0C1430" stopOpacity={0} />
          </radialGradient>
          <radialGradient id="glowL" cx="0.34" cy="0.55" r="0.75">
            <stop offset="0" stopColor="#8DB2FF" stopOpacity={0.95} />
            <stop offset="0.45" stopColor="#3E63C9" stopOpacity={0.55} />
            <stop offset="1" stopColor="#0C1430" stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect width={WIDTH} height={HEIGHT} fill="url(#sky)" />
        <g opacity={interpolate(k, [0.35, 0.8], [0, 1], clamp)}>
          {stars.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#DCE6FF" opacity={0.25 + 0.25 * Math.sin(t * 1.5 + s.p)} />
          ))}
        </g>
        {layers.map((l) => (
          <Layer
            key={l.depth}
            buildings={l.buildings}
            depth={l.depth}
            t={t}
            scale={scale * l.depth}
            fx={fx}
            fy={fy + (1 - l.depth) * 900}
          />
        ))}
      </svg>
      {/* soft vignette, like the night footage */}
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at 50% 55%, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

export const CityPullbackComposition: React.FC = () => (
  <Composition
    id="CityPullback"
    component={CityPullback}
    durationInFrames={sec(CITY_DURATION)}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
