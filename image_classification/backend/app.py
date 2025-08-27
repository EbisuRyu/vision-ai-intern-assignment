import os
import io
from typing import List
from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.concurrency import run_in_threadpool
from transformers import AutoImageProcessor
from PIL import Image

from src.utils import load_model, setup_logger
from src.predict import predict


logger = setup_logger("logs/app.log")


MODEL = None
PROCESSOR = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global MODEL, PROCESSOR
    try:
        logger.info("Loading processor...")
        PROCESSOR = AutoImageProcessor.from_pretrained("google/vit-base-patch16-224-in21k")
        logger.info("Loading model...")
        MODEL, _, _ = load_model(
            checkpoint_path="./models/best_model.pth",
            optimizer=None,
            model_kwargs={"model_name": "google/vit-base-patch16-224-in21k", "num_classes": 2},
            device="cpu"
        )
        logger.info("✅ Model and processor loaded successfully.")
        yield
    finally:
        logger.info("Shutting down app and releasing resources if needed.")


app = FastAPI(title="Image Classification API", version="1.0", lifespan=lifespan)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# Single image prediction
@app.post("/predict", response_class=JSONResponse)
async def predict_image(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")

        results = await run_in_threadpool(predict, MODEL, PROCESSOR, [image], device="cpu")
        _, pred_class, pred_prob = results[0]

        return {"filename": file.filename, "class_name": pred_class, "probability": round(pred_prob, 4)}

    except Exception as e:
        logger.exception("Prediction failed")
        raise HTTPException(status_code=500, detail=str(e))


# Batch prediction
@app.post("/predict-multi", response_class=JSONResponse)
async def predict_images(files: List[UploadFile] = File(...)):
    try:
        images, filenames = [], []
        for file in files:
            contents = await file.read()
            img = Image.open(io.BytesIO(contents)).convert("RGB")
            images.append(img)
            filenames.append(file.filename)

        results = await run_in_threadpool(predict, MODEL, PROCESSOR, images, device="cpu")

        response = []
        for fname, (_, pred_class, pred_prob) in zip(filenames, results):
            response.append({
                "filename": fname,
                "class_name": pred_class,
                "probability": round(pred_prob, 4)
            })

        return {"results": response}

    except Exception as e:
        logger.exception("Batch prediction failed")
        raise HTTPException(status_code=500, detail=str(e))