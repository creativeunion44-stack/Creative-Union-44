"""Synthesise the essay's sound, from scratch (no samples, free to publish).

Three stems, each the full 90 s, written to public/music/ as MP3:

  old  slow, romantic 70s-style ballad, 70 BPM, no heavy lows: piano,
           Rhodes, lush strings, flute tune, harp sweeps, celesta, finger
           snaps and soft "aah" voices, with a warm reverb and tape feel.
           Played over the past
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


# ============ OLD: slow, romantic 70s ballad (light, no heavy lows) ============

BPM_OLD = 70
BEAT_O = 60 / BPM_OLD
BAR_O = 4 * BEAT_O
# Cmaj7 Em7 Am7 Fmaj7 Dm7 G7sus4 Cmaj7 F/G: (light bass note, chord)
CHORDS = [
    (48, [60, 64, 67, 71]),
    (52, [59, 62, 64, 67]),
    (45, [57, 60, 64, 67]),
    (41, [57, 60, 64, 65]),
    (50, [57, 60, 62, 65]),
    (43, [60, 62, 65, 67]),
    (48, [60, 64, 67, 71]),
    (43, [57, 60, 65, 69]),
]
FINAL = (48, [60, 64, 67, 71, 74])  # Cmaj9, rings out at the end
# the flute tune, one phrase per bar: (MIDI note, beats)
MELODY = [
    [(76, 1.5), (74, 0.5), (76, 1), (79, 1)],
    [(71, 2), (67, 1), (69, 1)],
    [(72, 1.5), (71, 0.5), (72, 1), (76, 1)],
    [(69, 3), (67, 1)],
    [(77, 1.5), (76, 0.5), (74, 1), (72, 1)],
    [(74, 2), (72, 1), (71, 1)],
    [(72, 1), (76, 1), (79, 1), (83, 1)],
    [(81, 2), (79, 2)],
]


def epiano(freq, dur, vel=1.0):
    n = int((dur + 1.5) * SR)
    t = np.arange(n) / SR
    index = 1.4 * np.exp(-t / 0.4) + 0.1
    tone = np.sin(2 * np.pi * freq * t + np.sin(2 * np.pi * freq * t) * index)
    tine = 0.2 * np.sin(2 * np.pi * freq * 4 * t) * np.exp(-t / 0.08)
    e = np.exp(-t / 2.0) * np.clip((dur + 0.4 - t) / 0.4, 0, 1) ** 0.5
    return (tone + tine) * e * vel


def piano(freq, dur, vel=1.0):
    """Bright acoustic-style piano: decaying, slightly stretched partials."""
    n = int((dur + 2.0) * SR)
    t = np.arange(n) / SR
    sig = np.zeros(n)
    for k, amp in enumerate((1.0, 0.5, 0.3, 0.18, 0.1, 0.06), start=1):
        fk = freq * k * (1 + 0.0004 * k * k)
        sig += amp * np.sin(2 * np.pi * fk * t) * np.exp(-t * (0.6 + 0.5 * k))
    hammer = 0.05 * hp(rng.standard_normal(n), 2000) * np.exp(-t / 0.01)
    release = np.clip((dur + 0.6 - t) / 0.6, 0, 1)
    return (sig + hammer) * release * vel


def strings(freqs, dur, cutoff=2600):
    """Lush string section: many detuned saws, slow swell, vibrato."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    sig = np.zeros(n)
    for f in freqs:
        for det in (-0.006, -0.002, 0.003, 0.007):
            vib = 1 + 0.003 * np.sin(2 * np.pi * (5 + det * 100) * t)
            sig += 2 * ((np.cumsum(f * (1 + det) * vib) / SR + rng.random()) % 1) - 1
    sig = lp(hp(sig, 200), cutoff, 2)
    return sig * env_adsr(n, 1.2, 0.5, 0.9, 1.5, dur) / (4 * len(freqs))


def choir(freqs, dur):
    """Soft "aah" voices: saws through two vowel formants."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    src = np.zeros(n)
    for f in freqs:
        for det in (-0.004, 0.004):
            src += 2 * ((t * f * (1 + det) + rng.random()) % 1) - 1
    voice = bp(src, 650, 1100) + 0.6 * bp(src, 1000, 1400)
    return voice * env_adsr(n, 1.5, 0.5, 0.9, 1.5, dur) / (2 * len(freqs))


def flute(note, dur):
    n = int((dur + 0.3) * SR)
    t = np.arange(n) / SR
    vib = 1 + 0.005 * np.sin(2 * np.pi * 5.0 * t) * np.clip((t - 0.2) / 0.3, 0, 1)
    phase = 2 * np.pi * np.cumsum(midi(note) * vib) / SR
    tone = np.sin(phase) + 0.15 * np.sin(2 * phase) + 0.05 * np.sin(3 * phase)
    breath = 0.06 * bp(rng.standard_normal(n), 1800, 5000)
    return (tone + breath) * env_adsr(n, 0.07, 0.15, 0.85, 0.35, dur)


def celesta(note):
    """Glockenspiel / celesta sparkle."""
    n = int(1.6 * SR)
    t = np.arange(n) / SR
    f = midi(note)
    return (np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t / 0.15)) * np.exp(-t / 0.5)


def harp_gliss(start_note, steps=12, length=1.0):
    """A quick upward sweep of plucked notes on the C major scale."""
    scale = [0, 2, 4, 5, 7, 9, 11]
    out = np.zeros(int((length + 2.0) * SR))
    for k in range(steps):
        note = start_note + 12 * (k // 7) + scale[k % 7]
        n = int(1.8 * SR)
        t = np.arange(n) / SR
        f = midi(note)
        pluck = (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(4 * np.pi * f * t)) * np.exp(-t / 0.6)
        i = int(k * length / steps * SR)
        out[i : i + n] += pluck[: len(out) - i]
    return out / 4


def snap():
    """A finger snap: short bright click with a little body."""
    n = int(0.12 * SR)
    t = np.arange(n) / SR
    return (bp(rng.standard_normal(n), 1800, 5000) * np.exp(-t / 0.012) + 0.3 * np.sin(2 * np.pi * 1100 * t) * np.exp(-t / 0.008))


def room(x, seconds=2.0, mix=0.3):
    """A lush 70s-style reverb: convolve with a decaying noise tail."""
    from scipy.signal import fftconvolve

    n = int(seconds * SR)
    tail = lp(rng.standard_normal(n), 4500) * np.exp(-np.arange(n) / SR / (seconds / 5))
    tail /= np.sqrt(np.sum(tail**2))
    return x + mix * fftconvolve(x, tail)[: len(x)]


def old_stem():
    st = Stem()
    end = TL["outroChord"]
    bar = 0
    while bar * BAR_O < end - 0.2:
        t0 = bar * BAR_O
        bass, chord = CHORDS[bar % 8]
        cf = [midi(n) for n in chord]
        st.add(strings(cf + [midi(chord[-1] + 12)], BAR_O + 0.8), t0, 0.22, pan=-0.2)
        # Rhodes holds the chord, piano plays a gentle broken pattern
        st.add(sum(epiano(f, BAR_O * 0.95, 0.5) for f in cf), t0, 0.07, pan=0.3)
        pattern = [chord[0], chord[2], chord[3], chord[2] + 12, chord[1] + 12, chord[3], chord[2], chord[1]]
        for k, m in enumerate(pattern):
            st.add(piano(midi(m), BEAT_O * 0.6, 0.5), t0 + k * BEAT_O / 2, 0.08, pan=-0.3)
        # a light, round bass (kept out of the low rumble)
        n = int(BAR_O * SR)
        t = np.arange(n) / SR
        b = np.sin(2 * np.pi * midi(bass) * t) * env_adsr(n, 0.03, 0.4, 0.6, 0.5, BAR_O * 0.9)
        st.add(hp(b, 90), t0, 0.12)
        # finger snaps on 2 and 4, a soft shaker on the eighths
        for beat in (1, 3):
            st.add(snap(), t0 + beat * BEAT_O, 0.16, pan=0.15)
        for e in range(8):
            m = int(0.06 * SR)
            sh = bp(rng.standard_normal(m), 5000, 10000) * np.exp(-np.arange(m) / SR / 0.02)
            st.add(sh, t0 + e * BEAT_O / 2, 0.025, pan=0.35)
        # the flute tune after a two-bar intro, choir "aah" in the second half
        if bar >= 2:
            tb = t0
            for note, beats in MELODY[(bar - 2) % 8]:
                st.add(flute(note, beats * BEAT_O * 0.95), tb, 0.12, pan=0.05)
                tb += beats * BEAT_O
        if (bar // 8) % 2 == 1:
            st.add(choir(cf, BAR_O + 0.6), t0, 0.08)
        # celesta sparkle every other bar
        if bar % 2 == 1:
            for k, m in enumerate([chord[3] + 12, chord[2] + 24, chord[3] + 24]):
                st.add(celesta(m), t0 + (2 + k * 0.5) * BEAT_O, 0.05, pan=0.4)
        bar += 1
    # harp sweeps: on the PLAY button and at the start of every eight bars
    st.add(harp_gliss(60, 14, 1.0), TL["then"][0], 0.35, pan=-0.1)
    for b8 in range(0, bar, 8):
        st.add(harp_gliss(60, 12, 1.2), b8 * BAR_O, 0.25, pan=-0.1)
    # final chord: strings, choir, piano and a last harp sweep ring out
    dur = LENGTH - end
    fb, fch = FINAL
    fcf = [midi(n) for n in fch]
    st.add(strings(fcf, dur), end, 0.24)
    st.add(choir(fcf, dur), end, 0.06)
    st.add(sum(piano(f, 4.0, 0.6) for f in fcf), end + 0.3, 0.08)
    st.add(harp_gliss(60, 14, 1.4), end, 0.3)
    for k, m in enumerate([88, 84, 91]):
        st.add(celesta(m), end + 1.6 + k * 0.4, 0.05, pan=0.4)

    # warm 70s record: lush reverb, gentle tape wow, soft highs, light hiss
    t = np.arange(N) / SR
    delay = (0.004 + 0.0007 * np.sin(2 * np.pi * 0.5 * t)) * SR
    idx = np.clip(np.arange(N) - delay, 0, N - 1)
    for ch_name in ("L", "R"):
        x = getattr(st, ch_name)
        x = room(x, 2.4, 0.35)
        x = np.interp(idx, np.arange(N), x)
        x = lp(hp(x, 80), 9000, 2)
        x += 0.002 * hp(rng.standard_normal(N), 3000)
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
    st.add(squeal * np.sin(np.pi * t / 1.1), t_rw, 0.7)
    # the PLAY key: a sharp plastic click, then the mechanism engaging
    n = int(0.25 * SR)
    t = np.arange(n) / SR
    click = hp(rng.standard_normal(n), 2500) * np.exp(-t / 0.004)
    snap = np.sin(2 * np.pi * 1400 * t) * np.exp(-t / 0.006)
    clunk = lp(rng.standard_normal(n), 1800) * np.exp(-t / 0.02) + np.sin(2 * np.pi * 90 * t) * np.exp(-t / 0.06)
    st.add(click + 0.5 * snap, TL["then"][0] - 0.12, 1.0)
    st.add(clunk, TL["then"][0] - 0.06, 0.7)
    # whoosh as each split screen opens
    for r in TL["reasons"]:
        n = int(0.8 * SR)
        t = np.arange(n) / SR
        w = np.zeros(n)
        noise = rng.standard_normal(n)
        for i in range(0, n, 1024):
            fc = 400 + 3000 * np.sin(np.pi * i / n)
            w[i : i + 1024] = bp(noise[i : i + 1024], fc, fc * 1.8)
        st.add(w * np.sin(np.pi * t / 0.8) ** 2, r["start"] - 0.1, 0.45)
    # phone put down on the nightstand, then the screen lock click
    n = int(0.3 * SR)
    t = np.arange(n) / SR
    thud = lp(rng.standard_normal(n), 900) * np.exp(-t / 0.03) + np.sin(2 * np.pi * 120 * t) * np.exp(-t / 0.05)
    st.add(thud, TL["end"][0] + 1.33, 0.5)
    n = int(0.05 * SR)
    t = np.arange(n) / SR
    st.add(hp(rng.standard_normal(n), 2500) * np.exp(-t / 0.008), 83.3, 0.8)
    return st


if __name__ == "__main__":
    old_stem().write("old", peak=0.55)
    new_stem().write("new")
    sfx_stem().write("sfx", peak=0.8)
