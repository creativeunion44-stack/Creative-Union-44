"""Synthesise a music-box "Happy Birthday" waltz (public-domain melody).

Usage: python3 scripts/make_music.py <seconds> public/music.wav

The tempo is fitted to <seconds>. The tune is played four times, building up: solo music box, then waltz
accompaniment, then a bell counter-melody, then a final pass a whole tone
up that ends on a held chord.
"""

import sys
import wave

import numpy as np

SR = 48000
BEAT = 60 / 112  # recomputed in main() so the 4 passes + final chord fill the video

# (MIDI note, beats). Key of C, 3/4 with a 1-beat pickup.
MELODY = [
    (67, 0.75), (67, 0.25),
    (69, 1), (67, 1), (72, 1), (71, 2),
    (67, 0.75), (67, 0.25),
    (69, 1), (67, 1), (74, 1), (72, 2),
    (67, 0.75), (67, 0.25),
    (79, 1), (76, 1), (72, 1), (71, 1), (69, 2),
    (77, 0.75), (77, 0.25),
    (76, 1), (72, 1), (74, 1), (72, 3),
]
# One chord per bar (root, third, fifth), bars start after the pickup.
CHORDS = [
    (48, 52, 55), (43, 47, 50), (43, 47, 50), (48, 52, 55),
    (48, 52, 55), (41, 45, 48), (43, 47, 50), (48, 52, 55),
]
PICKUP = 1.0
PASS_BEATS = PICKUP + 3 * 8  # pickup + 8 bars


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def tone(m, dur, kind):
    n = int(SR * dur)
    t = np.arange(n) / SR
    f = hz(m)
    if kind == "box":  # music box: bright attack, inharmonic partials
        w = (np.sin(2 * np.pi * f * t)
             + 0.35 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t * 6)
             + 0.18 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 12))
        env = np.exp(-t * 2.6)
    elif kind == "bell":
        w = (np.sin(2 * np.pi * f * t)
             + 0.5 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 4)
             + 0.25 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 8))
        env = np.exp(-t * 1.6)
    elif kind == "pluck":  # soft warm accompaniment
        w = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * f * 2 * t)
        env = np.exp(-t * 4.0)
    else:  # pad
        w = (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 1.003 * t)
             + 0.15 * np.sin(2 * np.pi * f * 2 * t))
        env = np.minimum(1, t / 0.4) * np.minimum(1, (dur - t) / 0.6).clip(0)
    att = np.minimum(1, t / 0.004)
    return w * env * att


def add(buf, start, sig, gain):
    i = int(start * SR)
    j = min(len(buf), i + len(sig))
    if i < len(buf):
        buf[i:j] += sig[: j - i] * gain


def render_pass(buf, t0, shift, layers, last=False):
    t = t0
    for m, b in MELODY:
        dur = b * BEAT
        add(buf, t, tone(m + shift, max(dur, 1.6), "box"), 0.30)
        if "octave" in layers:
            add(buf, t, tone(m + shift + 12, max(dur, 1.2), "box"), 0.09)
        t += dur
    bar0 = t0 + PICKUP * BEAT
    for k, (r, th, fi) in enumerate(CHORDS):
        bs = bar0 + k * 3 * BEAT
        if "waltz" in layers:
            add(buf, bs, tone(r + shift - 12 + 12, 1.2, "pluck"), 0.20)
            for beat in (1, 2):
                for n in (th, fi, r + 12):
                    add(buf, bs + beat * BEAT, tone(n + shift + 12, 0.6, "pluck"), 0.055)
        if "pad" in layers:
            for n in (r, th, fi):
                add(buf, bs, tone(n + shift + 12, 3 * BEAT + 0.3, "pad"), 0.035)
        if "bells" in layers:
            add(buf, bs, tone(r + shift + 36, 2.0, "bell"), 0.06)
            add(buf, bs + 1.5 * BEAT, tone(fi + shift + 24, 1.5, "bell"), 0.04)
    if last:
        end = t0 + PASS_BEATS * BEAT
        r, th, fi = CHORDS[-1]
        for i, n in enumerate((r, fi, r + 12, th + 12, fi + 12, r + 24)):
            add(buf, end + i * 0.07, tone(n + shift + 12, 4.0, "bell"), 0.07)
        for n in (r, th, fi):
            add(buf, end, tone(n + shift + 12, 4.0, "pad"), 0.05)


def main():
    global BEAT
    total = float(sys.argv[1])
    BEAT = (total - 0.6 - 4.2) / (4 * PASS_BEATS)
    out = sys.argv[2]
    buf = np.zeros(int(SR * (total + 6)))
    pass_len = PASS_BEATS * BEAT
    plan = [
        (0, {"pad"}),
        (0, {"waltz"}),
        (0, {"waltz", "bells", "pad"}),
        (2, {"waltz", "bells", "pad", "octave"}),
    ]
    t = 0.6
    for i, (shift, layers) in enumerate(plan):
        render_pass(buf, t, shift, layers, last=i == len(plan) - 1)
        t += pass_len
    # simple stereo widening via short delay + gentle "room"
    left = buf.copy()
    right = np.roll(buf, int(0.011 * SR))
    for d, g in ((0.071, 0.18), (0.113, 0.12), (0.167, 0.08)):
        left += np.roll(buf, int(d * SR)) * g
        right += np.roll(buf, int((d + 0.013) * SR)) * g
    st = np.stack([left, right], axis=1)[: int(SR * total)]
    fade = int(SR * 1.5)
    st[-fade:] *= np.linspace(1, 0, fade)[:, None]
    st /= np.abs(st).max() / 0.85
    with wave.open(out, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((st * 32767).astype(np.int16).tobytes())
    print(f"{60 / BEAT:.1f} bpm, pass length {pass_len:.2f}s, 4 passes end at {t:.2f}s")


if __name__ == "__main__":
    main()
