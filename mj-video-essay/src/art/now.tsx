// Today, at night, in cold blue light: the stand-in illustrations for the
// night shots (until real footage is set in footage.ts) and the "now"
// halves of the split screen.
import React from "react";
import { random, useCurrentFrame } from "remotion";
import { BLUE, GOLD, LIGHT_BLUE, NIGHT, RED, SOFT_BLUE } from "../theme";

const CARD_COLORS = [
  ["#ff3d7f", "#7a2cff"],
  ["#3ec7ff", "#1b3fa8"],
  ["#ffd23f", "#ff6a3d"],
  ["#2ee6a8", "#1a6e8f"],
  ["#ff7ad9", "#5b2ca8"],
  ["#9db8ff", "#2b3f86"],
];

const HANDLES = [
  "@nova.wav",
  "@lil_sunrise",
  "@kaii.beats",
  "@mira.sings",
  "@zero.gravity",
  "@j.fresh",
  "@luna_vibes",
  "@neonboy",
  "@saint.echo",
  "@vvvera",
];

// A feed of short-video "stars" scrolling fast. Drawn in a w x h box.
export const Feed: React.FC<{
  w: number;
  h: number;
  speed: number;
  seed: string;
  showText?: boolean;
}> = ({ w, h, speed, seed, showText = true }) => {
  const t = useCurrentFrame();
  const cardH = h * 0.62;
  const offset = (t * speed) % cardH;
  const first = Math.floor((t * speed) / cardH);
  return (
    <g>
      <rect width={w} height={h} fill="#05070f" />
      {[0, 1, 2].map((k) => {
        const n = first + k;
        const [c1, c2] =
          CARD_COLORS[
            Math.floor(random(`${seed}-c-${n}`) * CARD_COLORS.length)
          ];
        const y = k * cardH - offset;
        const handle =
          HANDLES[Math.floor(random(`${seed}-h-${n}`) * HANDLES.length)];
        const fans = (1 + random(`${seed}-f-${n}`) * 9).toFixed(1);
        return (
          <g key={n} transform={`translate(0 ${y})`}>
            <defs>
              <linearGradient id={`${seed}-g-${n}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor={c1} />
                <stop offset="1" stopColor={c2} />
              </linearGradient>
            </defs>
            <rect
              x={w * 0.03}
              y={h * 0.01}
              width={w * 0.94}
              height={cardH - h * 0.02}
              rx={w * 0.05}
              fill={`url(#${seed}-g-${n})`}
            />
            {/* a performer silhouette with a mic */}
            <circle
              cx={w * 0.5}
              cy={cardH * 0.36}
              r={w * 0.12}
              fill="#000"
              opacity="0.35"
            />
            <rect
              x={w * 0.32}
              y={cardH * 0.5}
              width={w * 0.36}
              height={cardH * 0.4}
              rx={w * 0.12}
              fill="#000"
              opacity="0.35"
            />
            <circle
              cx={w * 0.14}
              cy={cardH * 0.82}
              r={w * 0.06}
              fill="#fff"
              opacity="0.9"
            />
            {showText ? (
              <>
                <text
                  x={w * 0.24}
                  y={cardH * 0.8}
                  fontFamily="Rubik"
                  fontWeight="700"
                  fontSize={w * 0.065}
                  fill="#fff"
                >
                  {handle}
                </text>
                <text
                  x={w * 0.24}
                  y={cardH * 0.87}
                  fontFamily="Rubik"
                  fontWeight="500"
                  fontSize={w * 0.05}
                  fill="#fff"
                  opacity="0.85"
                >
                  {`★ ${fans}M`}
                </text>
              </>
            ) : null}
            <circle
              cx={w * 0.88}
              cy={cardH * 0.55}
              r={w * 0.045}
              fill="#fff"
              opacity="0.85"
            />
            <circle
              cx={w * 0.88}
              cy={cardH * 0.68}
              r={w * 0.045}
              fill="#fff"
              opacity="0.85"
            />
          </g>
        );
      })}
    </g>
  );
};

const Room: React.FC<{ glow: number }> = ({ glow }) => (
  <>
    <defs>
      <radialGradient id="nf-glow" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor={LIGHT_BLUE} stopOpacity={0.55 * glow} />
        <stop offset="1" stopColor={LIGHT_BLUE} stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect width="1080" height="1920" fill="#070a18" />
    {/* window with the moon */}
    <rect x="90" y="560" width="330" height="420" rx="10" fill="#141d44" />
    <circle cx="320" cy="670" r="54" fill="#e9e2cf" />
    <circle cx="344" cy="656" r="50" fill="#141d44" />
    <rect x="250" y="560" width="12" height="420" fill="#070a18" />
    <rect x="90" y="760" width="330" height="12" fill="#070a18" />
    {[
      [140, 620],
      [180, 900],
      [380, 860],
      [300, 940],
    ].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r="3" fill="#e9e2cf" />
    ))}
  </>
);

// Scene 1 stand-in: a face in profile lit by the phone, the feed racing
// on the screen.
export const NightFaceShot: React.FC = () => {
  const t = useCurrentFrame();
  const glow = 0.8 + 0.2 * Math.sin(t * 0.9) * Math.sin(t * 0.37);
  return (
    <svg
      viewBox="0 0 1080 1920"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
    >
      <Room glow={glow} />
      <circle cx="520" cy="1050" r="560" fill="url(#nf-glow)" />
      {/* pillow, duvet, figure */}
      <rect x="560" y="820" width="460" height="230" rx="90" fill="#1a1f3a" />
      <path
        d="M0 1500 C200 1380 500 1360 1080 1420 L1080 1920 L0 1920 Z"
        fill="#141a36"
      />
      <path
        d="M620 1500 L620 1360 C616 1300 596 1270 584 1246 L540 1226 L566 1202 C548 1180 552 1150 570 1138 C556 1084 556 1024 586 978 C632 900 760 880 838 926 C922 976 948 1080 926 1186 C914 1260 880 1320 880 1500 Z"
        fill="#1e2546"
      />
      <path
        d="M586 978 C556 1024 556 1084 570 1138 C552 1150 548 1180 566 1202 L540 1226 L584 1246 C596 1270 616 1300 620 1360 L660 1360 C650 1200 610 1100 620 980 Z"
        fill={LIGHT_BLUE}
        opacity={0.55 * glow}
      />
      {/* the phone */}
      <g transform="translate(270 1060) rotate(-14)">
        <rect
          width="230"
          height="420"
          rx="30"
          fill="#02040a"
          stroke="#7fa2f5"
          strokeWidth="4"
        />
        <g transform="translate(14 22)">
          <svg width="202" height="376" viewBox="0 0 202 376">
            <Feed w={202} h={376} speed={34} seed="hook" showText={false} />
          </svg>
        </g>
      </g>
      <path
        d="M380 1440 C420 1400 470 1400 520 1420 L560 1500 L360 1520 Z"
        fill="#c79a7a"
        opacity="0.5"
      />
    </svg>
  );
};

// Over-the-shoulder view of the feed, used full frame and in halves.
export const FeedShot: React.FC<{ speed?: number; seed?: string }> = ({
  speed = 26,
  seed = "feed",
}) => {
  const t = useCurrentFrame();
  return (
    <svg
      viewBox="0 0 1080 1920"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id={`${seed}-g`} cx="0.45" cy="0.45" r="0.55">
          <stop offset="0" stopColor="#5b8bf0" stopOpacity="0.45" />
          <stop offset="1" stopColor="#5b8bf0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1080" height="1920" fill="#0a0c18" />
      <circle cx="480" cy="860" r="720" fill={`url(#${seed}-g)`} />
      <g
        transform={`translate(230 ${300 + Math.sin(t * 0.08) * 6}) rotate(-4)`}
      >
        <rect
          width="560"
          height="1080"
          rx="60"
          fill="#02040a"
          stroke="#7fa2f5"
          strokeWidth="6"
        />
        <g transform="translate(26 40)">
          <svg width="508" height="1000" viewBox="0 0 508 1000">
            <Feed w={508} h={1000} speed={speed} seed={seed} />
          </svg>
        </g>
      </g>
      {/* thumb */}
      <path
        d="M560 1500 C600 1380 660 1340 720 1330 L760 1520 Z"
        fill="#c79a7a"
      />
      {/* shoulder and head, out of focus */}
      <g fill="#030306" style={{ filter: "blur(6px)" }}>
        <circle cx="960" cy="700" r="260" />
        <path d="M600 1920 C640 1500 760 1320 980 1300 C1080 1300 1080 1300 1080 1300 L1080 1920 Z" />
      </g>
    </svg>
  );
};

// Half frame: many phones, each with a different feed.
export const PhoneGridHalf: React.FC = () => (
  <svg
    viewBox="0 0 1080 960"
    width="100%"
    height="100%"
    preserveAspectRatio="xMidYMid slice"
  >
    <rect width="1080" height="960" fill="#070a18" />
    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
      const col = i % 4;
      const row = Math.floor(i / 4);
      return (
        <g key={i} transform={`translate(${60 + col * 250} ${80 + row * 420})`}>
          <rect
            width="210"
            height="380"
            rx="26"
            fill="#02040a"
            stroke="#4c6fd0"
            strokeWidth="4"
          />
          <g transform="translate(12 18)">
            <svg width="186" height="344" viewBox="0 0 186 344">
              <Feed
                w={186}
                h={344}
                speed={14 + i * 5}
                seed={`grid${i}`}
                showText={false}
              />
            </svg>
          </g>
        </g>
      );
    })}
  </svg>
);

// Half frame: new tracks pouring in, endlessly.
export const TrackFloodHalf: React.FC = () => {
  const t = useCurrentFrame();
  const tiles = new Array(42).fill(true).map((_, i) => {
    const speed = 9 + random(`tf-s-${i}`) * 14;
    const x = random(`tf-x-${i}`) * 960;
    const y = ((t * speed + random(`tf-y-${i}`) * 1200) % 1200) - 180;
    const color = [BLUE, "#7a2cff", "#2ee6a8", "#ff3d7f", SOFT_BLUE][i % 5];
    return { x, y, color, i };
  });
  return (
    <svg
      viewBox="0 0 1080 960"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="1080" height="960" fill="#060914" />
      {tiles.map(({ x, y, color, i }) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <rect width="150" height="150" rx="18" fill={color} opacity="0.85" />
          <ellipse cx="62" cy="104" rx="20" ry="15" fill="#fff" opacity="0.9" />
          <rect x="76" y="40" width="9" height="66" fill="#fff" opacity="0.9" />
          <rect
            x="76"
            y="40"
            width="36"
            height="12"
            fill="#fff"
            opacity="0.9"
          />
          <rect
            x="8"
            y="8"
            width="58"
            height="26"
            rx="8"
            fill={NIGHT}
            opacity="0.8"
          />
          <text
            x="37"
            y="28"
            textAnchor="middle"
            fontFamily="Rubik"
            fontWeight="700"
            fontSize="18"
            fill="#fff"
          >
            NEW
          </text>
        </g>
      ))}
    </svg>
  );
};

// Half frame: a trend spikes and dies within days.
export const TrendHalf: React.FC = () => {
  const t = useCurrentFrame();
  const draw = Math.min(1, t / 110);
  const pts: [number, number][] = [
    [80, 760],
    [200, 740],
    [300, 300],
    [380, 180],
    [470, 320],
    [600, 640],
    [760, 740],
    [1000, 770],
  ];
  const len = pts.length - 1;
  const shown = draw * len;
  const path = pts
    .slice(0, Math.floor(shown) + 1)
    .map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`)
    .join(" ");
  const k = Math.min(len - 1, Math.floor(shown));
  const f = shown - k;
  const head: [number, number] = [
    pts[k][0] + (pts[k + 1][0] - pts[k][0]) * f,
    pts[k][1] + (pts[k + 1][1] - pts[k][1]) * f,
  ];
  const heat = Math.max(0, 1 - Math.abs(head[0] - 380) / 260);
  const days = ["MON", "TUE", "WED", "THU", "FRI"];
  return (
    <svg
      viewBox="0 0 1080 960"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="1080" height="960" fill="#060914" />
      {days.map((d, i) => (
        <g key={d}>
          <line
            x1={120 + i * 210}
            y1="140"
            x2={120 + i * 210}
            y2="800"
            stroke="#1c2448"
            strokeWidth="3"
          />
          <text
            x={120 + i * 210}
            y="860"
            textAnchor="middle"
            fontFamily="Rubik"
            fontWeight="700"
            fontSize="34"
            fill={LIGHT_BLUE}
          >
            {d}
          </text>
        </g>
      ))}
      <path
        d={`${path} L${head[0]} ${head[1]}`}
        fill="none"
        stroke={SOFT_BLUE}
        strokeWidth="12"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={head[0]} cy={head[1]} r="18" fill="#fff" />
      {/* a flame that flares at the peak and burns out */}
      <g
        transform={`translate(${head[0]} ${head[1] - 70}) scale(${0.4 + heat * 1.2})`}
        opacity={0.2 + heat * 0.8}
      >
        <path
          d="M0 -60 C30 -20 40 10 20 40 C10 55 -10 55 -20 40 C-40 10 -30 -20 0 -60 Z"
          fill={RED}
        />
        <path
          d="M0 -25 C14 -5 18 12 8 30 C3 38 -3 38 -8 30 C-18 12 -14 -5 0 -25 Z"
          fill={GOLD}
        />
      </g>
    </svg>
  );
};

// Scene 5 stand-in: the phone is put down, its light fades, the room goes
// dark. `fade` 0..1 is driven by the scene.
export const PutDownShot: React.FC<{ fade: number }> = ({ fade }) => {
  const t = useCurrentFrame();
  const drop = Math.min(1, t / 40);
  const glow = 1 - fade;
  return (
    <svg
      viewBox="0 0 1080 1920"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
    >
      <Room glow={glow} />
      <rect x="0" y="1180" width="1080" height="740" fill="#10142a" />
      <rect x="0" y="1180" width="1080" height="18" fill="#1c2346" />
      {/* nightstand top */}
      <circle cx="560" cy="1200" r="460" fill="url(#nf-glow)" />
      <g
        transform={`translate(390 ${1060 + drop * 120}) rotate(${(1 - drop) * -30} 150 60)`}
      >
        <rect
          width="300"
          height="60"
          rx="18"
          fill="#02040a"
          stroke="#7fa2f5"
          strokeWidth="4"
        />
        <rect
          x="12"
          y="10"
          width="276"
          height="40"
          rx="10"
          fill={BLUE}
          opacity={glow}
        />
      </g>
      {/* hand withdrawing */}
      <path
        d={`M${760 + drop * 260} 1150 C${700 + drop * 260} 1120 ${640 + drop * 260} 1130 ${620 + drop * 260} 1170 L${1080} 1240 L1080 1120 Z`}
        fill="#2a2440"
      />
      <rect width="1080" height="1920" fill="#000" opacity={fade * 0.85} />
    </svg>
  );
};
