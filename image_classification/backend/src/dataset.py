from typing import Dict, List, Tuple

import torch
from torch.utils.data import DataLoader, Dataset
from PIL import Image
from transformers import AutoImageProcessor

from src.utils import load_image_paths, split_train_test


class CatDogDataset(Dataset):
    
    def __init__(self, data_dict: Dict[str, List[str]]):
        self.samples: List[tuple[str, int]] = []
        self.class_names = ["cat", "dog"]
        self.class_to_id = {name: idx for idx, name in enumerate(self.class_names)}

        for class_name, img_paths in data_dict.items():
            label = self.class_to_id[class_name]
            for img_path in img_paths:
                self.samples.append((img_path, label))

    def __len__(self) -> int:
        return len(self.samples)

    def __getitem__(self, idx: int):
        return self.samples[idx] 
    

def collate_fn(batch: list, processor: AutoImageProcessor):
    images = []
    labels = []

    for img_path, label in batch:
        image = Image.open(img_path).convert("RGB")
        images.append(image)
        labels.append(label)

    encoding = processor(images=images, return_tensors="pt")
    pixel_values = encoding["pixel_values"]
    labels = torch.tensor(labels, dtype=torch.long)

    return pixel_values, labels


def load_dataloader(
    root_dir: str,
    processor: AutoImageProcessor,
    batch_size: int = 32,
    train_ratio: float = 0.9,
    seed: int = 42,
    num_workers: int = 2
) -> Tuple[DataLoader, DataLoader]:
    
    data_dict = load_image_paths(root_dir)
    train_dict, val_dict = split_train_test(data_dict, train_ratio, seed)

    train_dataset = CatDogDataset(train_dict)
    val_dataset = CatDogDataset(val_dict)

    train_dataloader = DataLoader(
        train_dataset,
        batch_size=batch_size,
        shuffle=True,
        num_workers=num_workers,
        collate_fn=lambda batch: collate_fn(batch, processor)
    )

    val_dataloader = DataLoader(
        val_dataset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=num_workers,
        collate_fn=lambda batch: collate_fn(batch, processor)
    )

    return train_dataloader, val_dataloader