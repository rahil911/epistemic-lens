"""NebulaOne SSE streaming client for the Epistemic Lens dashboard."""

import requests
import base64
import uuid
import re
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

BASE_URL = "https://nebulaone-pilot.uw.edu/api/internal/publicConversations/byGptPublicEndpoint"

MODELS = {
    "Rationalist": f"{BASE_URL}/imt598wi26rationalist",
    "Empiricist": f"{BASE_URL}/imt598wi26empiricist",
    "Pragmatist": f"{BASE_URL}/imt598wi26pragmatist",
    "Coherentist": f"{BASE_URL}/imt598wi26coherentist",
    "Standpoint": f"{BASE_URL}/imt598wi26standpoint",
    "Baseline": f"{BASE_URL}/imt598baseline",
    "emp100": f"{BASE_URL}/emp100",
}

MODEL_COLORS = {
    "Rationalist": "#636EFA",
    "Empiricist": "#00CC96",
    "Pragmatist": "#FFA15A",
    "Coherentist": "#AB63FA",
    "Standpoint": "#FF6692",
    "Baseline": "#7F7F7F",
    "emp100": "#00CC96",
}

HEADERS = {
    "Content-Type": "application/json",
    "Accept": "text/event-stream",
    "Origin": "https://nebulaone-pilot.uw.edu",
    "Referer": "https://nebulaone-pilot.uw.edu/public-chat",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
}


def send_prompt(model_key, question, max_retries=2):
    url = MODELS.get(model_key)
    if not url:
        return f"[Unknown model: {model_key}]"

    for attempt in range(max_retries):
        try:
            session = requests.Session()
            session.headers.update(HEADERS)
            payload = {
                "question": question,
                "visionImageIds": [],
                "attachmentIds": [],
                "session": {"sessionIdentifier": str(uuid.uuid4())},
            }
            r = session.post(url, json=payload, stream=True, timeout=120)
            r.raise_for_status()

            full_response = ""
            current_event = None
            for line in r.iter_lines(decode_unicode=True):
                if not line:
                    continue
                if line.startswith("event: "):
                    current_event = line.replace("event: ", "").strip()
                    continue
                if line.startswith("data: "):
                    data = line[len("data: "):].strip()
                    if current_event == "response-updated":
                        try:
                            decoded = base64.b64decode(data).decode("utf-8")
                            full_response += decoded
                        except Exception:
                            pass
                    if current_event == "no-more-data":
                        break

            if full_response.strip():
                return full_response.strip()
            else:
                time.sleep(2)
        except Exception as e:
            if attempt < max_retries - 1:
                time.sleep(3)
            else:
                return f"[Error: {e}]"

    return "[No response received]"


def send_parallel(model_keys, question):
    results = {}
    with ThreadPoolExecutor(max_workers=len(model_keys)) as executor:
        future_to_model = {
            executor.submit(send_prompt, key, question): key
            for key in model_keys
        }
        for future in as_completed(future_to_model):
            model = future_to_model[future]
            try:
                results[model] = future.result()
            except Exception as e:
                results[model] = f"[Error: {e}]"
    return results


def extract_confidence(text):
    patterns = [
        r'[Cc]onfidence:\s*(\d+)\s*%',
        r'[Cc]onfidence\s+[Ll]evel:\s*(\d+)\s*%',
        r'(\d+)\s*%\s*confident',
        r'(\d+)%\s*$',
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            val = int(match.group(1))
            if 0 <= val <= 100:
                return val
    return None
