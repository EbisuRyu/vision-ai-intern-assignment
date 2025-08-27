import argparse
from typing import List

import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from sklearn.metrics import classification_report
from tqdm import tqdm
from transformers import AutoImageProcessor

from src.dataset import load_dataloader
from src.utils import load_model


def evaluate(
    model: nn.Module,
    dataloader: DataLoader,
    class_names: List[str],
    device: str = "cuda"
) -> None:
    model.eval()
    y_true, y_pred = [], []

    with torch.no_grad():
        for inputs, labels in tqdm(dataloader, desc="Evaluating", unit="batch"):
            inputs, labels = inputs.to(device), labels.to(device)
            outputs = model(inputs)
            _, preds = torch.max(outputs, dim=1)

            y_true.extend(labels.cpu().numpy())
            y_pred.extend(preds.cpu().numpy())

    # In classification report
    report = classification_report(y_true, y_pred, target_names=class_names, digits=4)
    print("\n📊 Classification Report:")
    print(report)


def parse_args():
    parser = argparse.ArgumentParser(
        description="Evaluate a trained model on validation/test set."
    )

    parser.add_argument("--root_dir", type=str, required=True, help="Path to dataset root directory")
    parser.add_argument("--train_ratio", type=float, default=0.9, help="Ratio of data used for training (rest is validation/test)")
    parser.add_argument("--batch_size", type=int, default=32, help="Batch size for evaluation")
    parser.add_argument("--num_workers", type=int, default=0,help="Number of workers for DataLoader")

    parser.add_argument("--model_name", type=str, default="google/vit-base-patch16-224-in21k", help="Model name or path (e.g., Hugging Face model checkpoint)")
    parser.add_argument("--num_classes", type=int, default=2, help="Number of output classes")
    parser.add_argument("--checkpoint_path", type=str, required=True, help="Path to the trained model checkpoint (.pth)")

    parser.add_argument("--device", type=str, choices=["cpu", "cuda"], default=None, help="Device to use for evaluation (default: auto-detect)")

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

    train_dataloader, val_dataloader = load_dataloader(
        root_dir=args.root_dir,
        processor=processor,
        batch_size=args.batch_size,
        train_ratio=args.train_ratio,
        seed=42,
        num_workers=args.num_workers,
    )

    evaluate(
        model=model,
        dataloader=val_dataloader,
        class_names=["cat", "dog"],
        device=device,
    )