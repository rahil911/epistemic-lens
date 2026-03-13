"""The Epistemic Lens -- Flask backend for the live presentation dashboard."""

import os
import requests
from dotenv import load_dotenv
from flask import Flask, render_template, jsonify, request

load_dotenv()
from nebula_api import MODELS, MODEL_COLORS, send_prompt, send_parallel, extract_confidence
from data_loader import (
    load_sycophancy, load_question_bank,
    load_abstention_results, load_abstention_metrics, load_falseqa_questions,
    load_calibration_results, load_friction_results,
)

app = Flask(__name__)

SARVAM_API_KEY = os.environ.get("SARVAM_API_KEY", "")


@app.route("/")
def index():
    return render_template("index.html")


# --- Data API ---

@app.route("/api/models")
def get_models():
    return jsonify({
        name: {"endpoint": url.split("/")[-1], "color": MODEL_COLORS.get(name, "#888")}
        for name, url in MODELS.items()
    })


@app.route("/api/data/sycophancy/<bench_type>")
def get_sycophancy(bench_type):
    if bench_type not in ("delusion", "mirror", "pickside", "whosaid"):
        return jsonify({"error": "Invalid type"}), 400
    return jsonify(load_sycophancy(bench_type))


@app.route("/api/data/sycophancy/questions/<bench_type>")
def get_sycophancy_questions(bench_type):
    if bench_type not in ("delusion", "mirror", "pickside", "whosaid"):
        return jsonify({"error": "Invalid type"}), 400
    return jsonify(load_question_bank(bench_type))


@app.route("/api/data/abstention/results")
def get_abstention_results():
    return jsonify(load_abstention_results())


@app.route("/api/data/abstention/metrics")
def get_abstention_metrics():
    return jsonify(load_abstention_metrics())


@app.route("/api/data/abstention/questions")
def get_abstention_questions():
    return jsonify(load_falseqa_questions())


@app.route("/api/data/calibration")
def get_calibration():
    return jsonify(load_calibration_results())


@app.route("/api/data/friction")
def get_friction():
    return jsonify(load_friction_results())


# --- Live Model API ---

@app.route("/api/query", methods=["POST"])
def query_model():
    data = request.get_json()
    model = data.get("model", "emp100")
    question = data.get("question", "")
    if not question:
        return jsonify({"error": "No question provided"}), 400

    response = send_prompt(model, question)
    confidence = extract_confidence(response)
    return jsonify({
        "model": model,
        "response": response,
        "confidence": confidence,
        "color": MODEL_COLORS.get(model, "#888"),
    })


@app.route("/api/query/parallel", methods=["POST"])
def query_parallel():
    data = request.get_json()
    models = data.get("models", [])
    question = data.get("question", "")
    if not question or not models:
        return jsonify({"error": "Need question and models"}), 400

    responses = send_parallel(models, question)
    results = {}
    for model, resp in responses.items():
        results[model] = {
            "response": resp,
            "confidence": extract_confidence(resp),
            "color": MODEL_COLORS.get(model, "#888"),
        }
    return jsonify(results)


# --- TTS API (Sarvam) ---

@app.route("/api/tts", methods=["POST"])
def text_to_speech():
    data = request.get_json()
    text = data.get("text", "")
    if not text:
        return jsonify({"error": "No text provided"}), 400

    resp = requests.post(
        "https://api.sarvam.ai/text-to-speech",
        headers={
            "api-subscription-key": SARVAM_API_KEY,
            "Content-Type": "application/json",
        },
        json={
            "text": text,
            "target_language_code": "en-IN",
            "speaker": "aditya",
            "model": "bulbul:v3",
            "pace": 1.0,
            "speech_sample_rate": 24000,
            "output_audio_codec": "mp3",
        },
    )

    if resp.status_code == 200:
        return jsonify(resp.json())
    else:
        return jsonify({"error": "TTS failed", "details": resp.text}), resp.status_code


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5050, debug=True)
