// Animated 1980s "footage", drawn from scratch (no stock or archive
// material, nothing of Michael Jackson): warm light, a CRT TV showing a
// generic music video, a living room, a cassette player, a broadcast
// tower, a chart show and a flipping calendar.
import React from "react";
import { random, useCurrentFrame } from "remotion";
import { GOLD, RED } from "../theme";

const Wallpaper: React.FC<{ w: number; h: number; id: string }> = ({
  w,
  h,
  id,
}) => (
  <>
    <defs>
      <pattern
        id={`${id}-wp`}
        width="90"
        height="90"
        patternUnits="userSpaceOnUse"
      >
        <rect width="90" height="90" fill="#6b3d1c" />
        <rect width="30" height="90" fill="#7a4720" />
        <circle cx="60" cy="45" r="9" fill="#8a5426" />
      </pattern>
      <radialGradient id={`${id}-warm`} cx="0.5" cy="0.35" r="0.75">
        <stop offset="0" stopColor="#ffc773" stopOpacity="0.55" />
        <stop offset="1" stopColor="#2a1206" stopOpacity="0.85" />
      </radialGradient>
    </defs>
    <rect width={w} height={h} fill={`url(#${id}-wp)`} />
    <rect width={w} height={h} fill={`url(#${id}-warm)`} />
  </>
);

// A generic dancer on a lit stage: spotlights, a light-up floor and a
// simple figure. Drawn in a 600x450 box (the TV screen).
const Stage: React.FC<{ t: number; id: string }> = ({ t, id }) => {
  const s = t / 30;
  const beat = Math.floor(s * 2.2);
  const sway = Math.sin(s * 4.4) * 40;
  const arm = Math.sin(s * 4.4) * 0.9;
  const leg = Math.sin(s * 8.8) * 0.35;
  const spinA = Math.sin(s * 1.3) * 25;
  const spinB = Math.cos(s * 1.1) * 25;
  const tiles = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 6; c++) {
      const lit = (r * 6 + c + beat) % 4 === 0;
      const y0 = 330 + r * 40;
      const w0 = 600 / 6;
      const skew = (c - 2.5) * (r + 1) * 6;
      tiles.push(
        <polygon
          key={`${r}-${c}`}
          points={`${c * w0 + skew},${y0} ${(c + 1) * w0 + skew},${y0} ${(c + 1) * w0 + skew * 1.4},${y0 + 40} ${c * w0 + skew * 1.4},${y0 + 40}`}
          fill={
            lit
              ? ["#ffd23f", "#ff6fb5", "#ffffff", "#ff8a3d"][(c + r) % 4]
              : "#2a1838"
          }
          stroke="#120818"
          strokeWidth="3"
        />,
      );
    }
  }
  const x = 300 + sway;
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-spot`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff3c4" stopOpacity="0.75" />
          <stop offset="1" stopColor="#fff3c4" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="600" height="450" fill="#1a0d26" />
      <g transform={`rotate(${spinA} 120 0)`}>
        <polygon
          points="100,0 140,0 260,450 -20,450"
          fill={`url(#${id}-spot)`}
        />
      </g>
      <g transform={`rotate(${spinB} 480 0)`}>
        <polygon
          points="460,0 500,0 620,450 340,450"
          fill={`url(#${id}-spot)`}
        />
      </g>
      {tiles}
      {/* the dancer: a plain silhouette, no costume details */}
      <g transform={`translate(${x} 0)`} fill="#0b0610">
        <ellipse cx="0" cy="335" rx="55" ry="10" fill="#000" opacity="0.4" />
        <circle cx="0" cy="150" r="24" />
        <rect x="-22" y="176" width="44" height="88" rx="16" />
        <g transform={`rotate(${-50 + arm * 60} -18 186)`}>
          <rect x="-26" y="182" width="16" height="82" rx="8" />
        </g>
        <g transform={`rotate(${50 - arm * 60} 18 186)`}>
          <rect x="10" y="182" width="16" height="82" rx="8" />
        </g>
        <g transform={`rotate(${leg * 40} -10 260)`}>
          <rect x="-20" y="256" width="18" height="78" rx="8" />
        </g>
        <g transform={`rotate(${-leg * 40} 10 260)`}>
          <rect x="2" y="256" width="18" height="78" rx="8" />
        </g>
      </g>
    </g>
  );
};

const Crt: React.FC<{ id: string; children: React.ReactNode }> = ({
  id,
  children,
}) => (
  <g>
    <defs>
      <clipPath id={`${id}-clip`}>
        <rect x="0" y="0" width="600" height="450" rx="46" />
      </clipPath>
      <radialGradient id={`${id}-bulge`} cx="0.35" cy="0.25" r="0.9">
        <stop offset="0" stopColor="#ffffff" stopOpacity="0.22" />
        <stop offset="0.5" stopColor="#ffffff" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity="0.45" />
      </radialGradient>
    </defs>
    <g clipPath={`url(#${id}-clip)`}>
      {children}
      <rect width="600" height="450" fill={`url(#${id}-bulge)`} />
    </g>
  </g>
);

const Television: React.FC<{ t: number; id: string }> = ({ t, id }) => (
  <g>
    <line
      x1="330"
      y1="10"
      x2="230"
      y2="-170"
      stroke="#2a1a0e"
      strokeWidth="10"
      strokeLinecap="round"
    />
    <line
      x1="390"
      y1="10"
      x2="500"
      y2="-160"
      stroke="#2a1a0e"
      strokeWidth="10"
      strokeLinecap="round"
    />
    <rect x="0" y="0" width="760" height="580" rx="40" fill="#5a3416" />
    <rect
      x="0"
      y="0"
      width="760"
      height="580"
      rx="40"
      fill="none"
      stroke="#3a1f0c"
      strokeWidth="10"
    />
    <rect x="34" y="40" width="616" height="490" rx="54" fill="#140b06" />
    <g transform="translate(42 60)">
      <Crt id={id}>
        <Stage t={t} id={id} />
      </Crt>
    </g>
    <circle cx="705" cy="120" r="22" fill="#c98a3a" />
    <circle cx="705" cy="190" r="22" fill="#c98a3a" />
    {[0, 1, 2, 3, 4].map((i) => (
      <rect
        key={i}
        x="682"
        y={260 + i * 26}
        width="46"
        height="10"
        rx="5"
        fill="#2e1b0c"
      />
    ))}
    <rect x="80" y="580" width="40" height="70" fill="#2e1b0c" />
    <rect x="640" y="580" width="40" height="70" fill="#2e1b0c" />
  </g>
);

// Close-up: the TV showing a music video.
export const RetroTvShot: React.FC = () => {
  const t = useCurrentFrame();
  const push = 1 + t * 0.0012;
  return (
    <svg
      viewBox="0 0 1080 1920"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
    >
      <Wallpaper w={1080} h={1920} id="tv" />
      <rect y="1240" width="1080" height="680" fill="#3b200d" />
      <rect y="1240" width="1080" height="20" fill="#24130a" />
      <g transform={`translate(540 860) scale(${push}) translate(-380 -330)`}>
        <ellipse
          cx="380"
          cy="660"
          rx="460"
          ry="40"
          fill="#000"
          opacity="0.35"
        />
        <Television t={t} id="tv1" />
      </g>
    </svg>
  );
};

// Wide: a family on the sofa watching TV, the room lit by the screen.
export const LivingRoomShot: React.FC = () => {
  const t = useCurrentFrame();
  const flick = 0.75 + 0.25 * Math.sin(t * 0.7) * Math.sin(t * 0.23);
  return (
    <svg
      viewBox="0 0 1080 1920"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="lr-glow" cx="0.5" cy="0.36" r="0.6">
          <stop offset="0" stopColor="#ffd9a0" stopOpacity={0.6 * flick} />
          <stop offset="1" stopColor="#ffd9a0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <Wallpaper w={1080} h={1920} id="lr" />
      {/* framed poster and a lamp */}
      <rect x="90" y="300" width="220" height="300" fill="#2a1408" />
      <rect x="110" y="320" width="180" height="260" fill={RED} opacity="0.7" />
      <circle cx="200" cy="420" r="50" fill={GOLD} opacity="0.8" />
      <path d="M840 520 L960 520 L990 640 L810 640 Z" fill="#e8b45a" />
      <rect x="895" y="640" width="10" height="320" fill="#2a1408" />
      <circle cx="900" cy="560" r="120" fill="#ffd27a" opacity="0.25" />
      {/* cabinet + TV */}
      <rect x="300" y="900" width="480" height="140" fill="#3a1f0c" />
      <g transform="translate(355 560) scale(0.48)">
        <Television t={t} id="lr-tv" />
      </g>
      <rect width="1080" height="1920" fill="url(#lr-glow)" />
      {/* floor and sofa */}
      <rect y="1040" width="1080" height="880" fill="#2e1709" />
      <rect
        y="1040"
        width="1080"
        height="880"
        fill="url(#lr-glow)"
        opacity="0.4"
      />
      <g fill="#140904">
        <circle cx="330" cy="1290" r="70" />
        <circle cx="560" cy="1270" r="78" />
        <circle cx="770" cy="1320" r="56" />
        <rect
          x="120"
          y="1350"
          width="840"
          height="360"
          rx="80"
          fill="#4a2410"
        />
        <rect x="80" y="1300" width="120" height="440" rx="50" fill="#3a1b0a" />
        <rect
          x="880"
          y="1300"
          width="120"
          height="440"
          rx="50"
          fill="#3a1b0a"
        />
        <path d="M250 1350 C260 1300 400 1300 410 1350 Z" />
        <path d="M470 1350 C480 1290 640 1290 650 1350 Z" />
        <path d="M700 1350 C710 1320 830 1320 840 1350 Z" />
      </g>
      <rect
        y="1340"
        width="1080"
        height="12"
        fill="#ffd9a0"
        opacity={0.18 * flick}
      />
    </svg>
  );
};

const Reel: React.FC<{ cx: number; cy: number; angle: number; r: number }> = ({
  cx,
  cy,
  angle,
  r,
}) => (
  <g transform={`rotate(${angle} ${cx} ${cy})`}>
    <circle cx={cx} cy={cy} r={r} fill="#3a2a20" />
    <circle cx={cx} cy={cy} r={r * 0.42} fill="#efe4cf" />
    {[0, 60, 120, 180, 240, 300].map((a) => (
      <rect
        key={a}
        x={cx - 4}
        y={cy - r * 0.42}
        width="8"
        height={r * 0.2}
        fill="#3a2a20"
        transform={`rotate(${a} ${cx} ${cy})`}
      />
    ))}
  </g>
);

// Close-up: a cassette player with headphones, reels turning.
export const CassetteShot: React.FC = () => {
  const t = useCurrentFrame();
  const a = t * 6;
  return (
    <svg
      viewBox="0 0 1080 1920"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="cs-lamp" cx="0.3" cy="0.2" r="0.8">
          <stop offset="0" stopColor="#ffcf7a" stopOpacity="0.7" />
          <stop offset="1" stopColor="#1a0b04" stopOpacity="0.9" />
        </radialGradient>
        <pattern
          id="cs-wood"
          width="1080"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <rect width="1080" height="40" fill="#6a3a18" />
          <rect y="18" width="1080" height="4" fill="#5a2f12" />
        </pattern>
      </defs>
      <rect width="1080" height="1920" fill="url(#cs-wood)" />
      <rect width="1080" height="1920" fill="url(#cs-lamp)" />
      {/* headphones */}
      <path
        d="M170 1180 C170 760 560 700 600 760"
        fill="none"
        stroke="#221612"
        strokeWidth="34"
        strokeLinecap="round"
      />
      <rect x="110" y="1120" width="140" height="230" rx="60" fill={RED} />
      <rect x="135" y="1150" width="90" height="170" rx="40" fill="#221612" />
      {/* player */}
      <g transform="translate(330 560) rotate(-6)">
        <rect width="620" height="900" rx="50" fill="#8c96a8" />
        <rect width="620" height="900" rx="50" fill="#fff" opacity="0.12" />
        <rect x="50" y="90" width="520" height="380" rx="26" fill="#2a2228" />
        <rect x="80" y="120" width="460" height="320" rx="14" fill="#efe4cf" />
        <rect x="110" y="140" width="400" height="70" rx="6" fill={GOLD} />
        <text
          x="310"
          y="190"
          textAnchor="middle"
          fontFamily="Rubik"
          fontWeight="700"
          fontSize="44"
          fill="#3a2a20"
        >
          MIX &apos;83
        </text>
        <rect x="150" y="250" width="320" height="140" rx="60" fill="#3a2c22" />
        <Reel cx={225} cy={320} r={55} angle={a} />
        <Reel cx={395} cy={320} r={55} angle={a} />
        {[0, 1, 2, 3].map((i) => (
          <rect
            key={i}
            x={70 + i * 130}
            y="540"
            width="100"
            height="70"
            rx="10"
            fill={i === 1 ? GOLD : "#e9dfc8"}
          />
        ))}
        <rect x="70" y="660" width="480" height="24" rx="8" fill={RED} />
        <rect x="70" y="720" width="300" height="16" rx="6" fill="#5a6274" />
        <circle cx="500" cy="780" r="40" fill="#5a6274" />
      </g>
      <path
        d="M260 1350 C320 1500 360 1460 420 1420"
        fill="none"
        stroke="#221612"
        strokeWidth="8"
      />
    </svg>
  );
};

// Half frame (1080x960): one tower, every house glowing with the same show.
export const BroadcastHalf: React.FC = () => {
  const t = useCurrentFrame();
  const glow = 0.65 + 0.35 * Math.sin(t * 0.3);
  const rings = [0, 1, 2, 3].map((i) => (t * 6 + i * 150) % 600);
  const houses = [];
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 7; i++) {
      const x = i * 160 + (row % 2) * 80 - 40;
      const y = 600 + row * 120;
      houses.push(
        <g key={`${row}-${i}`} transform={`translate(${x} ${y})`}>
          <polygon points="0,40 60,0 120,40" fill="#3a1d0c" />
          <rect y="40" width="120" height="80" fill="#4a2610" />
          <rect
            x="22"
            y="62"
            width="34"
            height="30"
            fill="#ffd27a"
            opacity={glow}
          />
          <rect
            x="68"
            y="62"
            width="34"
            height="30"
            fill="#ffd27a"
            opacity={glow}
          />
        </g>,
      );
    }
  }
  return (
    <svg
      viewBox="0 0 1080 960"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="bc-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a1a3a" />
          <stop offset="0.7" stopColor="#c0602a" />
          <stop offset="1" stopColor="#e3a92b" />
        </linearGradient>
      </defs>
      <rect width="1080" height="960" fill="url(#bc-sky)" />
      {rings.map((r, i) => (
        <circle
          key={i}
          cx="540"
          cy="220"
          r={r}
          fill="none"
          stroke="#ffe7a8"
          strokeWidth="6"
          opacity={1 - r / 600}
        />
      ))}
      <polygon points="520,520 540,180 560,520" fill="#2a1408" />
      <rect x="500" y="300" width="80" height="8" fill="#2a1408" />
      <rect x="490" y="400" width="100" height="8" fill="#2a1408" />
      <circle cx="540" cy="180" r="14" fill={RED} />
      {houses}
    </svg>
  );
};

// Half frame: a TV chart show — just a few names at the top.
export const ChartHalf: React.FC = () => {
  const t = useCurrentFrame();
  const bars = [520, 430, 360, 300, 250];
  return (
    <svg
      viewBox="0 0 1080 960"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
    >
      <Wallpaper w={1080} h={960} id="ch" />
      <g transform="translate(150 120) scale(1.04)">
        <rect x="-30" y="-30" width="780" height="620" rx="50" fill="#5a3416" />
        <Crt id="ch-crt">
          <rect width="600" height="450" fill="#1b1033" />
          <text
            x="300"
            y="70"
            textAnchor="middle"
            fontFamily="Oswald"
            fontWeight="700"
            fontSize="52"
            fill={GOLD}
          >
            TOP 5
          </text>
          {bars.map((w, i) => {
            const grow = Math.min(1, Math.max(0, (t - i * 6) / 25));
            return (
              <g key={i} transform={`translate(60 ${110 + i * 64})`}>
                <text
                  x="0"
                  y="40"
                  fontFamily="Oswald"
                  fontWeight="700"
                  fontSize="40"
                  fill="#fff"
                >
                  {i + 1}
                </text>
                <rect
                  x="50"
                  y="8"
                  width={(w - 60) * grow}
                  height="40"
                  rx="8"
                  fill={i === 0 ? GOLD : i === 1 ? "#ff8a3d" : RED}
                />
                <rect
                  x="66"
                  y="22"
                  width={Math.max(0, (w - 160) * grow * 0.5)}
                  height="12"
                  rx="6"
                  fill="#fff"
                  opacity="0.6"
                />
              </g>
            );
          })}
        </Crt>
      </g>
    </svg>
  );
};

// Half frame: a wall calendar flipping slowly through the years while a
// radio keeps playing the same hit.
export const CalendarHalf: React.FC = () => {
  const t = useCurrentFrame();
  const per = 34;
  const year = 1983 + Math.min(3, Math.floor(t / per));
  const flip = (t % per) / per;
  const lift = flip > 0.82 ? (flip - 0.82) / 0.18 : 0;
  return (
    <svg
      viewBox="0 0 1080 960"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
    >
      <Wallpaper w={1080} h={960} id="cal" />
      <g transform="translate(140 140)">
        <rect width="420" height="520" fill="#f3ead6" />
        <rect width="420" height="110" fill={RED} />
        <circle cx="120" cy="0" r="14" fill="#2a1408" />
        <circle cx="300" cy="0" r="14" fill="#2a1408" />
        <text
          x="210"
          y="300"
          textAnchor="middle"
          fontFamily="Oswald"
          fontWeight="700"
          fontSize="150"
          fill="#2a1408"
        >
          {year}
        </text>
        {[0, 1, 2, 3, 4].map((r) => (
          <rect
            key={r}
            x="40"
            y={360 + r * 28}
            width="340"
            height="10"
            rx="5"
            fill="#d8ccb2"
          />
        ))}
        <g
          transform={`translate(0 ${-lift * 140}) rotate(${-lift * 25} 0 0)`}
          opacity={1 - lift}
        >
          <rect width="420" height="520" fill="#f3ead6" />
          <rect width="420" height="110" fill={RED} />
          <text
            x="210"
            y="300"
            textAnchor="middle"
            fontFamily="Oswald"
            fontWeight="700"
            fontSize="150"
            fill="#2a1408"
          >
            {year}
          </text>
        </g>
      </g>
      {/* radio */}
      <g transform="translate(640 470)">
        <rect width="340" height="230" rx="30" fill="#8a5426" />
        <rect x="24" y="30" width="180" height="170" rx="20" fill="#3a2010" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect
            key={i}
            x="40"
            y={50 + i * 25}
            width="148"
            height="8"
            rx="4"
            fill="#5a3418"
          />
        ))}
        <circle cx="270" cy="80" r="34" fill={GOLD} />
        <circle cx="270" cy="160" r="22" fill="#e9dfc8" />
        <line
          x1="60"
          y1="0"
          x2="20"
          y2="-120"
          stroke="#2a1408"
          strokeWidth="8"
        />
      </g>
      {[0, 1, 2].map((i) => {
        const p = ((t + i * 25) % 75) / 75;
        return (
          <g
            key={i}
            transform={`translate(${700 + i * 70 + Math.sin(p * 6) * 20} ${440 - p * 300})`}
            opacity={1 - p}
          >
            <ellipse cx="0" cy="40" rx="18" ry="13" fill={GOLD} />
            <rect x="12" y="-20" width="7" height="60" fill={GOLD} />
          </g>
        );
      })}
      <rect
        width="1080"
        height="960"
        fill="#000"
        opacity={random(`cal-${Math.floor(t / 3)}`) * 0.04}
      />
    </svg>
  );
};
