"""Fit the uploaded old song to the edit: public/music/old-song.mp3.

The source (source-audio/old-song-original.ogg) is a mono phone recording,
about 1:35, near-silent for its first 4.5 s. This skips that, normalises
loudness to about -16 LUFS, and places the song so it starts at 10 s (the
first 1983 shot). The edit only lets it be heard over the past
(src/timeline.ts), so the song simply runs on underneath.

Usage: python3 scripts/prepare_song.py   (needs ffmpeg)
"""

import json
import subprocess
import tempfile
from pathlib import Path

import numpy as np
from scipy.io import wavfile

ROOT = Path(__file__).resolve().parent.parent
TL = json.loads((ROOT / "src" / "timeline.json").read_text())
SRC = ROOT / "source-audio" / "old-song-original.ogg"
OUT = ROOT / "public" / "music" / "old-song.mp3"

SKIP = 4.5  # seconds of near-silence at the start of the recording
START = TL["then"][0]
TOTAL = TL["duration"] + 1.0

with tempfile.TemporaryDirectory() as tmp:
    norm = Path(tmp) / "norm.wav"
    aligned = Path(tmp) / "aligned.wav"
    subprocess.run(
        ["ffmpeg", "-loglevel", "error", "-y", "-i", SRC, "-ac", "1", "-ar", "44100",
         "-af", "highpass=f=60,loudnorm=I=-16:TP=-1.5:LRA=11", norm],
        check=True,
    )
    sr, x = wavfile.read(norm)
    seg = x.astype(float)[int(SKIP * sr):] / 32768
    fade = int(0.8 * sr)
    seg[:fade] *= np.linspace(0, 1, fade)
    out = np.zeros(int(TOTAL * sr))
    i = int(START * sr)
    n = min(len(seg), len(out) - i)
    out[i : i + n] = seg[:n]
    wavfile.write(aligned, sr, (np.stack([out, out], 1) * 32767).astype(np.int16))
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", aligned, "-b:a", "192k", OUT], check=True)
    print("wrote", OUT)
