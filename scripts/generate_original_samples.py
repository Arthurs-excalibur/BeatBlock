"""Generate short, deterministic BeatBlock drum samples from original equations.

No external recordings, sample packs, or third-party audio are read by this script.
"""
from __future__ import annotations

import math
import random
import struct
import wave
from pathlib import Path

RATE = 22050
OUT = Path(__file__).resolve().parents[1] / "public" / "samples"

# filename: (voice, seconds, deterministic seed, brighter/acoustic-inspired)
CLIPS = {
    "lofi-kick.wav": ("kick", 0.48, 101, False),
    "lofi-snare.wav": ("snare", 0.32, 102, False),
    "lofi-hat-closed.wav": ("closed_hat", 0.105, 103, False),
    "lofi-hat-open.wav": ("open_hat", 0.38, 104, False),
    "studio-kick.wav": ("kick", 0.42, 201, True),
    "studio-snare.wav": ("snare", 0.29, 202, True),
    "studio-hat-closed.wav": ("closed_hat", 0.09, 203, True),
    "studio-hat-open.wav": ("open_hat", 0.32, 204, True),
}


def render(voice: str, duration: float, seed: int, bright: bool) -> list[float]:
    rng = random.Random(seed)
    count = int(RATE * duration)
    values: list[float] = []
    smooth = 0.0
    for i in range(count):
        t = i / RATE
        noise = rng.uniform(-1.0, 1.0)
        smooth = 0.76 * smooth + 0.24 * noise
        if voice == "kick":
            low, high, sweep = ((48.0, 155.0, 0.035) if bright else (43.0, 125.0, 0.052))
            phase = 2 * math.pi * (low * t + (high - low) * sweep * (1 - math.exp(-t / sweep)))
            body = math.sin(phase) * math.exp(-t / (0.16 if bright else 0.24))
            click = (0.12 if bright else 0.07) * noise * math.exp(-t / 0.003)
            value = 0.88 * body + click
        elif voice == "snare":
            body_freq = 195.0 if bright else 168.0
            body = math.sin(2 * math.pi * body_freq * t) * math.exp(-t / 0.075)
            texture = (noise - smooth * (0.35 if bright else 0.12)) * math.exp(-t / (0.085 if bright else 0.13))
            value = (0.34 if bright else 0.26) * body + (0.60 if bright else 0.48) * texture
        else:
            decay = (0.055 if bright else 0.075) if voice == "closed_hat" else (0.25 if bright else 0.31)
            metallic = sum(math.sin(2 * math.pi * f * t) for f in (4100, 5630, 7350, 9120, 10870)) / 5
            envelope = math.exp(-t / decay)
            value = envelope * ((0.24 if bright else 0.18) * metallic + 0.27 * (noise - smooth))
        values.append(value)

    peak = max((abs(value) for value in values), default=1.0) or 1.0
    return [max(-0.98, min(0.98, value / peak * 0.82)) for value in values]


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for filename, (voice, duration, seed, bright) in CLIPS.items():
        pcm = render(voice, duration, seed, bright)
        path = OUT / filename
        with wave.open(str(path), "wb") as wav:
            wav.setnchannels(1)
            wav.setsampwidth(2)
            wav.setframerate(RATE)
            wav.writeframes(b"".join(struct.pack("<h", int(sample * 32767)) for sample in pcm))
        print(f"{path.relative_to(OUT.parent.parent)}: {len(pcm)} frames, {duration:.3f}s")


if __name__ == "__main__":
    main()
