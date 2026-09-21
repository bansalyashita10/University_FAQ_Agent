from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from dotenv import load_dotenv
from openai import OpenAI
import azure.cognitiveservices.speech as speechsdk
import os
import tempfile
import subprocess


# =====================================================
# ENVIRONMENT
# =====================================================

load_dotenv()


# =====================================================
# FLASK
# =====================================================

app = Flask(__name__)
CORS(app)


# =====================================================
# MICROSOFT FOUNDRY CONFIGURATION
# =====================================================

FOUNDRY_PROJECT_ENDPOINT = os.getenv("FOUNDRY_PROJECT_ENDPOINT")
FOUNDRY_API_KEY = os.getenv("FOUNDRY_API_KEY")
FOUNDRY_AGENT_NAME = os.getenv("FOUNDRY_AGENT_NAME")


# =====================================================
# AZURE SPEECH CONFIGURATION
# =====================================================

SPEECH_KEY = os.getenv("AZURE_SPEECH_KEY")
SPEECH_REGION = os.getenv("AZURE_SPEECH_REGION")


# =====================================================
# CREATE OPENAI CLIENT
# =====================================================

client = OpenAI(
    api_key=FOUNDRY_API_KEY,
    base_url=f"{FOUNDRY_PROJECT_ENDPOINT}/openai/v1"
)


# =====================================================
# HOME ROUTE
# =====================================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "message": "Chitkara FAQ backend is running"
    })


# =====================================================
# CHAT ROUTE
# =====================================================

@app.route("/api/chat", methods=["POST"])
def chat():

    try:

        data = request.get_json()

        message = data.get("message", "").strip()

        if not message:

            return jsonify({
                "error": "Message is required"
            }), 400


        print("User question:", message)


        # --------------------------------------------------
        # SEND QUESTION TO MICROSOFT FOUNDRY AGENT
        # --------------------------------------------------

        response = client.responses.create(

            input=message,

            extra_body={
                "agent_reference": {
                    "name": FOUNDRY_AGENT_NAME,
                    "type": "agent_reference"
                }
            }
        )


        answer = response.output_text


        print("Agent answer:", answer)


        return jsonify({
            "answer": answer
        })


    except Exception as e:

        print("ERROR:", str(e))

        return jsonify({

            "error": "Failed to get response from Foundry Agent",

            "details": str(e)

        }), 500


# =====================================================
# AZURE SPEECH-TO-TEXT
# =====================================================

def convert_audio_to_wav(input_file, output_file):

    """
    Convert browser-recorded WebM/Opus audio
    into 16 kHz mono WAV audio.

    Azure Speech SDK can then process the WAV file.
    """

    command = [

        "ffmpeg",

        "-y",

        "-i",
        input_file,

        "-ar",
        "16000",

        "-ac",
        "1",

        "-sample_fmt",
        "s16",

        output_file
    ]


    subprocess.run(

        command,

        stdout=subprocess.PIPE,

        stderr=subprocess.PIPE,

        check=True
    )


# =====================================================
# SPEECH-TO-TEXT FUNCTION
# =====================================================

def speech_to_text(audio_file):

    speech_config = speechsdk.SpeechConfig(

        subscription=SPEECH_KEY,

        region=SPEECH_REGION
    )


    # Indian English

    speech_config.speech_recognition_language = "en-IN"


    audio_config = speechsdk.audio.AudioConfig(

        filename=audio_file
    )


    recognizer = speechsdk.SpeechRecognizer(

        speech_config=speech_config,

        audio_config=audio_config
    )


    result = recognizer.recognize_once()


    if result.reason == speechsdk.ResultReason.RecognizedSpeech:

        return result.text


    if result.reason == speechsdk.ResultReason.NoMatch:

        print("Azure Speech: No speech recognized.")

        return None


    if result.reason == speechsdk.ResultReason.Canceled:

        cancellation = result.cancellation_details

        print(
            "Azure Speech cancelled:",
            cancellation.reason
        )

        print(
            "Azure Speech error:",
            cancellation.error_details
        )

        return None


    return None


# =====================================================
# SPEECH-TO-TEXT API
# =====================================================

@app.route("/api/speech-to-text", methods=["POST"])
def speech_to_text_api():

    input_path = None

    wav_path = None


    try:

        # --------------------------------------------------
        # CHECK AUDIO
        # --------------------------------------------------

        if "audio" not in request.files:

            return jsonify({
                "error": "No audio file provided"
            }), 400


        audio = request.files["audio"]


        if audio.filename == "":

            return jsonify({
                "error": "Empty audio file"
            }), 400


        # --------------------------------------------------
        # CREATE TEMPORARY FILES
        # --------------------------------------------------

        input_temp = tempfile.NamedTemporaryFile(

            delete=False,

            suffix=".webm"
        )

        input_path = input_temp.name

        input_temp.close()


        wav_temp = tempfile.NamedTemporaryFile(

            delete=False,

            suffix=".wav"
        )

        wav_path = wav_temp.name

        wav_temp.close()


        # --------------------------------------------------
        # SAVE BROWSER AUDIO
        # --------------------------------------------------

        audio.save(input_path)


        print("Audio received.")

        print("Converting audio to WAV...")


        # --------------------------------------------------
        # CONVERT WEBM → WAV
        # --------------------------------------------------

        convert_audio_to_wav(

            input_path,

            wav_path
        )


        print("Audio converted.")


        # --------------------------------------------------
        # AZURE SPEECH
        # --------------------------------------------------

        text = speech_to_text(wav_path)


        if not text:

            return jsonify({

                "error": "Could not recognize speech"

            }), 400


        print("Recognized speech:", text)


        return jsonify({

            "text": text

        })


    except subprocess.CalledProcessError as e:

        print(
            "FFmpeg error:",
            e
        )

        return jsonify({

            "error":
                "Audio conversion failed. "
                "Make sure FFmpeg is installed."

        }), 500


    except Exception as e:

        print(
            "Speech-to-text error:",
            str(e)
        )

        return jsonify({

            "error": "Speech recognition failed",

            "details": str(e)

        }), 500


    finally:

        # --------------------------------------------------
        # CLEAN TEMP FILES
        # --------------------------------------------------

        if input_path and os.path.exists(input_path):

            os.remove(input_path)


        if wav_path and os.path.exists(wav_path):

            os.remove(wav_path)


# =====================================================
# AZURE TEXT-TO-SPEECH
# =====================================================

def text_to_speech(text):

    speech_config = speechsdk.SpeechConfig(

        subscription=SPEECH_KEY,

        region=SPEECH_REGION
    )


    # Indian English neural voice

    speech_config.speech_synthesis_voice_name = (
        "en-IN-NeerjaNeural"
    )


    # Create temporary WAV output

    output_temp = tempfile.NamedTemporaryFile(

        delete=False,

        suffix=".wav"
    )

    output_path = output_temp.name

    output_temp.close()


    audio_config = speechsdk.audio.AudioOutputConfig(

        filename=output_path
    )


    synthesizer = speechsdk.SpeechSynthesizer(

        speech_config=speech_config,

        audio_config=audio_config
    )


    result = synthesizer.speak_text_async(text).get()


    if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:

        return output_path


    if result.reason == speechsdk.ResultReason.Canceled:

        cancellation = result.cancellation_details

        print(
            "Azure TTS cancelled:",
            cancellation.reason
        )

        print(
            "Azure TTS error:",
            cancellation.error_details
        )


    # Delete file if synthesis failed

    if os.path.exists(output_path):

        os.remove(output_path)


    return None


# =====================================================
# TEXT-TO-SPEECH API
# =====================================================

@app.route("/api/text-to-speech", methods=["POST"])
def text_to_speech_api():

    try:

        data = request.get_json()

        text = data.get("text", "").strip()


        if not text:

            return jsonify({

                "error": "Text is required"

            }), 400


        print(
            "Generating speech for:",
            text
        )


        audio_path = text_to_speech(text)


        if not audio_path:

            return jsonify({

                "error":
                    "Azure Text-to-Speech failed"

            }), 500


        response = send_file(

            audio_path,

            mimetype="audio/wav"
        )


        # Delete temporary file after response

        @response.call_on_close
        def cleanup():

            try:

                if os.path.exists(audio_path):

                    os.remove(audio_path)

            except Exception as e:

                print(
                    "Could not delete audio file:",
                    e
                )


        return response


    except Exception as e:

        print(
            "Text-to-speech error:",
            str(e)
        )

        return jsonify({

            "error":
                "Text-to-speech failed",

            "details":
                str(e)

        }), 500


# =====================================================
# RUN FLASK
# =====================================================

if __name__ == "__main__":

    app.run(

        host="127.0.0.1",

        port=5000,

        debug=True
    )