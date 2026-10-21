"""Synthesise the essay's sound, from scratch (no samples, free to publish).

Three stems, each the full 90 s, written to public/music/ as MP3:

  old  calm early-80s disco, 108 BPM: soft four-on-the-floor kick,
           open hats, octave disco bass, funk-guitar chops, strings and
           electric piano, with a warm tape feel. Played over the past
           (the "then" shots) and the final chord.
  new  modern, slightly uneasy track: heartbeat kick, ticking hats,
           pulsing D-minor bass, a cold pad with a dissonant shimmer. Builds
           under the name montage, drops at "no single answer".
  sfx  tape rewind into 1983, play button, whooshes for the split
           screen, the phone put down and the screen locking.

The Remotion edit crossfades old/new (src/timeline.ts); scene times come
from src/timeline.json so the music follows the edit.

Usage: python3 scripts/make_music.py
"""

import json
import subprocess
from pathlib import Path

import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

ROOT = Path(__file__).resolve().parent.parent
TL = json.loads((ROOT / "src" / "timeline.json").read_text())
OUT = ROOT / "public" / "music"

SR = 44100
LENGTH = TL["duration"] + 1.0
N = int(SR * LENGTH)
rng = np.random.default_rng(83)


def lp(x, hz, order=2):
    return sosfilt(butter(order, hz, "low", fs=SR, output="sos"), x)


def hp(x, hz, order=2):
    return sosfilt(butter(order, hz, "high", fs=SR, output="sos"), x)


def bp(x, lo, hi, order=2):
    return sosfilt(butter(order, [lo, hi], "band", fs=SR, output="sos"), x)


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


class Stem:
    def __init__(self):
        self.L = np.zeros(N)
        self.R = np.zeros(N)

    def add(self, sig, start, gain=1.0, pan=0.0):
        i = int(start * SR)
        if i >= N or i < 0:
            return
        sig = sig[: N - i] * gain
        self.L[i : i + len(sig)] += sig * np.sqrt(0.5 * (1 - pan))
        self.R[i : i + len(sig)] += sig * np.sqrt(0.5 * (1 + pan))

    def write(self, name, peak=0.7):
        st = np.stack([self.L, self.R], axis=1)
        st = np.tanh(st / (np.max(np.abs(st)) + 1e-9) * 1.4) / np.tanh(1.4)
        st *= peak / (np.max(np.abs(st)) + 1e-9)
        OUT.mkdir(parents=True, exist_ok=True)
        wav = OUT / f"{name}.wav"
        wavfile.write(wav, SR, (st * 32767).astype(np.int16))
        mp3 = OUT / f"{name}.mp3"
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wav, "-b:a", "192k", mp3], check=True)
        wav.unlink()
        print("wrote", mp3)


def env_adsr(n, a, d, s, r, sus_len):
    a, d, r = int(a * SR), int(d * SR), int(r * SR)
    sus = max(0, int(sus_len * SR) - a - d)
    e = np.concatenate(
        [
            np.linspace(0, 1, max(a, 1)),
            np.linspace(1, s, max(d, 1)),
            np.full(sus, s),
            np.linspace(s, 0, max(r, 1)),
        ]
    )
    return e[:n] if len(e) >= n else np.pad(e, (0, n - len(e)))


# ==================== OLD: calm early-80s disco ====================

BPM_OLD = 108
BEAT_O = 60 / BPM_OLD
BAR_O = 4 * BEAT_O
# Dm9, G13, Cmaj9, Am9 (bass note first), one bar each
CHORDS = [
    [38, 53, 57, 60, 64],
    [43, 53, 57, 59, 64],
    [36, 52, 55, 59, 62],
    [33, 55, 59, 60, 64],
]
FINAL = [36, 48, 55, 59, 62, 64, 71]  # Cmaj9, rings out at the end


def epiano(freq, dur, vel=1.0):
    n = int((dur + 1.5) * SR)
    t = np.arange(n) / SR
    index = 1.8 * np.exp(-t / 0.35) + 0.15
    mod = np.sin(2 * np.pi * freq * t) * index
    tone = np.sin(2 * np.pi * freq * t + mod)
    tine = 0.25 * np.sin(2 * np.pi * freq * 4 * t) * np.exp(-t / 0.08)
    e = np.exp(-t / 1.6) * np.clip((dur + 0.3 - t) / 0.3, 0, 1) ** 0.5
    return (tone + tine) * e * vel


def warm_pad(freqs, dur, cutoff=1500):
    """Soft string section: detuned saws, slow attack."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    sig = np.zeros(n)
    for f in freqs:
        for det in (-0.005, 0.0, 0.006):
            sig += 2 * ((t * f * (1 + det) + rng.random()) % 1) - 1
    sig = lp(sig, cutoff, 2) * (1 + 0.04 * np.sin(2 * np.pi * 5.5 * t))
    return sig * env_adsr(n, 0.5, 0.4, 0.85, 0.8, dur) / len(freqs)


def soft_kick():
    t = np.arange(int(0.3 * SR)) / SR
    f = 48 + 60 * np.exp(-t / 0.02)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.13)


def hat(open_=False):
    n = int((0.16 if open_ else 0.04) * SR)
    t = np.arange(n) / SR
    return hp(rng.standard_normal(n), 7000) * np.exp(-t / (0.06 if open_ else 0.012))


def clap():
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    env = np.exp(-t / 0.12)
    for k in (0.0, 0.01, 0.02):
        env += 0.5 * np.exp(-np.clip(t - k, 0, None) / 0.005) * (t >= k)
    return bp(rng.standard_normal(n), 900, 4000) * env * 0.5


def disco_bass(note, dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    f = midi(note)
    saw = 2 * ((t * f) % 1) - 1
    body = lp(saw, 700, 2) + 0.6 * np.sin(2 * np.pi * f * t)
    return body * np.exp(-t / 0.16) * np.clip((dur - t) / 0.01, 0, 1)


def guitar_chop(notes):
    """Muted funk-guitar stab: bright, very short."""
    n = int(0.09 * SR)
    t = np.arange(n) / SR
    sig = sum(2 * ((t * midi(m) + rng.random()) % 1) - 1 for m in notes)
    return bp(sig, 700, 3500) * np.exp(-t / 0.025) / len(notes)


def old_stem():
    st = Stem()
    end = TL["outroChord"]
    b8 = BEAT_O / 2
    bar = 0
    while bar * BAR_O < end - 0.2:
        t0 = bar * BAR_O
        root, *voicing = CHORDS[bar % 4]
        # strings hold the chord; electric piano on 1 and the "and" of 2
        st.add(warm_pad([midi(n) for n in voicing], BAR_O + 0.4), t0, 0.16, pan=-0.15)
        for hit in (0.0, 1.5):
            st.add(sum(epiano(midi(n), BEAT_O * 0.9, 0.5) for n in voicing), t0 + hit * BEAT_O, 0.13, pan=-0.35)
        for beat in range(4):
            tb = t0 + beat * BEAT_O
            st.add(soft_kick(), tb, 0.45)  # four on the floor, kept soft
            st.add(hat(True), tb + b8, 0.07, pan=0.25)  # open hat on the off-beat
            for s in (0, 2):
                st.add(hat(), tb + s * BEAT_O / 4, 0.03, pan=0.3)
            if beat in (1, 3):
                st.add(clap(), tb, 0.12)
            # octave-jumping disco bass on eighths
            for e in range(2):
                note = root - 12 + (12 if e else 0)
                st.add(disco_bass(note, b8 * 0.9), tb + e * b8, 0.3)
            # funk guitar chops on the off-beats
            st.add(guitar_chop([n + 12 for n in voicing[:3]]), tb + b8, 0.1, pan=0.45)
        bar += 1
    # final chord: strings and electric piano ring out to the end, no drums
    dur = LENGTH - end
    st.add(warm_pad([midi(n) for n in FINAL[1:]], dur, cutoff=1200), end, 0.3)
    st.add(sum(epiano(midi(n), 4.0, 0.7) for n in FINAL), end + 0.2, 0.16)
    st.add(sum(epiano(midi(n + 12), 3.0, 0.4) for n in FINAL[3:]), end + 1.7, 0.08)

    # old-record warmth: gentle tape wow, rolled-off highs, a little hiss
    t = np.arange(N) / SR
    delay = (0.004 + 0.0008 * np.sin(2 * np.pi * 0.5 * t)) * SR
    idx = np.clip(np.arange(N) - delay, 0, N - 1)
    for ch_name in ("L", "R"):
        x = getattr(st, ch_name)
        x = np.interp(idx, np.arange(N), x)
        x = lp(x, 8000, 2)
        x += 0.003 * hp(rng.standard_normal(N), 3000)
        setattr(st, ch_name, x)
    return st


# ===================== NEW: modern, uneasy =====================

BPM_NEW = 96
BEAT_N = 60 / BPM_NEW
WHO0, NAMES0, NAMES1, WHO1 = TL["who"][0], TL["whoNames"][0], TL["whoNames"][1], TL["who"][1]
DROP = NAMES1  # "there's no single answer"


def kick(hard=1.0):
    n = int(0.4 * SR)
    t = np.arange(n) / SR
    f = 42 + 70 * np.exp(-t / 0.025)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.18) * hard


def tick():
    n = int(0.03 * SR)
    t = np.arange(n) / SR
    return hp(rng.standard_normal(n), 8000) * np.exp(-t / 0.006)


def cold_pad(freqs, dur, cutoff=900):
    n = int(dur * SR)
    t = np.arange(n) / SR
    sig = np.zeros(n)
    for f in freqs:
        for det in (-0.007, 0.0, 0.006):
            sig += 2 * ((t * f * (1 + det) + rng.random()) % 1) - 1
    # slow filter wobble
    sig = lp(sig, cutoff, 2) * (0.75 + 0.25 * np.sin(2 * np.pi * 0.13 * t))
    return sig * env_adsr(n, 1.5, 0.5, 0.9, 1.5, dur) / len(freqs)


def new_stem():
    st = Stem()
    end = TL["outroChord"]
    # pad across everything, Dm(add9) / Bb(add9) alternating every 4 bars
    pads = [[50, 57, 62, 64, 65], [46, 53, 58, 60, 62]]
    bar = 4 * BEAT_N
    k = 0
    t0 = 0.0
    while t0 < end:
        st.add(cold_pad([midi(n) for n in pads[k % 2]], 4 * bar + 1.5), t0, 0.26)
        t0 += 4 * bar
        k += 1
    # dissonant shimmer (minor second) swelling now and then
    for s0 in np.arange(3.0, end - 4, 9.0):
        n = int(5 * SR)
        t = np.arange(n) / SR
        sh = np.sin(2 * np.pi * midi(81) * t) + np.sin(2 * np.pi * midi(82) * t)
        st.add(sh * np.sin(np.pi * t / 5) ** 2, s0, 0.03, pan=0.5)

    beats = int(end / BEAT_N)
    for b in range(beats):
        t = b * BEAT_N
        building = NAMES0 <= t < DROP
        after_drop = t >= DROP
        # heartbeat: lub-dub on every other beat
        if b % 2 == 0 and not (DROP <= t < DROP + 2.0):
            hard = 1.0 if not after_drop else 0.6
            st.add(kick(hard), t, 0.55)
            st.add(kick(hard * 0.7), t + 0.18, 0.4)
        # pulsing bass on eighths
        if not after_drop or t >= DROP + 2.0:
            for e in range(2):
                n = int(BEAT_N / 2 * SR)
                tt = np.arange(n) / SR
                note = [38, 38, 41, 40][(b // 2) % 4]
                saw = 2 * ((tt * midi(note) + rng.random()) % 1) - 1
                bass = lp(saw, 380, 2) * np.exp(-tt / 0.14)
                st.add(bass, t + e * BEAT_N / 2, 0.22 if not after_drop else 0.12)
        # ticking hats: 16ths, doubling to 32nds while the names build
        if not after_drop:
            div = 8 if building else 4
            for s in range(div):
                st.add(tick(), t + s * BEAT_N / div, 0.12 if s % 2 else 0.18, pan=-0.3)
        if building and b % 1 == 0:
            n = int(0.12 * SR)
            tt = np.arange(n) / SR
            st.add(np.sin(2 * np.pi * 180 * tt) * np.exp(-tt / 0.04), t + BEAT_N / 2, 0.25)

    # riser into the drop, then a deep boom
    rise = DROP - NAMES0
    n = int(rise * SR)
    tt = np.arange(n) / SR
    noise = rng.standard_normal(n)
    riser = np.zeros(n)
    for i in range(0, n, 2048):
        seg = noise[i : i + 2048]
        f = 300 + 5000 * (i / n) ** 2
        riser[i : i + 2048] = bp(seg, f, f * 1.6)
    st.add(riser * (tt / rise) ** 2, NAMES0, 0.35)
    n = int(3.0 * SR)
    tt = np.arange(n) / SR
    boom = np.sin(2 * np.pi * np.cumsum(30 + 40 * np.exp(-tt / 0.08)) / SR) * np.exp(-tt / 1.0)
    st.add(boom, DROP, 0.9)
    return st


# ============================ SFX ============================


def sfx_stem():
    st = Stem()
    # tape rewind: warbling squeal + hiss, then the play button clunk
    t_rw = TL["then"][0] - 0.6
    n = int(1.1 * SR)
    t = np.arange(n) / SR
    f = 500 + 2600 * (t / 1.1) ** 1.5 + 120 * np.sin(2 * np.pi * 23 * t)
    squeal = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.4 + bp(rng.standard_normal(n), 2000, 7000) * 0.6
    st.add(squeal * np.sin(np.pi * t / 1.1), t_rw, 0.35)
    n = int(0.25 * SR)
    t = np.arange(n) / SR
    clunk = lp(rng.standard_normal(n), 1800) * np.exp(-t / 0.02) + np.sin(2 * np.pi * 90 * t) * np.exp(-t / 0.06)
    st.add(clunk, TL["then"][0] - 0.05, 0.6)
    # whoosh as each split screen opens
    for r in TL["reasons"]:
        n = int(0.8 * SR)
        t = np.arange(n) / SR
        w = np.zeros(n)
        noise = rng.standard_normal(n)
        for i in range(0, n, 1024):
            fc = 400 + 3000 * np.sin(np.pi * i / n)
            w[i : i + 1024] = bp(noise[i : i + 1024], fc, fc * 1.8)
        st.add(w * np.sin(np.pi * t / 0.8) ** 2, r["start"] - 0.1, 0.25)
    # phone put down on the nightstand, then the screen lock click
    n = int(0.3 * SR)
    t = np.arange(n) / SR
    thud = lp(rng.standard_normal(n), 900) * np.exp(-t / 0.03) + np.sin(2 * np.pi * 120 * t) * np.exp(-t / 0.05)
    st.add(thud, TL["end"][0] + 1.33, 0.5)
    n = int(0.05 * SR)
    t = np.arange(n) / SR
    st.add(hp(rng.standard_normal(n), 2500) * np.exp(-t / 0.008), 83.3, 0.4)
    return st


if __name__ == "__main__":
    old_stem().write("old")
    new_stem().write("new")
    sfx_stem().write("sfx", peak=0.8)
