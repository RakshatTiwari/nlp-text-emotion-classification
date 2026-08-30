
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.preprocessing.text import Tokenizer
from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from keras.models import load_model
import numpy as np
import pickle
import re


# Model Path (BiGRU)
model_path = "Artifacts/BiGRU_Model.keras"

# Tokenizer Path
tokenizer_path = "Artifacts/tokenizer.pkl"

# Max Sequence Length
max_sequence_length = 50

# Emotion Labels
emotion_labels = ["sadness", "joy", "love", "anger", "fear", "surprise"]

# Emotion emojis
EMOTION_EMOJIS = {
    "sadness": "😢",
    "joy": "😄",
    "love": "❤️",
    "anger": "😠",
    "fear": "😨",
    "surprise": "😲",
}


# Preprocessing
"""
Clean raw text so it matches the format used while training.
Convert the text to lowercase.
Remove apostrophes (e.g can't -> cant).
Remove Special Characters and Punctuation.
Remove extra spaces.
"""

def preprocess_text(text: str)->str:
    text = text.lower()
    text = re.sub(r"'","",text)
    text = re.sub(r"[^a-z0-9\s]"," ", text)
    text = re.sub(r"\s+", " ",text).strip()
    return text


# Request and Response Schemas
"""
Text Input -> Input schema the text sent by user.
Prediction Response -> Output schema the emotion to predict.
Health Response (Server health check)
"""

class TextInput(BaseModel):
    text : str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="The sentence to analyze",
        json_schema_extra={"example": "I feel so happy and excited"}
        )

class PredictionResponse(BaseModel):
    text: str
    predicted_emotion: str
    confidence : float
    all_probabilites: dict[str, float]

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool

# Model Loading and LifeSpan Management
"""
Load the model and toknizer once the server starts up.
"""

dl_model = {} 

@asynccontextmanager
async def lifespan(app: FastAPI):
    print('Loading the model and tokenizer...')
    dl_model["BiGRU"] = load_model(model_path)     #BiGRU Model
    with open(tokenizer_path, 'rb') as file:
        dl_model["Tokenizer"] = pickle.load(file)
    print('Model are loaded successfully...')   

    yield #Pause, model is laoded and server is running and at this point model waits for the request
    dl_model.clear()
               

# Mount the static files to the FastAPI app
"""
Enable CORS (Cross-Origin Resource Sharing) to allow requests from different origins.
"""

app = FastAPI(
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount('/static', StaticFiles(directory="static"), name="static")


# API Endpoints

# Server UI at homepage ('/')
@app.get('/', include_in_schema=False)
def server_ui():
    return FileResponse('static/index.html')

# Health Check Endpoint ('/health')
@app.get('/health', response_model=HealthResponse)
def health_check():
    return HealthResponse(status="Server is running", model_loaded=bool(dl_model))

# Predict Emotion Endpoint ('/predict')
@app.post('/predict', response_model=PredictionResponse)
def predict_emotion(text_input: TextInput):

    """
    Clean the input sentences.
    Convert the words into numeric using tokenizer.
    Pad the sequences to ensure uniform length.
    Run prediction using the BiGRU model.
    Return the top emotion and full probability breakdown.
    """

    BiGRU_model = dl_model.get("BiGRU")
    tokenizer_model = dl_model.get("Tokenizer")

    if BiGRU_model is None or tokenizer_model is None:
        raise HTTPException(status_code=503, detail="Model is not loaded yet. Please try again later.")

    cleaned_text = preprocess_text(text_input.text)

    tokenized_text = tokenizer_model.texts_to_sequences([cleaned_text])

    padded_sequence = pad_sequences(
        tokenized_text,
        maxlen=max_sequence_length,
        padding="post",
        truncating="post"
    )

    probabilites = BiGRU_model.predict(padded_sequence)[0]

    top_emotion_index = int(np.argmax(probabilites))
    all_probabilites =  {
        label: float(prob) for prob, label in zip(probabilites, emotion_labels)
          
    }

    return PredictionResponse(
        text = text_input.text,
        predicted_emotion = emotion_labels[top_emotion_index],
        confidence = float(probabilites[top_emotion_index]), 
        all_probabilites = all_probabilites
    )