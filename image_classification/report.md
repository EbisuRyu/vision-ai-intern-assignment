# Dog vs Cat Image Classification Report

This report summarizes my solution for the AI intern assignment at [Golden Owl](https://goldenowl.asia), where the task is to build a simple **image classification model** to distinguish between dog and cat images.


## 1. Problem Statement

The goal of this assignment is to classify input images as either **dog** or **cat**. The input is a single image or a batch of images, and the output is the predicted class with its probability.

**Example input/output:**

<img width="400" alt="Screen Shot 2023-06-30 at 10 28 22" src="https://github.com/go-julian/vision-ai-intern-assignment/assets/130023825/c6ca46dc-8fdc-496c-b804-e540c536abf7">


## 2. Dataset

I used the **Dogs vs Cats dataset** from [Kaggle](https://www.kaggle.com/competitions/dogs-vs-cats), which contains:

* **Training images:** 25,000 images (cats and dogs)
* **Test images:** 12,500 images

The dataset was split into **training** and **validation** subsets with a ratio of 90:10.

All images were preprocessed to:

* Resize to 224×224 pixels
* Normalize according to the ViT pre-trained model requirements
* Convert to RGB format

## 3. Model Architecture

I implemented a **Vision Transformer (ViT) based classifier** using Hugging Face’s `ViTModel`:

```python
class ImageClassifier(nn.Module):
    def __init__(self, model_name="google/vit-base-patch16-224-in21k", num_classes=2):
        super().__init__()
        self.vit = ViTModel.from_pretrained(model_name)
        self.embedding_dim = self.vit.config.hidden_size
        self.classifier = nn.Sequential(
            nn.Linear(self.embedding_dim, 256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, num_classes)
        )

    def forward(self, pixel_values):
        outputs = self.vit(pixel_values=pixel_values)
        cls_embedding = outputs.last_hidden_state[:, 0, :]
        logits = self.classifier(cls_embedding)
        return logits
```

**Highlights:**

* The pre-trained **ViT backbone** extracts rich image embeddings.
* A small **MLP head** maps embeddings to 2 classes.
* Dropout added to reduce overfitting.


## 4. Training Setup

Training was performed with the following settings:

| Parameter         | Value                             |
| ----------------- | --------------------------------- |
| Batch size        | 32                                |
| Epochs            | 10                                |
| Learning rate     | 1e-4                              |
| Optimizer         | Adam                              |
| Loss function     | CrossEntropyLoss                  |
| Pre-trained model | google/vit-base-patch16-224-in21k |

**Hardware:** GPU-enabled environment

The training loop included:

* Forward pass → compute logits
* Loss computation → `CrossEntropyLoss`
* Backward pass → optimizer step
* Validation after each epoch
* Early stopping based on validation loss

## 5. Results

The trained model achieved:

* **Training accuracy:** \~99%
* **Validation accuracy:** \~98%
* **Observations:** The model generalizes well, but occasionally misclassifies images with unusual poses or backgrounds.

## 6. Pipeline

The complete inference pipeline is:

1. Load input image(s)
2. Resize & normalize to match ViT input
3. Convert to tensor and batch
4. Forward pass through ViT + MLP head
5. Apply softmax → class probabilities
6. Output predicted label and confidence

This is implemented in **`backend/src/predict.py`** and exposed via **FastAPI** endpoints:

* `/predict` → single image
* `/predict-multi` → multiple images

## 7. Remaining Challenges

* **Small misclassification rate** on edge cases (e.g., blurred images or unusual angles)
* **Dataset imbalance** may slightly bias the model
* **Large model size** → ViT model is heavy for low-resource devices


## 8. Ideas for Improvement

* Use **data augmentation** (rotation, flip, color jitter) to improve generalization
* Experiment with **lighter ViT variants** for faster inference
* Fine-tune on **additional datasets** to handle rare cases
* Implement **confidence thresholding** for uncertain predictions

## 9. How to Run

Refer to **README.md** for instructions to:

* Install dependencies
* Train the model
* Run FastAPI backend
* Run Next.js frontend
* Make predictions