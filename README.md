# 🎓 University FAQ Agent

### AI-Powered University FAQ Assistant with Voice Interaction

The **University FAQ Agent** is an AI-powered conversational assistant designed to provide students with quick and reliable answers to university-related questions.

The application combines **Microsoft Foundry** for intelligent FAQ-based question answering with **Azure AI Speech** for Speech-to-Text and Text-to-Speech, allowing users to interact with the assistant through both **text and voice**.

---

## ✨ Features

* 💬 AI-powered university FAQ chatbot
* 🎤 Voice input using Azure Speech-to-Text
* 🔊 Voice responses using Azure Text-to-Speech
* 🧠 Microsoft Foundry Agent integration
* 📚 Knowledge-grounded responses from university documents
* 🎓 Program-specific information handling
* 💰 Semester-wise fee information
* 🏠 Hostel and accommodation information
* 📝 Admission and eligibility information
* 🔐 Environment-based API key protection
* 📱 Responsive web interface
* ⚡ Real-time frontend-backend communication

---

## 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │       Student       │
                    └──────────┬──────────┘
                               │
                         Text / Voice
                               │
                               ▼
                    ┌─────────────────────┐
                    │      Frontend       │
                    │    HTML / CSS / JS  │
                    └──────────┬──────────┘
                               │
                         HTTP Requests
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Flask Backend     │
                    │       Python        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  Microsoft Foundry  │
                    │     FAQ Agent       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ University Knowledge│
                    │       Sources       │
                    └─────────────────────┘

Voice Input:
Student → Azure Speech-to-Text → Foundry Agent

Voice Output:
Foundry Response → Azure Text-to-Speech → Student
```

---

## 🛠️ Technology Stack

| Technology            | Purpose                                |
| --------------------- | -------------------------------------- |
| **Python**            | Backend development                    |
| **Flask**             | REST API backend                       |
| **HTML5**             | Web interface                          |
| **CSS3**              | UI styling and responsive design       |
| **JavaScript**        | Frontend logic and API communication   |
| **Microsoft Foundry** | AI agent and knowledge-based responses |
| **Azure AI Speech**   | Speech-to-Text and Text-to-Speech      |
| **FFmpeg**            | Audio conversion and processing        |
| **Git & GitHub**      | Version control                        |

---

## 🎤 Voice Interaction

The application provides a complete voice interaction pipeline.

### Speech-to-Text

```text
🎤 User speaks
      ↓
Browser microphone
      ↓
Flask Backend
      ↓
Azure AI Speech
      ↓
Recognized text
      ↓
Microsoft Foundry FAQ Agent
```

### Text-to-Speech

```text
Microsoft Foundry response
      ↓
Flask Backend
      ↓
Azure AI Speech
      ↓
Generated audio
      ↓
🔊 User hears the response
```

Azure Speech credentials are stored securely in environment variables and are never exposed in the frontend.

---

## 🧠 Knowledge-Based Question Answering

The FAQ Agent uses connected university knowledge sources to answer questions related to university information.

The assistant can handle topics such as:

* Admission process
* Eligibility requirements
* Academic programs
* Semester-wise fee structures
* Hostel fees
* Hostel accommodation
* University policies
* Other information available in the connected knowledge sources

The agent is instructed to avoid guessing when information cannot be reliably found in the available sources.

---

## 🎓 Program-Specific Accuracy

Different university programs are treated as separate records.

For example:

```text
BCA
BCA in Artificial Intelligence & Machine Learning
CSE
CSE in Artificial Intelligence & Machine Learning
```

The assistant does not automatically substitute one program for another.

If a user enters an ambiguous or misspelled program name, the assistant is instructed to request clarification rather than providing information from a different program.

For example:

```text
User:
What is the fee structure for CST AIML?
```

If `CST AIML` does not exist as an exact program in the knowledge sources, the assistant asks the user to clarify instead of returning the fee structure of another program.

---

## 🔐 Security

Sensitive credentials are stored in a local `.env` file.

Example:

```env
FOUNDRY_PROJECT_ENDPOINT=your_foundry_endpoint
FOUNDRY_API_KEY=your_foundry_api_key
FOUNDRY_AGENT_NAME=your_agent_name

AZURE_SPEECH_KEY=your_speech_key
AZURE_SPEECH_REGION=your_speech_region
```

The `.env` file is excluded from Git using `.gitignore`.

**Never commit API keys, passwords, access tokens, or other credentials to GitHub.**

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

> The `.env` file is intentionally excluded from the repository.

---

## ⚙️ Running the Project Locally

### 1. Clone the repository

```bash
git clone https://github.com/Joharliv/University_FAQ_Agent.git
cd University_FAQ_Agent
```

### 2. Install Python dependencies

```bash
pip install flask flask-cors python-dotenv openai azure-cognitiveservices-speech
```

### 3. Install FFmpeg

Verify that FFmpeg is installed:

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

### 5. Start the backend

```bash
python backend/app.py
```

The backend will run at:

```text
http://127.0.0.1:5000
```

### 6. Start the frontend

Open the `frontend` folder using a local development server such as **VS Code Live Server**.

---

## 🔌 Backend API

### Chat

```http
POST /api/chat
```

Sends a user question to the Microsoft Foundry FAQ Agent.

### Speech-to-Text

```http
POST /api/speech-to-text
```

Processes recorded audio using Azure AI Speech and returns recognized text.

### Text-to-Speech

```http
POST /api/text-to-speech
```

Converts the AI-generated response into speech using Azure AI Speech.

---

## 🔄 Application Flow

```text
                    User
                     │
             ┌───────┴───────┐
             │               │
           Text            Voice
             │               │
             │        Azure Speech STT
             │               │
             └───────┬───────┘
                     │
                     ▼
              Flask Backend
                     │
                     ▼
          Microsoft Foundry Agent
                     │
                     ▼
          University Knowledge
                     │
                     ▼
               AI Response
                     │
             ┌───────┴───────┐
             │               │
          Chat UI        Azure Speech TTS
                             │
                             ▼
                        🔊 Voice Output
```

---

## 👩‍💻 Developer

**Liv Johar**

B.E. Computer Science Engineering — Artificial Intelligence & Machine Learning

**Chitkara University, Punjab**

---

## 📄 Project Status

**Completed**

This project was developed as an AI-powered university FAQ assistant with integrated voice interaction using Microsoft Foundry and Azure AI Speech.
