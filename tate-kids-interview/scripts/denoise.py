import sys, numpy as np, soundfile as sf, noisereduce as nr
from scipy.signal import butter, sosfiltfilt
H=4800
def rms_frames(s):
    w = s[: len(s)//H*H].reshape(-1, H); return np.sqrt((w**2).mean(1))
def db(v): return 20*np.log10(v+1e-9)
for n in sys.argv[1:]:
    x, sr = sf.read(f"{n}.raw.wav"); x = x.astype(np.float32)
    x = sosfiltfilt(butter(4, 85, "highpass", fs=sr, output="sos"), x).astype(np.float32)
    r = rms_frames(x)
    quiet = np.where(r <= np.percentile(r, 15))[0]
    noise = np.concatenate([x[i*H:(i+1)*H] for i in quiet])
    y = nr.reduce_noise(y=x, sr=sr, y_noise=noise, stationary=True, prop_decrease=0.95, n_std_thresh_stationary=1.5, n_fft=2048)
    ry = rms_frames(y); loud = r >= np.percentile(r, 80)
    print(f"{n}: noise floor {db(np.percentile(r,10)):.1f} -> {db(np.percentile(ry,10)):.1f} dBFS | speech frames {db(np.median(r[loud])):.1f} -> {db(np.median(ry[loud])):.1f} dBFS")
    sf.write(f"{n}.clean.wav", y.astype(np.float32), sr, subtype="PCM_16")
