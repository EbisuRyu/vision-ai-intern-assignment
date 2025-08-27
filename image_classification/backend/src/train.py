import argparse
from typing import Dict, List, Tuple

import torch
import torch.nn as nn
from torch.optim import Adam, Optimizer
from torch.utils.data import DataLoader
from tqdm import tqdm

from src.dataset import load_dataloader
from src.model import load_processor_and_model
from src.utils import save_model, setup_logger


def eval_model(
    model: nn.Module,
    val_dataloader: DataLoader,
    criterion: nn.Module,
    device: str = "cuda"
) -> float:
    
    model.eval()
    val_loss = 0.0
    total_batches = 0

    with torch.no_grad():
        for inputs, labels in tqdm(val_dataloader, desc="Evaluating", unit="batch"):
            inputs, labels = inputs.to(device), labels.to(device)
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            val_loss += loss.item()
            total_batches += 1

    avg_val_loss = val_loss / total_batches if total_batches > 0 else float("inf")
    return avg_val_loss


def train_model(
    model: nn.Module,
    optimizer: Optimizer,
    criterion: nn.Module,
    train_dataloader: DataLoader,
    val_dataloader: DataLoader,
    num_epochs: int = 10,
    device: str = "cuda",
    min_loss_threshold: float = 0.01,
    log_file: str = "training.log"
) -> Tuple[nn.Module, Dict[str, List[float]]]:
    
    logger = setup_logger(log_file)

    best_val_loss = float("inf")
    best_model_state = None
    history: Dict[str, List[float]] = {"train_loss": [], "val_loss": []}

    model.to(device)
    for epoch in range(num_epochs):
        model.train()
        running_loss = 0.0

        pbar = tqdm(train_dataloader, desc=f"Epoch {epoch+1}/{num_epochs}", unit="batch")
        for inputs, labels in pbar:
            inputs, labels = inputs.to(device), labels.to(device)

            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item()
            pbar.set_postfix({"batch_loss": loss.item()})

        avg_train_loss = running_loss / len(train_dataloader)
        avg_val_loss = eval_model(model, val_dataloader, criterion, device)

        history["train_loss"].append(avg_train_loss)
        history["val_loss"].append(avg_val_loss)

        logger.info(
            f"[Epoch {epoch+1}/{num_epochs}] "
            f"Train Loss: {avg_train_loss:.4f} | Val Loss: {avg_val_loss:.4f}"
        )

        if avg_val_loss < best_val_loss:
            best_val_loss = avg_val_loss
            best_model_state = model.state_dict()
            logger.info(
                f"✅ New best model saved at Epoch {epoch+1} "
                f"with Val Loss: {best_val_loss:.4f}"
            )

        if (avg_val_loss < min_loss_threshold) and (avg_train_loss < min_loss_threshold):
            logger.info(
                f"🛑 Early stopping at Epoch {epoch+1}: "
                f"Val Loss {avg_val_loss:.4f} and Train Loss {avg_train_loss:.4f} "
                f"< Threshold {min_loss_threshold}"
            )
            break

    if best_model_state is not None:
        model.load_state_dict(best_model_state)
        logger.info("🔄 Loaded best model from training.")

    return model, history


def parse_args():
    
    parser = argparse.ArgumentParser(description="Train a model for cat-vs-dog classification.")

    parser.add_argument("--root_dir", type=str, required=True, help="Path to dataset root directory")
    parser.add_argument("--batch_size", type=int, default=32, help="Batch size for training and validation")
    parser.add_argument("--train_ratio", type=float, default=0.9, help="Ratio of data used for training")
    parser.add_argument("--num_workers", type=int, default=0, help="Number of workers for DataLoader")
    parser.add_argument("--model_name", type=str, default="google/vit-base-patch16-224-in21k", help="Model name or path (e.g., Hugging Face model checkpoint)")
    parser.add_argument("--num_classes", type=int, default=2, help="Number of output classes")
    parser.add_argument("--lr", type=float, default=1e-4, help="Learning rate for optimizer")
    parser.add_argument("--weight_decay", type=float, default=0.0, help="Weight decay for optimizer")
    parser.add_argument("--epochs", type=int, default=10, help="Number of training epochs")
    parser.add_argument("--min_loss_threshold", type=float, default=0.01, help="Early stopping threshold for loss")
    parser.add_argument("--log_file", type=str, default="training.log", help="Path to log file")
    parser.add_argument("--save_path", type=str, default="best_model.pth", help="Path to save the best model")

    return parser.parse_args()


if __name__ == "__main__":
    
    args = parse_args()
    device = "cuda" if torch.cuda.is_available() else "cpu"

    processor, model = load_processor_and_model(
        model_name=args.model_name,
        num_classes=args.num_classes
    )
    
    optimizer = Adam(model.parameters(), lr=args.lr, weight_decay=args.weight_decay)
    criterion = nn.CrossEntropyLoss()

    train_dataloader, val_dataloader = load_dataloader(
        root_dir=args.root_dir,
        processor=processor,
        batch_size=args.batch_size,
        train_ratio=args.train_ratio,
        seed=42,
        num_workers=args.num_workers
    )

    model, history = train_model(
        model=model,
        optimizer=optimizer,
        criterion=criterion,
        train_dataloader=train_dataloader,
        val_dataloader=val_dataloader,
        num_epochs=args.epochs,
        device=device,
        min_loss_threshold=args.min_loss_threshold,
        log_file=args.log_file
    )

    save_model(
        model=model,
        optimizer=None,
        history=history,
        path=args.save_path
    )
