from flask import Flask, request, jsonify
from flask_cors import CORS
import speech_recognition as sr
from pydub import AudioSegment
import os

# We import brain() from your existing jarvis.py
# Because jarvis.py now has "if __name__ == '__main__':",
# importing it here will NOT start the microphone.
from jarvis import brain

app = Flask(__name__)
CORS(app)  # allows index.html (opened separately) to talk to this server

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_text = data.get("text", "")

    if user_text.strip() == "":
        return jsonify({"reply": "I didn't catch that, sir."})

    reply = brain(user_text)
    return jsonify({"reply": reply})


@app.route("/voice", methods=["POST"])
def voice():
    audio_file = request.files["audio"]

    webm_path = "temp_audio.webm"
    wav_path = "temp_audio.wav"

    audio_file.save(webm_path)

    try:
        # Convert the browser's webm recording into wav (speech_recognition needs wav)
        sound = AudioSegment.from_file(webm_path)
        sound.export(wav_path, format="wav")

        recognizer = sr.Recognizer()
        with sr.AudioFile(wav_path) as source:
            audio_data = recognizer.record(source)

        try:
            heard_text = recognizer.recognize_google(audio_data)
        except sr.UnknownValueError:
            return jsonify({"heard": "", "reply": "Sorry sir, I couldn't understand that."})
        except sr.RequestError:
            return jsonify({"heard": "", "reply": "Speech recognition service is unavailable right now."})

        reply = brain(heard_text)
        return jsonify({"heard": heard_text, "reply": reply})

    finally:
        # Clean up temp files even if something went wrong above
        if os.path.exists(webm_path):
            os.remove(webm_path)
        if os.path.exists(wav_path):
            os.remove(wav_path)


if __name__ == "__main__":
    app.run(port=5000, debug=True)
