import argparse
import numpy as np
from scipy.io.wavfile import write as write_wav

import vietTTS.nat.text2mel as t2m
from vietTTS import nat_normalize_text
from vietTTS.hifigan.mel2wave import mel2wave
from vietTTS.nat.text2mel import text2mel


def load_lexicon_utf8(fn):
    with open(fn, "r", encoding="utf-8") as f:   # ép UTF-8
        lines = f.readlines()
    lines = [l.lower().strip().split("\t") for l in lines]
    return dict(lines)


def text_to_speech(text):
    t2m.load_lexicon = load_lexicon_utf8
    text = nat_normalize_text(text)
    mel = text2mel(
        text,
        "./assets/lexicon.txt",
        0.2,
        "./assets/acoustic_ckpt.pickle",
        "./assets/duration_ckpt.pickle",
    )
    wave = mel2wave(mel, "./assets/config.json", "./assets/hk_hifi.pickle")
    return (wave * (2**15)).astype(np.int16)


def text_to_wav(text, wav_path="output.wav", batch_size=500):
    text_batches = [text[i:i+batch_size] for i in range(0, len(text), batch_size)]
    all_wave = np.array([], dtype=np.int16)

    for batch in text_batches:
        wave_int16 = text_to_speech(batch)
        all_wave = np.concatenate((all_wave, wave_int16))
    
    write_wav(wav_path, 16000, all_wave)
    print(f"WAV file created: {wav_path}")
    return wav_path


def parse_args():
    parser = argparse.ArgumentParser(description="Vietnamese Text-to-Speech using vietTTS")
    parser.add_argument("-i", "--input", type=str, required=True, help="Input text string")
    parser.add_argument("-o", "--output", type=str, default="output.wav", help="Output WAV file path (default: output.wav)")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()
    text_to_wav(args.input, args.output)