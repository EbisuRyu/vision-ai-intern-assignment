from typing import Tuple

import torch
import torch.nn as nn
from transformers import ViTModel, AutoImageProcessor


class ImageClassifier(nn.Module):
    def __init__(
        self, 
        model_name: str = "google/vit-base-patch16-224-in21k", 
        num_classes: int = 2
    ) -> None:
        super(ImageClassifier, self).__init__()

        self.vit: ViTModel = ViTModel.from_pretrained(model_name)
        self.embedding_dim: int = self.vit.config.hidden_size

        self.classifier: nn.Sequential = nn.Sequential(
            nn.Linear(self.embedding_dim, 256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, num_classes)
        )

    def forward(self, pixel_values: torch.Tensor) -> torch.Tensor:
        outputs = self.vit(pixel_values=pixel_values)
        cls_embedding = outputs.last_hidden_state[:, 0, :]  # [CLS] token
        logits: torch.Tensor = self.classifier(cls_embedding)
        return logits


def load_processor_and_model(
    model_name: str = "google/vit-base-patch16-224-in21k",
    num_classes: int = 2
) -> Tuple[AutoImageProcessor, ImageClassifier]:

    processor: AutoImageProcessor = AutoImageProcessor.from_pretrained(model_name)
    model: ImageClassifier = ImageClassifier(model_name=model_name, num_classes=num_classes)
    return processor, model