import os
import csv
import argparse
from typing import List, Tuple, Union

from PIL import Image
import torch
import torch.nn as nn
from transformers import AutoImageProcessor

from src.utils import load_model


def predict(
    model: nn.Module,
    processor: AutoImageProcessor,
    images: List[Union[str, Image.Image]],
    device: str = "cpu"
) -> List[Tuple[str, str, float]]:

    model.eval()
    model.to(device)
    predictions = []

    class_map = {0: "cat", 1: "dog"}

    with torch.no_grad():
        for img in images:
            if isinstance(img, str):
                image_id = img
                image = Image.open(img).convert("RGB")
            else: 
                image_id = "<PIL.Image>"
                image = img.convert("RGB")

            encoding = processor(images=[image], return_tensors="pt")
            inputs = encoding["pixel_values"].to(device)

            logits = model(inputs)
            probs = torch.softmax(logits, dim=-1)
            pred_class = torch.argmax(probs, dim=-1).item()
            pred_prob = probs[0, pred_class].item()

            predictions.append((image_id, class_map[pred_class], pred_prob))

    return predictions


def save_predictions(predictions: List[Tuple[str, str, float]], output_path: str):
    """Save predictions to a CSV file, create folder if needed."""
    os.makedirs(os.path.dirname(output_path), exist_ok=True)  # tạo folder nếu chưa có

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["image_id", "predicted_label", "confidence"])
        for image_id, label, prob in predictions:
            writer.writerow([image_id, label, f"{prob:.4f}"])
    print(f"✅ Predictions saved to {output_path}")


def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description="Image classification prediction script")
    parser.add_argument("--model_name", type=str, required=True, help="Pretrained model name (e.g. google/vit-base-patch16-224)")
    parser.add_argument("--checkpoint_path", type=str, required=True, help="Path to model checkpoint (.pt)")
    parser.add_argument("--num_classes", type=int, required=True, help="Number of classes in the model")
    parser.add_argument("--device", type=str, default=None, help="Device: cpu or cuda")
    parser.add_argument("--images", type=str, nargs="+", required=True, help="List of image paths to predict")
    parser.add_argument("--output_path", type=str, default="predictions.csv", help="Path to save predictions (CSV file)")
    return parser.parse_args()


if __name__ == "__main__":
    args = parse_args()

    device = args.device or ("cuda" if torch.cuda.is_available() else "cpu")

    processor = AutoImageProcessor.from_pretrained(args.model_name)
    model, _, _ = load_model(
        checkpoint_path=args.checkpoint_path,
        optimizer=None,
        model_kwargs={"model_name": args.model_name, "num_classes": args.num_classes},
        device=device,
    )

    predictions = predict(
        model=model,
        processor=processor,
        images=args.images,
        device=device
    )

    save_predictions(predictions, args.output_path)