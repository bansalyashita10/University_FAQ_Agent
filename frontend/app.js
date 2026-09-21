/* =====================================================
   CHITKARA UNIVERSITY FAQ ASSISTANT
   Frontend application
   ===================================================== */


/* =====================================================
   BACKEND CONFIGURATION
   ===================================================== */

const API_BASE_URL = "https://university-faq-agent.onrender.com";

const CHAT_API_URL =
    `${API_BASE_URL}/api/chat`;

const SPEECH_TO_TEXT_API_URL =
    `${API_BASE_URL}/api/speech-to-text`;

const TEXT_TO_SPEECH_API_URL =
    `${API_BASE_URL}/api/text-to-speech`;


/* =====================================================
   DOM ELEMENTS
   ===================================================== */

const chatArea =
    document.getElementById("chatArea");

const welcomeScreen =
    document.getElementById("welcomeScreen");

const messagesContainer =
    document.getElementById("messagesContainer");

const typingIndicator =
    document.getElementById("typingIndicator");

const messageInput =
    document.getElementById("messageInput");

const sendButton =
    document.getElementById("sendButton");

const micButton =
    document.getElementById("micButton");

const clearChatButton =
    document.getElementById("clearChatButton");

const clearChatHeader =
    document.getElementById("clearChatHeader");


/* =====================================================
   APPLICATION STATE
   ===================================================== */

let isWaitingForResponse = false;

let lastFailedMessage = null;

let conversation = [];

let mediaRecorder = null;

let audioChunks = [];

let isRecording = false;

let currentAudio = null;

let currentSpeakButton = null;


/* =====================================================
   INITIALIZATION
   ===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadConversation();

        setupSuggestionButtons();

        setupInputEvents();

        setupClearButtons();

        setupMicrophone();

    }
);


/* =====================================================
   CONVERSATION STORAGE
   ===================================================== */

function loadConversation() {

    const savedConversation =
        sessionStorage.getItem(
            "chitkaraConversation"
        );


    if (!savedConversation) {
        return;
    }


    try {

        conversation =
            JSON.parse(savedConversation);


        if (conversation.length === 0) {
            return;
        }


        welcomeScreen.classList.add(
            "hidden"
        );


        conversation.forEach(
            message => {

                addMessageToUI(

                    message.role,

                    message.content,

                    false

                );

            }
        );


    } catch (error) {

        console.error(
            "Could not restore conversation:",
            error
        );

        conversation = [];

    }

}


function saveConversation() {

    sessionStorage.setItem(

        "chitkaraConversation",

        JSON.stringify(conversation)

    );

}


/* =====================================================
   MESSAGE API
   ===================================================== */

async function sendMessage(message) {

    if (!message || !message.trim()) {

        throw new Error(
            "Message cannot be empty."
        );

    }


    const response =
        await fetch(

            CHAT_API_URL,

            {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    message: message

                })

            }

        );


    if (!response.ok) {

        throw new Error(

            `Backend request failed (${response.status})`

        );

    }


    const data =
        await response.json();


    if (!data.answer) {

        throw new Error(

            "The backend returned an invalid response."

        );

    }


    return data.answer;

}


/* =====================================================
   SEND MESSAGE
   ===================================================== */

async function handleSendMessage(
    message = null
) {

    if (isWaitingForResponse) {
        return;
    }


    const text =

        message !== null

            ? message.trim()

            : messageInput.value.trim();


    if (!text) {

        messageInput.focus();

        return;

    }


    /* ---------------------------------------------
       ADD USER MESSAGE
       --------------------------------------------- */

    addMessageToUI(

        "user",

        text

    );


    conversation.push({

        role: "user",

        content: text

    });


    saveConversation();


    messageInput.value = "";

    autoResizeTextarea();


    welcomeScreen.classList.add(
        "hidden"
    );


    /* ---------------------------------------------
       LOADING
       --------------------------------------------- */

    setLoadingState(true);

    lastFailedMessage = text;


    try {

        const answer =
            await sendMessage(text);


        /* -----------------------------------------
           ADD AI RESPONSE
           ----------------------------------------- */

        addMessageToUI(

            "assistant",

            answer

        );


        conversation.push({

            role: "assistant",

            content: answer

        });


        saveConversation();


        lastFailedMessage = null;


    } catch (error) {

        console.error(error);

        addErrorMessage(
            error.message
        );


    } finally {

        setLoadingState(false);

    }

}


/* =====================================================
   ADD MESSAGE TO UI
   ===================================================== */

function addMessageToUI(

    role,

    content,

    scroll = true

) {

    const row =
        document.createElement("div");


    row.className =

        `message-row ${
            role === "user"
                ? "user"
                : "assistant"
        }`;


    if (role === "assistant") {

        row.innerHTML = `

            <div class="message-avatar ai-avatar">
                ✦
            </div>

            <div class="message-content">

                <div class="message-bubble ai-message">
                    ${formatAIResponse(content)}
                </div>

                <div class="ai-actions">

                    <button
                        class="speak-button"
                        title="Read response aloud"
                        aria-label="Read response aloud"
                    >

                        <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        >

                            <polygon
                                points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"
                            ></polygon>

                            <path
                                d="M19.07 4.93a10 10 0 0 1 0 14.14"
                            ></path>

                            <path
                                d="M15.54 8.46a5 5 0 0 1 0 7.07"
                            ></path>

                        </svg>

                    </button>

                </div>

            </div>

        `;


    } else {

        row.innerHTML = `

            <div class="message-content">

                <div class="message-bubble user-message">
                    ${escapeHTML(content)}
                </div>

            </div>

        `;

    }


    messagesContainer.appendChild(row);


    /* ---------------------------------------------
       SPEAKER BUTTON
       --------------------------------------------- */

    if (role === "assistant") {

        const speakerButton =
            row.querySelector(
                ".speak-button"
            );


        speakerButton.addEventListener(

            "click",

            () => {

                speakResponse(

                    content,

                    speakerButton

                );

            }

        );

    }


    if (scroll) {

        scrollToBottom();

    }

}


/* =====================================================
   AI RESPONSE FORMATTING
   ===================================================== */

function formatAIResponse(text) {

    let formatted =
        escapeHTML(text);


    formatted =
        formatted.replace(

            /\*\*(.*?)\*\*/g,

            "<strong>$1</strong>"

        );


    formatted =
        formatted.replace(

            /\n/g,

            "<br>"

        );


    return formatted;

}

function cleanTextForSpeech(text) {
    return text
        // Remove markdown table separator lines
        .replace(/^\s*\|?[\s:-]+\|[\s|:-]*$/gm, "")

        // Replace table rows with natural sentence separators
        .replace(/\|/g, ", ")

        // Remove markdown headings
        .replace(/^#{1,6}\s*/gm, "")

        // Remove bold / italic markdown
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/__(.*?)__/g, "$1")
        .replace(/_(.*?)_/g, "$1")

        // Remove inline code formatting
        .replace(/`([^`]+)`/g, "$1")

        // Remove markdown links but keep the text
        .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")

        // Clean excessive whitespace
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")

        .trim();
}


/* =====================================================
   HTML SAFETY
   ===================================================== */

function escapeHTML(text) {

    const div =
        document.createElement("div");


    div.textContent = text;


    return div.innerHTML;

}


/* =====================================================
   TYPING INDICATOR
   ===================================================== */

function setLoadingState(loading) {

    isWaitingForResponse =
        loading;


    typingIndicator.classList.toggle(

        "hidden",

        !loading

    );


    sendButton.disabled =
        loading;


    if (loading) {

        messageInput.disabled =
            true;


        scrollToBottom();

    } else {

        messageInput.disabled =
            false;


        messageInput.focus();

    }

}


/* =====================================================
   ERROR MESSAGE
   ===================================================== */

function addErrorMessage(errorText) {

    const row =
        document.createElement("div");


    row.className =
        "message-row assistant";


    row.innerHTML = `

        <div class="message-avatar ai-avatar">
            !
        </div>

        <div class="message-content">

            <div class="error-message">

                <strong>
                    Unable to get a response.
                </strong>

                <br>

                ${escapeHTML(errorText)}

                <br>

                <button
                    class="retry-button"
                >
                    Try again
                </button>

            </div>

        </div>

    `;


    messagesContainer.appendChild(row);


    const retryButton =
        row.querySelector(
            ".retry-button"
        );


    retryButton.addEventListener(

        "click",

        () => {

            row.remove();


            if (lastFailedMessage) {

                handleSendMessage(
                    lastFailedMessage
                );

            }

        }

    );


    scrollToBottom();

}


/* =====================================================
   SUGGESTED QUESTIONS
   ===================================================== */

function setupSuggestionButtons() {

    const buttons =
        document.querySelectorAll(
            ".suggestion-btn"
        );


    buttons.forEach(

        button => {

            button.addEventListener(

                "click",

                () => {

                    const question =

                        button.textContent
                            .replace(
                                /^\d+/,
                                ""
                            )
                            .trim();


                    handleSendMessage(
                        question
                    );

                }

            );

        }

    );

}


/* =====================================================
   TEXT INPUT
   ===================================================== */

function setupInputEvents() {

    messageInput.addEventListener(

        "input",

        autoResizeTextarea

    );


    messageInput.addEventListener(

        "keydown",

        event => {

            if (

                event.key === "Enter" &&

                !event.shiftKey

            ) {

                event.preventDefault();

                handleSendMessage();

            }

        }

    );


    sendButton.addEventListener(

        "click",

        () => {

            handleSendMessage();

        }

    );

}


function autoResizeTextarea() {

    messageInput.style.height =
        "auto";


    messageInput.style.height =

        `${Math.min(
            messageInput.scrollHeight,
            120
        )}px`;

}


/* =====================================================
   SCROLL
   ===================================================== */

function scrollToBottom() {

    requestAnimationFrame(

        () => {

            chatArea.scrollTo({

                top:
                    chatArea.scrollHeight,

                behavior:
                    "smooth"

            });

        }

    );

}


/* =====================================================
   CLEAR CHAT
   ===================================================== */

function setupClearButtons() {

    clearChatButton.addEventListener(

        "click",

        clearConversation

    );


    clearChatHeader.addEventListener(

        "click",

        clearConversation

    );

}


function clearConversation() {

    if (conversation.length === 0) {
        return;
    }


    const confirmed =
        confirm(

            "Are you sure you want to clear this conversation?"

        );


    if (!confirmed) {
        return;
    }


    conversation = [];


    sessionStorage.removeItem(
        "chitkaraConversation"
    );


    messagesContainer.innerHTML = "";


    welcomeScreen.classList.remove(
        "hidden"
    );


    messageInput.value = "";


    autoResizeTextarea();


    messageInput.focus();

}


/* =====================================================
   AZURE SPEECH-TO-TEXT
   ===================================================== */

function setupMicrophone() {

    micButton.addEventListener(

        "click",

        handleMicrophoneClick

    );

}


/* =====================================================
   MICROPHONE CLICK
   ===================================================== */

async function handleMicrophoneClick() {

    if (isRecording) {

        stopRecording();

        return;

    }


    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
    ) {

        alert(

            "Microphone access is not supported by this browser."

        );

        return;

    }


    try {

        const stream =
            await navigator.mediaDevices.getUserMedia({

                audio: true

            });


        audioChunks = [];


        let options = {};


        /*
            Prefer WebM/Opus because it is widely
            supported by Chrome.
        */

        if (
            MediaRecorder.isTypeSupported(
                "audio/webm;codecs=opus"
            )
        ) {

            options = {

                mimeType:
                    "audio/webm;codecs=opus"

            };

        }


        mediaRecorder =
            new MediaRecorder(
                stream,
                options
            );


        mediaRecorder.ondataavailable =
            event => {

                if (
                    event.data &&
                    event.data.size > 0
                ) {

                    audioChunks.push(
                        event.data
                    );

                }

            };


        mediaRecorder.onstop =
            async () => {

                stream
                    .getTracks()
                    .forEach(
                        track =>
                            track.stop()
                    );


                const audioBlob =
                    new Blob(

                        audioChunks,

                        {
                            type:
                                mediaRecorder.mimeType ||
                                "audio/webm"
                        }

                    );


                await sendAudioToAzure(
                    audioBlob
                );

            };


        mediaRecorder.start();

        isRecording = true;


        micButton.classList.add(
            "recording"
        );


        console.log(
            "Recording started."
        );


    } catch (error) {

        console.error(
            "Microphone error:",
            error
        );


        alert(

            "Could not access your microphone."

        );

    }

}


/* =====================================================
   STOP RECORDING
   ===================================================== */

function stopRecording() {

    if (
        mediaRecorder &&
        mediaRecorder.state !== "inactive"
    ) {

        mediaRecorder.stop();

    }


    isRecording = false;


    micButton.classList.remove(
        "recording"
    );


    console.log(
        "Recording stopped."
    );

}


/* =====================================================
   SEND AUDIO TO PYTHON BACKEND
   ===================================================== */

async function sendAudioToAzure(audioBlob) {

    if (!audioBlob || audioBlob.size === 0) {

        return;

    }


    try {

        setLoadingState(true);


        const formData =
            new FormData();


        formData.append(

            "audio",

            audioBlob,

            "recording.webm"

        );


        console.log(
            "Sending audio to Azure Speech..."
        );


        const response =
            await fetch(

                SPEECH_TO_TEXT_API_URL,

                {

                    method: "POST",

                    body: formData

                }

            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(

                data.error ||
                "Speech recognition failed."

            );

        }


        const recognizedText =
            data.text;


        if (
            !recognizedText ||
            !recognizedText.trim()
        ) {

            throw new Error(
                "No speech was recognized."
            );

        }


        console.log(
            "Recognized text:",
            recognizedText
        );


        /*
            Put recognized text into the input
            so the user can see what Azure heard.
        */

        messageInput.value =
            recognizedText;


        autoResizeTextarea();


        /*
            Automatically send the recognized
            question to the Foundry Agent.
        */

        await handleSendMessage(
            recognizedText
        );


    } catch (error) {

        console.error(
            "Speech-to-text error:",
            error
        );


        addErrorMessage(
            error.message
        );


    } finally {

        setLoadingState(false);

    }

}


/* =====================================================
   AZURE TEXT-TO-SPEECH
   ===================================================== */

async function speakResponse(
    text,
    button
) {

    /*
        If audio is already playing,
        stop it.
    */

    if (currentAudio) {

        currentAudio.pause();

        currentAudio.currentTime = 0;

        currentAudio = null;


        if (currentSpeakButton) {

            currentSpeakButton.classList.remove(
                "speaking"
            );

        }


        currentSpeakButton = null;


        return;

    }


    try {

        button.classList.add(
            "speaking"
        );


        currentSpeakButton =
            button;


        console.log(
            "Requesting Azure Text-to-Speech..."
        );


        const response =
            await fetch(

                TEXT_TO_SPEECH_API_URL,

                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        text: cleanTextForSpeech(text)

                    })

                }

            );


        if (!response.ok) {

            let errorMessage =
                "Text-to-speech failed.";


            try {

                const data =
                    await response.json();


                if (data.error) {

                    errorMessage =
                        data.error;

                }

            } catch (error) {

                console.error(
                    error
                );

            }


            throw new Error(
                errorMessage
            );

        }


        /*
            Convert backend WAV response
            into a browser audio object.
        */

        const audioBlob =
            await response.blob();


        const audioURL =
            URL.createObjectURL(
                audioBlob
            );


        currentAudio =
            new Audio(audioURL);


        currentAudio.onended =
            () => {

                button.classList.remove(
                    "speaking"
                );


                URL.revokeObjectURL(
                    audioURL
                );


                currentAudio =
                    null;


                currentSpeakButton =
                    null;

            };


        currentAudio.onerror =
            () => {

                button.classList.remove(
                    "speaking"
                );


                URL.revokeObjectURL(
                    audioURL
                );


                currentAudio =
                    null;


                currentSpeakButton =
                    null;

            };


        await currentAudio.play();


    } catch (error) {

        console.error(
            "Text-to-speech error:",
            error
        );


        button.classList.remove(
            "speaking"
        );


        currentAudio = null;

        currentSpeakButton = null;


        alert(
            error.message
        );

    }

}