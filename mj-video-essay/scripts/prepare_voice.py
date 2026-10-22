"""Fit the recorded voice-over to the edit.

source-audio/voiceover-original.ogg holds the 17 script lines read one
after another with pauses. For each line this cuts it out of the
recording, shortens long pauses inside it, cleans it up (high-pass, noise
reduction, gentle compression), speeds it up a little only if it would
not fit its slot, and places it on the video timeline.

Writes public/music/voice.mp3 (the full-length voice track) and
src/voice.json (when the voice speaks, so the music can dip under it).

Usage: python3 scripts/prepare_voice.py   (needs ffmpeg)
"""

import json
import subprocess
import tempfile
from pathlib import Path

import numpy as np
from scipy.io import wavfile

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "source-audio" / "voiceover-original.ogg"
OUT = ROOT / "public" / "music" / "voice.mp3"
MARKS = ROOT / "src" / "voice.json"
TL = json.loads((ROOT / "src" / "timeline.json").read_text())
SR = 44100

# (line text, where it is in the recording [s], where it starts in the video [s])
LINES = [
    ("Every day, there's a new star.", (0.0, 2.86), 0.5),
    ("A week later... nobody remembers them.", (4.22, 8.10), 4.7),
    ("Back then, things were different.", (9.97, 13.73), 10.5),
    ("The whole world watched Michael Jackson.", (15.43, 18.85), 14.0),
    ("Thriller became the best-selling album ever.", (20.46, 24.65), 17.6),
    ("So why can't anyone be that famous today?", (26.15, 30.78), 21.9),
    ("Back then, there were only a few TV channels for the whole planet.", (32.70, 39.36), 26.4),
    ("Now, everyone has their own feed.", (41.31, 44.87), 31.6),
    ("Back then, there were only a handful of stars.", (46.95, 50.97), 38.6),
    ("Now, thousands of new songs come out every day.", (52.36, 58.40), 43.1),
    ("A hit could play for years.", (59.57, 62.31), 50.1),
    ("Now, a trend lasts only a few days.", (63.69, 67.69), 54.6),
    ("So who is the biggest star right now?", (69.12, 72.94), 60.2),
    ("There's no single answer.", (73.95, 76.30), 71.3),
    ("Fame has become niche.", (77.96, 80.08), 75.5),
    ("Millions of fans... but never the whole world at once.", (81.61, 86.91), 79.3),
    ("Who is the Michael Jackson of your generation? Tell us in the comments.", (88.80, 94.97), 84.0),
]


def run(*args):
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", *args], check=True)


def duration(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path],
        capture_output=True,
        text=True,
        check=True,
    )
    return float(out.stdout)


def main():
    total = TL["duration"] + 1.0
    track = np.zeros(int(total * SR))
    marks = []
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        for i, (text, (a, b), start) in enumerate(LINES):
            nxt = LINES[i + 1][2] if i + 1 < len(LINES) else TL["duration"] - 0.3
            slot = nxt - start - 0.25
            clean = tmp / f"l{i}.wav"
            run(
                "-ss", str(max(0, a - 0.05)), "-to", str(b + 0.1), "-i", SRC,
                "-af",
                "highpass=f=85,afftdn=nf=-30,"
                "silenceremove=start_periods=1:start_threshold=-42dB:"
                "stop_periods=-1:stop_duration=0.3:stop_threshold=-42dB,"
                "acompressor=threshold=-20dB:ratio=3:attack=5:release=120",
                "-ac", "1", "-ar", str(SR), clean,
            )
            d = duration(clean)
            rate = 1.0
            if d > slot:
                rate = min(1.25, d / slot)
                fast = tmp / f"f{i}.wav"
                run("-i", clean, "-af", f"atempo={rate:.3f}", fast)
                clean = fast
                d = duration(clean)
            _, x = wavfile.read(clean)
            x = x.astype(float) / 32768
            fade = int(0.02 * SR)
            x[:fade] *= np.linspace(0, 1, fade)
            x[-fade:] *= np.linspace(1, 0, fade)
            j = int(start * SR)
            n = min(len(x), len(track) - j)
            track[j : j + n] += x[:n]
            marks.append({"from": round(start, 2), "to": round(start + d, 2), "text": text})
            print(f"{i + 1:2d} {start:5.1f}-{start + d:5.1f}s  x{rate:.2f}  {text}")
        wav = tmp / "voice.wav"
        wavfile.write(wav, SR, (np.clip(track, -1, 1) * 32767).astype(np.int16))
        run("-i", wav, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", str(SR), "-ac", "2", "-b:a", "192k", OUT)
    MARKS.write_text(json.dumps(marks, indent=2, ensure_ascii=False) + "\n")
    print("wrote", OUT, "and", MARKS)


if __name__ == "__main__":
    main()
