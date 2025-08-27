import argparse
from transformers import pipeline

corrector = pipeline("text2text-generation", model="bmd1905/vietnamese-correction")


def correction(text: str) -> str:
    if len(text) <= 256:
        preds = corrector(text, max_length=256)
        return preds[0]["generated_text"]
    else:
        chunks = [text[i:i+256] for i in range(0, len(text), 256)]
        corrected_chunks = []
        for chunk in chunks:
            preds = corrector(chunk, max_length=256)
            corrected_chunks.append(preds[0]["generated_text"])
        return " ".join(corrected_chunks)


def parse_args():
    parser = argparse.ArgumentParser(description="Vietnamese text correction using Hugging Face model")
    parser.add_argument("-i", "--input", type=str, required=True, help="Input text (string)")
    parser.add_argument("-o", "--output", type=str, default=None, help="Optional output file path to save corrected text")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()

    text = args.input
    corrected = correction(text)

    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(corrected + "\n")
        print(f"✅ Corrected text saved to {args.output}")
    else:
        print(corrected)
