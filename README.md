<div align="center">
# 🎓 University FAQ Agent

### AI-Powered University FAQ Assistant with Voice Interaction

<p align="center">

<img src="https://img.shields.io/badge/Microsoft%20Foundry-5E5CE6?style=for-the-badge&logo=microsoft&logoColor=white"/>

<img src="https://img.shields.io/badge/Azure%20AI%20Speech-0078D4?style=for-the-badge&logo=microsoftazure&logoColor=white"/>

<img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white"/>

<img src="https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white"/>

<img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"/>

<img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white"/>

<img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white"/>

</p>

<p align="center">

<img src="https://img.shields.io/badge/AI-Powered-8A2BE2?style=for-the-badge"/>

<img src="https://img.shields.io/badge/Voice%20Enabled-success?style=for-the-badge"/>

</p>

## ✨ Features

* AI-powered university FAQ assistance
* Knowledge-grounded responses using university documents
* Text-based conversational interface
* Speech-to-Text using Azure AI Speech
* Text-to-Speech using Azure AI Speech
* Program-specific fee and academic information
* Admission and eligibility information
* Hostel and accommodation information
* Responsive web interface
* Secure environment-based API configuration

---

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3, JavaScript
* **Backend:** Python, Flask
* **AI:** Microsoft Foundry Agent
* **Speech:** Azure AI Speech
* **Audio Processing:** FFmpeg
* **Version Control:** Git, GitHub

---

## 🏗️ Architecture

```text
┌───────────────┐
│    Student    │
└───────┬───────┘
        │
   Text / Voice
        │
        ▼
┌───────────────┐
│   Frontend    │
│ HTML / CSS /  │
│  JavaScript   │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ Flask Backend │
└───────┬───────┘
        │
        ▼
┌─────────────────────┐
│ Microsoft Foundry   │
│     FAQ Agent       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ University Knowledge│
│       Sources       │
└─────────────────────┘

Voice Input  → Azure AI Speech → Speech-to-Text
AI Response  → Azure AI Speech → Text-to-Speech
```

---

## 📁 Project Structure

```text
University_FAQ_Agent/
│
├── backend/
│   └── app.py
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── app.js
│
├── .gitignore
└── README.md
```

---

## ⚙️ Setup

### 1. Clone the repository

```bash
git clone https://github.com/Joharliv/University_FAQ_Agent.git
cd University_FAQ_Agent
```

### 2. Install dependencies

```bash
pip install flask flask-cors python-dotenv openai azure-cognitiveservices-speech
```

### 3. Install FFmpeg

Verify the installation:

```bash
ffmpeg -version
```

### 4. Configure environment variables

Create a `.env` file in the project root:

```env
FOUNDRY_PROJECT_ENDPOINT=YOUR_FOUNDRY_PROJECT_ENDPOINT
FOUNDRY_API_KEY=YOUR_FOUNDRY_API_KEY
FOUNDRY_AGENT_NAME=YOUR_FOUNDRY_AGENT_NAME

AZURE_SPEECH_KEY=YOUR_AZURE_SPEECH_KEY
AZURE_SPEECH_REGION=YOUR_AZURE_SPEECH_REGION
```

> Never commit `.env` or API credentials to GitHub.

### 5. Run the backend

```bash
python backend/app.py
```

The backend runs at:

```text
http://127.0.0.1:5000
```

### 6. Run the frontend

Open the `frontend` directory using a local development server such as **VS Code Live Server**.

---

## 🔌 API Endpoints

| Method | Endpoint              | Description                       |
| ------ | --------------------- | --------------------------------- |
| `POST` | `/api/chat`           | Sends a question to the FAQ Agent |
| `POST` | `/api/speech-to-text` | Converts speech into text         |
| `POST` | `/api/text-to-speech` | Converts text into speech         |

---

## 🔐 Security

API credentials are stored in environment variables and are not exposed to the frontend.

The `.env` file is excluded from version control using `.gitignore`.

---

## 👩‍💻 Developer

**Liv Johar**
B.E. Computer Science Engineering — Artificial Intelligence & Machine Learning
Chitkara University, Punjab

---

## 📌 Status

**Completed**
