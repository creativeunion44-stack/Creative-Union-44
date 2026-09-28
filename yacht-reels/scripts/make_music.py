"""Synthesise the reel's music bed: summer house, 120 BPM, A minor.

Written from scratch (no samples), so the track is free to publish.
One beat is 0.5 s = 15 video frames, and every cut in src/Reel.tsx lands
on a beat. Sections follow the edit:

  0.0- 3.0  title: filtered chords, hats, riser + snare roll into the drop
  3.0-11.0  drop A: kick, claps, off-beat bass, pumping chords
 11.0-14.0  "здесь и сейчас": breakdown with a pluck melody, riser
 14.0-22.5  drop B: drop A + melody, final impact at 22.0

Usage: python3 scripts/make_music.py  ->  public/music.wav
"""

from pathlib import Path

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 44100
BEAT = 0.5
LENGTH = 22.5
# Cut times in seconds; keep in sync with SHOTS in src/Reel.tsx.
CUTS = [3.0, 5.0, 7.0, 9.0, 11.0, 14.0, 16.0, 19.5]

N = int(SR * LENGTH)
t_all = np.arange(N) / SR
rng = np.random.default_rng(44)
L = np.zeros(N)
R = np.zeros(N)


def lp(x, hz, order=2):
    return sosfilt(butter(order, hz, "low", fs=SR, output="sos"), x)


def hp(x, hz, order=2):
    return sosfilt(butter(order, hz, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x)


def add(sig, start, gain=1.0, pan=0.0):
    i = int(start * SR)
    if i >= N:
        return
    sig = sig[: N - i] * gain
    L[i : i + len(sig)] += sig * np.sqrt(0.5 * (1 - pan))
    R[i : i + len(sig)] += sig * np.sqrt(0.5 * (1 + pan))


def saw(freq, dur, detune=0.0):
    t = np.arange(int(dur * SR)) / SR
    f = freq * (1 + detune)
    return 2 * ((t * f + rng.random()) % 1) - 1


def section(t):
    if t < 3.0:
        return "intro"
    if 11.0 <= t < 14.0:
        return "break"
    return "drop"


# ---------- drums ----------


def kick():
    t = np.arange(int(0.35 * SR)) / SR
    f = 45 + 110 * np.exp(-t / 0.03)
    phase = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(phase) * np.exp(-t / 0.12) + 0.3 * np.exp(-t / 0.004)


def clap():
    n = int(0.25 * SR)
    t = np.arange(n) / SR
    noise = bp(rng.standard_normal(n), 900, 3500)
    env = np.exp(-t / 0.09)
    for k in (0.0, 0.011, 0.022):
        env += 0.6 * np.exp(-np.clip(t - k, 0, None) / 0.006) * (t >= k)
    return noise * env * 0.5


def hat(open_=False):
    n = int((0.18 if open_ else 0.05) * SR)
    t = np.arange(n) / SR
    return hp(rng.standard_normal(n), 7500) * np.exp(-t / (0.06 if open_ else 0.015))


def snare():
    n = int(0.15 * SR)
    t = np.arange(n) / SR
    body = np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.03)
    return (0.5 * body + bp(rng.standard_normal(n), 1500, 6000) * np.exp(-t / 0.05)) * 0.6


kick_times = []
steps = int(LENGTH / (BEAT / 4))
for s in range(steps):
    t = s * BEAT / 4
    sec = section(t)
    beat_pos = s % 4  # 16th inside the beat
    beat_no = (s // 4) % 4
    if sec == "drop":
        if beat_pos == 0 and t < 22.0:
            add(kick(), t, 0.95)
            kick_times.append(t)
        if beat_pos == 0 and beat_no in (1, 3) and t < 22.0:
            add(clap(), t, 0.55)
        if beat_pos == 2:
            add(hat(True), t, 0.16, pan=0.2)
        elif t < 22.0:
            add(hat(), t, 0.09 if beat_pos else 0.05, pan=-0.25)
    elif sec == "intro":
        if beat_pos == 2:
            add(hat(), t, 0.08, pan=0.2)
    elif sec == "break" and beat_pos == 2 and t >= 12.0:
        add(hat(), t, 0.07, pan=0.2)

# Snare rolls into each drop (8ths, then 16ths, getting louder).
for drop in (3.0, 14.0):
    for k in range(12):
        tt = drop - 1.0 + (k * 0.125 if k < 4 else 0.5 + (k - 4) * 0.0625)
        add(snare(), tt, 0.15 + 0.035 * k, pan=0.1)

# Sidechain envelope from the kicks: everything tonal ducks and pumps.
duck = np.ones(N)
for kt in kick_times:
    i = int(kt * SR)
    seg = np.arange(min(int(0.4 * SR), N - i)) / SR
    duck[i : i + len(seg)] = np.minimum(
        duck[i : i + len(seg)], 1 - 0.75 * np.exp(-seg / 0.09)
    )

# ---------- harmony ----------

# Am - F - C - G, one bar (2 s) each.
CHORDS = [
    [220.0, 261.63, 329.63],
    [174.61, 220.0, 261.63],
    [196.0, 261.63, 329.63],
    [196.0, 246.94, 293.66],
]
ROOTS = [55.0, 43.65, 65.41, 49.0]

pad_l = np.zeros(N)
pad_r = np.zeros(N)
bass = np.zeros(N)
for bar in range(int(np.ceil(LENGTH / 2))):
    start = bar * 2.0
    chord = CHORDS[bar % 4]
    i = int(start * SR)
    for f in chord:
        for d, side in ((-0.006, "l"), (0.0, "c"), (0.006, "r")):
            v = saw(f, 2.0, d)
            j = min(len(v), N - i)
            if side in ("l", "c"):
                pad_l[i : i + j] += v[:j] * (0.5 if side == "c" else 1)
            if side in ("r", "c"):
                pad_r[i : i + j] += v[:j] * (0.5 if side == "c" else 1)
    # Off-beat bass: the "and" of every beat.
    for b in range(4):
        tt = start + b * BEAT + BEAT / 2
        if tt >= 22.0 or section(tt) != "drop":
            continue
        n = int(0.22 * SR)
        tn = np.arange(n) / SR
        root = ROOTS[bar % 4]
        v = (saw(root * 2, 0.22) + 0.6 * np.sin(2 * np.pi * root * tn)) * np.exp(-tn / 0.12)
        k = int(tt * SR)
        m = min(n, N - k)
        bass[k : k + m] += v[:m]

# Dark (filtered) pad for intro/breakdown, bright pad for the drops.
dark = [lp(p, 700, 4) for p in (pad_l, pad_r)]
bright = [lp(p, 3200, 2) for p in (pad_l, pad_r)]
# Intro filter opens from 400 Hz to fully bright right at the drop.
mix_b = np.clip((t_all - 1.0) / 2.0, 0, 1) * (t_all < 11.0)
mix_b += (t_all >= 14.0) + np.clip((t_all - 12.5) / 1.5, 0, 1) * (t_all >= 11.0) * (t_all < 14.0)
mix_b = np.clip(mix_b, 0, 1)
gate = np.where(t_all < 22.0, 1.0, np.exp(-(t_all - 22.0) / 0.25))
for ch, (d, b) in zip((L, R), zip(dark, bright)):
    ch += (d * (1 - mix_b) * 0.09 + b * mix_b * 0.07) * duck * gate
bass = lp(bass, 900) * duck * 0.28
L += bass
R += bass

# ---------- pluck melody (breakdown + drop B) ----------

MELODY = [  # (beat offset inside a 2-bar phrase, MIDI note)
    (0.0, 76), (0.5, 74), (1.0, 72), (1.5, 69), (2.5, 72), (3.0, 74),
    (4.0, 76), (4.5, 79), (5.0, 76), (5.5, 74), (6.5, 72), (7.0, 69),
]


def pluck(freq):
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    tone = np.sin(2 * np.pi * freq * t) + 0.35 * np.sin(4 * np.pi * freq * t)
    return tone * np.exp(-t / 0.09)


for phrase_start in (11.0, 15.0, 19.0):
    for off, midi in MELODY:
        tt = phrase_start + off * BEAT
        if tt >= 22.0:
            continue
        f = 440 * 2 ** ((midi - 69) / 12)
        g = 0.2 if tt < 14.0 else 0.13
        add(pluck(f), tt, g, pan=-0.3)
        add(pluck(f), tt + 0.375, g * 0.45, pan=0.5)  # dotted-8th echo
        add(pluck(f), tt + 0.75, g * 0.2, pan=-0.5)

# ---------- FX ----------


def riser(dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    env = (t / dur) ** 2
    noise = hp(rng.standard_normal(n), 2000) * env * 0.35
    f = 250 * (8 ** (t / dur))
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) * env * 0.12
    return noise + tone


def whoosh():
    n = int(0.3 * SR)
    t = np.arange(n) / SR
    env = np.sin(np.pi * t / 0.3) ** 2
    return bp(rng.standard_normal(n), 600, 5000) * env * 0.35


def impact():
    n = int(1.2 * SR)
    t = np.arange(n) / SR
    boom = np.sin(2 * np.pi * (38 + 40 * np.exp(-t / 0.05)) * t) * np.exp(-t / 0.35)
    crash = hp(rng.standard_normal(n), 3000) * np.exp(-t / 0.4) * 0.35
    return boom + crash


add(riser(1.5), 1.5, 1.0)
add(riser(1.0), 13.0, 1.0)
for c in CUTS:
    add(whoosh(), c - 0.22, 0.6, pan=0.3 if int(c) % 2 else -0.3)
for c in (3.0, 14.0, 22.0):
    add(impact(), c, 0.7)

# ---------- master ----------

stereo = np.stack([L, R], axis=1)
stereo = np.tanh(stereo * 1.4) / np.tanh(1.4)
fade = np.clip((LENGTH - t_all) / 0.05, 0, 1)[:, None]
stereo *= fade
stereo *= 0.89 / np.max(np.abs(stereo))

out = Path(__file__).resolve().parent.parent / "public" / "music.wav"
wavfile.write(out, SR, (stereo * 32767).astype(np.int16))
print(f"wrote {out} ({LENGTH} s)")
