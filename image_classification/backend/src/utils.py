import sys
import os
import glob
import random
import logging
from typing import Dict, List, Tuple, Optional

import torch
import torch.nn as nn
from torch.optim import Optimizer

from src.model import ImageClassifier


def setup_logger(log_file: str = "training.log"):
    logger = logging.getLogger("logger")
    logger.setLevel(logging.INFO)

    if logger.hasHandlers():
        logger.handlers.clear()

    file_handler = logging.FileHandler(log_file, encoding="utf-8")
    file_handler.setLevel(logging.INFO)

    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)

    formatter = logging.Formatter(
        "[%(asctime)s] %(levelname)s - %(message)s",
        "%Y-%m-%d %H:%M:%S"
    )
    file_handler.setFormatter(formatter)
    console_handler.setFormatter(formatter)

    logger.addHandler(file_handler)
    logger.addHandler(console_handler)

    return logger


def split_train_test(
    data_dict: Dict[str, List[str]],
    train_ratio: float = 0.8,
    seed: int = 42
) -> Tuple[Dict[str, List[str]], Dict[str, List[str]]]:


    random.seed(seed)
    train_dict, test_dict = {}, {}

    for class_name, paths in data_dict.items():
        shuffled = paths.copy()
        random.shuffle(shuffled)

        n_total = len(shuffled)
        n_train = int(n_total * train_ratio)

        train_dict[class_name] = shuffled[:n_train]
        test_dict[class_name] = shuffled[n_train:]

    return train_dict, test_dict


def load_image_paths(root_dir: str) -> Dict[str, List[str]]:
    
    data_dict: Dict[str, List[str]] = {"dog": [], "cat": []}

    image_paths = glob.glob(os.path.join(root_dir, "*.jpg")) + \
                  glob.glob(os.path.join(root_dir, "*.jpeg")) + \
                  glob.glob(os.path.join(root_dir, "*.png"))

    for path in sorted(image_paths):
        filename = os.path.basename(path).lower()
        if filename.startswith("dog"):
            data_dict["dog"].append(path)
        elif filename.startswith("cat"):
            data_dict["cat"].append(path)

    return data_dict


def save_model(
    model: nn.Module,
    optimizer: Optional[Optimizer],
    history: Dict[str, List[float]],
    path: str = "model_checkpoint.pth"
) -> None:
    
    checkpoint = {
        "model_state_dict": model.state_dict(),
        "history": history
    }
    if optimizer is not None:
        checkpoint["optimizer_state_dict"] = optimizer.state_dict()
    
    torch.save(checkpoint, path)
    print(f"✅ Model saved successfully at {path}")
    
    
def load_model(
    checkpoint_path: str,
    optimizer: Optional[Optimizer] = None,
    model_kwargs: Optional[Dict] = None,
    device: str = "cpu"
) -> Tuple[nn.Module, Optional[Optimizer], Dict]:
    
    if model_kwargs is None:
        model_kwargs = {}

    model = ImageClassifier(**model_kwargs)
    checkpoint = torch.load(checkpoint_path, map_location=device)

    model.load_state_dict(checkpoint["model_state_dict"])
    model.to(device)
    
    if optimizer is not None and "optimizer_state_dict" in checkpoint:
        optimizer.load_state_dict(checkpoint["optimizer_state_dict"])

    history = checkpoint.get("history", {})
    print(f"✅ Model loaded successfully from {checkpoint_path}")

    return model, optimizer, history