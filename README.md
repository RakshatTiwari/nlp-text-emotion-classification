<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0B0C0D,100:1B1D22&height=200&section=header&text=AFFECT&fontSize=72&fontColor=FFB000&animation=fadeIn&fontAlignY=38&desc=Text%20Emotion%20Classifier%20%E2%80%94%20BiGRU%20%2B%20FastAPI&descAlignY=58&descSize=18&descColor=ECECE9" width="100%"/>

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=500&size=22&duration=2800&pause=900&color=FFB000&center=true&vCenter=true&width=640&lines=Bidirectional+GRU+%C2%B7+NLP+%C2%B7+FastAPI;92.85%25+test+accuracy+on+6+emotions;sadness+%C2%B7+joy+%C2%B7+love+%C2%B7+anger+%C2%B7+fear+%C2%B7+surprise;trained+on+the+dair-ai%2Femotion+dataset" alt="AFFECT project highlights" />

</div>

<br/>

## What is AFFECT?

A sentence goes in, six probabilities come out.

**AFFECT** is an end-to-end text emotion classifier built around a Bidirectional GRU neural network. It is trained on the [`dair-ai/emotion`](https://huggingface.co/datasets/dair-ai/emotion) dataset and exposed through a FastAPI backend with a custom dark/light frontend built using plain HTML, CSS, and JavaScript.

The application predicts one of six emotions:

**😢 Sadness · 😄 Joy · ❤️ Love · 😠 Anger · 😨 Fear · 😲 Surprise**

<div align="center">

| | |
|---|---|
| 🧠 **Model** | Bidirectional GRU (Keras / TensorFlow) |
| 🎯 **Task** | 6-class text emotion classification |
| 📊 **Test accuracy** | **92.85%** |
| 📉 **Test loss** | **0.196** |
| 🗂️ **Dataset** | `dair-ai/emotion` (~20k labelled sentences) |
| ⚙️ **Backend** | FastAPI · Uvicorn |
| 🎨 **Frontend** | Vanilla HTML / CSS / JavaScript |

</div>

<br/>

## ✨ Highlights

- 🔡 **Six-class emotion prediction** — returns the predicted emotion together with the complete probability distribution.
- 🧠 **Bidirectional GRU architecture** — uses context from both directions of the input sequence.
- 🧪 **Model comparison** — Simple RNN, LSTM, GRU, and Bidirectional GRU architectures were evaluated before selecting the final model.
- ⚖️ **Class-weighted training** — balanced class weights were used to account for the uneven class distribution in the training data.
- 🛑 **Early stopping** — training restores the best-performing weights when the monitored loss stops improving.
- ⚡ **FastAPI inference API** — a simple `/predict` endpoint provides the prediction, confidence, and probability breakdown.
- 🖥️ **Framework-free frontend** — includes a probability visualization, dark/light themes, and sample prompts without a frontend build system.

<br/>

## 🧬 How classification works

```mermaid
flowchart LR
    A["Input text"] --> B["Preprocess<br/>lowercase · remove punctuation"]
    B --> C["Tokenize<br/>word IDs"]
    C --> D["Pad / truncate<br/>sequence length: 50"]
    D --> E["Bidirectional GRU<br/>Embedding 300 → BiGRU 128 → BiGRU 64"]
    E --> F["Softmax<br/>6 emotion probabilities"]
    F --> G["Prediction response"]

    style E fill:#FFB000,stroke:#0B0C0D,color:#0B0C0D
```

The same preprocessing used by the API is applied before inference: text is lowercased, apostrophes and special characters are removed, extra whitespace is normalized, the fitted tokenizer converts words to integer IDs, and the sequence is padded or truncated to a maximum length of 50.

<br/>

## 🏗️ System architecture

```mermaid
flowchart TD
    Browser["Web browser<br/>HTML · CSS · JavaScript"] -- "POST /predict" --> API["FastAPI<br/>main.py"]
    API --> Model["BiGRU_Model.keras<br/>trained model"]
    API --> Tok["tokenizer.pkl<br/>fitted tokenizer"]
    Model --> API
    Tok --> API
    API -- "emotion + confidence + probabilities" --> Browser

    style API fill:#17181B,stroke:#FFB000,color:#ECECE9
    style Model fill:#17181B,stroke:#FFB000,color:#ECECE9
    style Tok fill:#17181B,stroke:#FFB000,color:#ECECE9
```

The trained model and tokenizer are loaded when the FastAPI application starts, so they can be reused across prediction requests rather than loaded for every request.

<br/>

## 🛠️ Tech stack

<div align="center">

**Machine Learning**

<img src="https://img.shields.io/badge/TensorFlow-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white" />
<img src="https://img.shields.io/badge/Keras-D00000?style=for-the-badge&logo=keras&logoColor=white" />
<img src="https://img.shields.io/badge/NumPy-013243?style=for-the-badge&logo=numpy&logoColor=white" />
<img src="https://img.shields.io/badge/pandas-150458?style=for-the-badge&logo=pandas&logoColor=white" />
<img src="https://img.shields.io/badge/scikit--learn-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white" />
<img src="https://img.shields.io/badge/🤗%20Datasets-FFD21E?style=for-the-badge&logoColor=black" />
<img src="https://img.shields.io/badge/Matplotlib-11557C?style=for-the-badge" />
<img src="https://img.shields.io/badge/Seaborn-3776AB?style=for-the-badge" />

**Backend**

<img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" />
<img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
<img src="https://img.shields.io/badge/Uvicorn-2A2A2A?style=for-the-badge" />
<img src="https://img.shields.io/badge/Pydantic-E92063?style=for-the-badge&logo=pydantic&logoColor=white" />

**Frontend**

<img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" />
<img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" />
<img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" />

**Deployment**

<img src="https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white" />
<img src="https://img.shields.io/badge/Git%20LFS-F64935?style=for-the-badge&logo=git-lfs&logoColor=white" />

</div>

<br/>

## 📊 Model results

Four recurrent architectures were evaluated using the same general training setup: an embedding layer, recurrent layers, dropout, a softmax output layer, Adam optimization, balanced class weights, and early stopping.

| Model | Test Accuracy | Test Loss |
|---|:---:|:---:|
| Simple RNN | 26.60% | 1.735 |
| LSTM | 11.20% | 1.805 |
| GRU | 8.20% | 1.801 |
| **Bidirectional GRU** ✅ | **92.85%** | **0.196** |

The final Bidirectional GRU uses a **300-dimensional embedding**, followed by Bidirectional GRU layers with **128** and **64** units.

<details>
<summary><b>Per-class recall</b></summary>

<br/>

| Emotion | Recall |
|---|:---:|
| sadness | 95.4% |
| joy | 94.0% |
| anger | 95.3% |
| love | 89.3% |
| fear | 84.8% |
| surprise | 84.8% |

`fear` and `surprise` are the most challenging classes in the reported evaluation.

</details>

<div align="center">
<table>
<tr>
<td align="center" width="50%">
<img src="assets/label_distribution.png" width="100%"/><br/>
<sub>Class distribution in the training data</sub>
</td>
<td align="center" width="50%">
<img src="assets/confusion_matrix.png" width="100%"/><br/>
<sub>Confusion matrix for the final BiGRU model</sub>
</td>
</tr>
</table>
</div>

<br/>

## 🎯 Example

**Input**

> I just found out I passed my board exams on the first try!

**Prediction**

`joy` 😄

**Confidence**

`0.97`

The API also returns probabilities for all six emotions, allowing the result to be viewed as a distribution rather than only a single label.

<br/>

## 📡 API reference

| Route | Method | Body | Returns |
|---|---|---|---|
| `/` | `GET` | — | Serves `static/index.html` |
| `/health` | `GET` | — | `{ status, model_loaded }` |
| `/predict` | `POST` | `{ "text": "..." }` | `{ text, predicted_emotion, confidence, all_probabilites }` |

## 📁 Project structure

```text
.
├── main.py
├── requirements.txt
├── runtime.txt
├── .gitignore
├── README.md
├── emotion_classification.ipynb
├── assets/
│   ├── confusion_matrix.png
│   ├── label_distribution.png
├── Artifacts/
│   ├── BiGRU_Model.keras
│   └── tokenizer.pkl
└── static/
    ├── index.html
    ├── style.css
    └── script.js
```

### Key files

| File / Directory | Purpose |
|---|---|
| `main.py` | FastAPI application and inference endpoints |
| `emotion_classification.ipynb` | Dataset preparation, preprocessing, model training, comparison, and evaluation |
| `Artifacts/BiGRU_Model.keras` | Trained Bidirectional GRU model |
| `Artifacts/tokenizer.pkl` | Fitted text tokenizer used during inference |
| `static/` | Frontend interface |
| `requirements.txt` | Python dependencies |
| `runtime.txt` | Python runtime configuration |

<br/>

## ▶️ Run locally

A local installation can be used to explore the web interface or call the API directly.

> TensorFlow support for Python versions can vary. The project uses a Python 3.11/3.12-compatible environment.

```bash
python3.12 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install --upgrade pip
pip install -r requirements.txt

uvicorn main:app --reload
```

Then open:

**http://127.0.0.1:8000/**

The API is also available at the same address, with the interactive FastAPI documentation at `/docs`.

<br/>

## 📚 Project workflow

The project covers the complete path from dataset to deployed inference:

```text
Emotion dataset
      ↓
Exploratory analysis
      ↓
Text preprocessing & tokenization
      ↓
Sequence padding
      ↓
Model comparison
      ↓
Bidirectional GRU selection
      ↓
Evaluation & confusion matrix
      ↓
Saved model + tokenizer
      ↓
FastAPI inference
      ↓
Web interface
```

<br/>

## 📄 Author

**Rakshat Tiwari**
