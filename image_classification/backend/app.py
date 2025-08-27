import io
from typing import List, Tuple
from functools import lru_cache

from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from transformers import AutoImageProcessor
from PIL import Image

from src.utils import load_model, setup_logger
from src.predict import predict


logger = setup_logger("logs/app.log")


@lru_cache()
def get_model_bundle() -> Tuple[object, object]:
    try:
        processor = AutoImageProcessor.from_pretrained("google/vit-base-patch16-224-in21k")
        model, _, _ = load_model(
            checkpoint_path="./models/best_model.pth",
            optimizer=None,
            model_kwargs={
                "model_name": "google/vit-base-patch16-224-in21k", 
                "num_classes": 2
            },
            device="cpu",
        )
        logger.info("✅ Model and processor loaded successfully.")
        return model, processor
    except Exception as e:
        logger.error(f"❌ Failed to load model: {e}")
        raise RuntimeError("Could not initialize model.") from e


app = FastAPI(title="Image Classification API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/predict", response_class=JSONResponse)
async def predict_image(
    file: UploadFile = File(...),
    model_bundle: Tuple[object, object] = Depends(get_model_bundle)
):
    model, processor = model_bundle
    try:
        contents: bytes = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")

        results = predict(model, processor, [image], device='cpu')
        _, pred_class, pred_prob = results[0]

        return {
            "filename": file.filename,
            "class_name": pred_class,
            "probability": round(pred_prob, 4)
        }
    except Exception as e:
        logger.exception("Prediction failed")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict-multi", response_class=JSONResponse)
async def predict_images(
    files: List[UploadFile] = File(...),
    model_bundle: Tuple[object, object] = Depends(get_model_bundle)
):
    model, processor = model_bundle
    try:
        images, filenames = [], []
        for file in files:
            contents = await file.read()
            img = Image.open(io.BytesIO(contents)).convert("RGB")
            images.append(img)
            filenames.append(file.filename)

        results = predict(model, processor, images, device="cpu")

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