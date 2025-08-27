from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse

from src.correction import correction
from src.tts import text_to_wav


app = FastAPI(
    title="Vietnamese NLP API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/correction")
async def correct_text(text: str):
    try:
        corrected = correction(text)
        return {"corrected": corrected}
    except Exception as e:
        return JSONResponse(
            content={"error": str(e)},
            status_code=500
        )


@app.post("/tts")
async def tts_endpoint(text: str = Form(...)):
    try:
        output_path = "assets/output.wav"
        wav_file = text_to_wav(text, output_path)
        return FileResponse(
            wav_file,
            media_type="audio/wav",
            filename="output.wav"
        )
    except Exception as e:
        return JSONResponse(
            content={"error": str(e)},
            status_code=500
        )