# 🐶🐱 Image Classification (Dog vs Cat)

An end-to-end **image classification system** for distinguishing cats and dogs, built with a **Vision Transformer (ViT)** backbone from Hugging Face.

This project includes:

* ⚡ **Backend API (FastAPI)** – Single & multi-image prediction
* 🎨 **Frontend (Next.js)** – Upload and visualize classification results
* 🧑‍💻 **Training & Evaluation scripts/notebooks** – Reproducible experiments
* 📦 **Docker/Docker Compose** – Easy local deployment

---

### 📂 Project Structure

```
image_classification/
├── backend/                       # Backend (FastAPI + training scripts)
│   ├── app.py                     # FastAPI server (/predict, /predict-multi)
│   ├── src/
│   │   ├── __init__.py
│   │   ├── dataset.py             # Dataloaders
│   │   ├── model.py               # Model & processor loader
│   │   ├── train.py               # Training loop
│   │   ├── evaluate.py            # Evaluation script
│   │   ├── predict.py             # CLI prediction & CSV export
│   │   └── utils.py               # Helpers (load/save model, logging)
│   ├── models/                    # Trained models / checkpoints (ignored in git)
│   │   └── best_model.pth         # Example trained checkpoint
│   ├── data/                      # Dataset (ignored in git)
│   │   ├── train/                 # Training data (cats/dogs)
│   │   └── test/                  # Test data (cats/dogs)
│   ├── scripts/                   # Shell scripts for training/predict/evaluate
│   │   ├── train.sh
│   │   ├── predict.sh
│   │   └── evaluate.sh
│   ├── notebooks/                 # Jupyter notebooks for experiments
│   │   ├── train.ipynb
│   │   ├── predict.ipynb
│   │   └── evaluate.ipynb
│   ├── .dockerignore
│   ├── requirements.txt           # Python dependencies
│   └── Dockerfile                 # Dockerfile for backend
│
├── frontend/                       # Frontend (Next.js UI)
│   ├── pages/
│   │   └── index.js               # UI (upload & visualize results)
│   ├── components/                # Reusable React components
│   │   ├── UploadForm.js
│   │   └── MultiUpload.js
│   ├── .env.example
│   ├── .dockerignore
│   ├── package.json
│   ├── package-lock.json
│   ├── next.config.js
│   └── Dockerfile                 # Dockerfile for frontend
│
│
├── .gitignore                      # Ignore data/, models/, logs/, node_modules/, etc.
├── README.md                       # Project overview
├── report.md                        # Report / documentation
└── docker-compose.yaml              # Orchestrates backend + frontend

```

---

### 🔧 Requirements

* **Python** 3.10+
* **Node.js** 18+
* *(Optional)* Docker 24+ & Docker Compose v2

---

### 🚀 Quick Start (without Docker)

- **Backend API**

  ```bash
  cd image_classification/backend
  python -m venv .venv && source .venv/bin/activate  # Windows: .venv\Scripts\activate
  pip install -r requirements.txt
  uvicorn app:app --host 0.0.0.0 --port 8000
  ```

- **Frontend UI**

  ```bash
  cd image_classification/frontend
  npm install
  export NEXT_PUBLIC_API_URL=http://localhost:8000  # Windows PowerShell: $env:NEXT_PUBLIC_API_URL="http://localhost:8000"
  npm run dev
  ```

  Open **[http://localhost:3000](http://localhost:3000)** → upload single or multiple images.

---

### 🐳 Run with Docker Compose

```bash
cd image_classification
docker compose up -d --build
```

* Backend → [http://localhost:8000](http://localhost:8000)
* Frontend → [http://localhost:3000](http://localhost:3000)

> `NEXT_PUBLIC_API_URL` is already configured in `docker-compose.yaml`.

---

### 📡 API Endpoints

**POST `/predict`**

* **Form-data**: `file` (single image)
* **Response**:

```json
{ "filename": "cat.jpg", "class_name": "cat", "probability": 0.9876 }
```

**POST `/predict-multi`**

* **Form-data**: `files` (multiple images)
* **Response**:

```json
{ "results": [ { "filename": "1.jpg", "class_name": "dog", "probability": 0.91 } ] }
```

> Default model: `google/vit-base-patch16-224-in21k`
> Classes: `cat` (0), `dog` (1)

---

### 🏋️ Training

`backend/src/train.py` implements the training loop with early stopping. Example:

```bash
cd image_classification/backend
python -m src.train \
  --root_dir ./data/train \
  --batch_size 32 \
  --train_ratio 0.9 \
  --model_name google/vit-base-patch16-224-in21k \
  --num_classes 2 \
  --epochs 10 \
  --lr 1e-4 \
  --save_path models/best_model.pth \
  --log_file logs/training.log
```

* `--root_dir`: folder containing class subfolders (`cat/`, `dog/`)
* Best model checkpoint automatically saved to `--save_path`

---

### 📊 Evaluation

Evaluate model performance on the validation split:

```bash
cd image_classification/backend
python -m src.evaluate \
  --root_dir ./data/train \
  --train_ratio 0.9 \
  --batch_size 32 \
  --model_name google/vit-base-patch16-224-in21k \
  --checkpoint_path models/best_model.pth
```

Outputs: classification report & metrics.

---

### 📑 CLI Prediction (CSV)

Predict on local images and export results:

```bash
cd image_classification/backend
python -m src.predict \
  --model_name google/vit-base-patch16-224-in21k \
  --checkpoint_path models/best_model.pth \
  --images data/test/*.jpg \
  --output_path results/predictions.csv
```

CSV columns → `image_id, predicted_label, confidence`

---

### 📦 Datasets

* Two-class dataset: **cats** & **dogs**
* Split controlled by `--train_ratio`
* Place data under `backend/data/` or pass absolute paths

---

### 📒 Notebooks

Available in `backend/notebooks/`:

* `train.ipynb` – training exploration
* `predict.ipynb` – inference demo
* `evaluate.ipynb` – evaluation

---

### 🛠️ Troubleshooting

* **No GPU** → falls back to CPU automatically
* **HF model download failed** → ensure internet or pre-cache model
* **Large images** → auto-resized by processor, must be RGB
* **Frontend errors (CORS/404)** → check `NEXT_PUBLIC_API_URL` and backend availability