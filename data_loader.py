"""Load all experimental data from CSV/JSON files."""

import json
import csv
import os
from functools import lru_cache

_DIR = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(_DIR, "data")


def _read_csv(path):
    rows = []
    with open(path, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(dict(row))
    return rows


def _read_json(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


@lru_cache(maxsize=None)
def load_sycophancy(bench_type):
    path = os.path.join(DATA, "syco-bench", f"AIAnalysts_emp100_sycobench_{bench_type}_results.csv")
    return _read_csv(path)


@lru_cache(maxsize=None)
def load_question_bank(bench_type):
    path = os.path.join(DATA, "syco-bench", "questions", f"{bench_type}.csv")
    return _read_csv(path)


@lru_cache(maxsize=None)
def load_abstention_results():
    path = os.path.join(DATA, "milestone7", "AIAnalysts_emp100_abstentionbench_results.csv")
    return _read_csv(path)


@lru_cache(maxsize=None)
def load_abstention_metrics():
    path = os.path.join(DATA, "milestone7", "metrics.json")
    return _read_json(path)


@lru_cache(maxsize=None)
def load_falseqa_questions():
    path = os.path.join(DATA, "milestone7", "falseqa_subset_100.csv")
    return _read_csv(path)


@lru_cache(maxsize=None)
def load_calibration_results():
    path = os.path.join(DATA, "milestone8", "milestone8_optionE_results.csv")
    return _read_csv(path)


FRICTION_QUESTIONS = {
    1: "A disease affects 1 in 10,000 people. A test for the disease is 99% accurate (1% false positive rate). A random person tests positive. What is the probability they actually have the disease? (A) About 99% (B) About 50% (C) About 1% (D) About 0.01%",
    2: "Linda is 31, single, outspoken, and very bright. She majored in philosophy. As a student, she was deeply concerned with issues of discrimination and social justice. Which is more probable? (A) Linda is a bank teller (B) Linda is a bank teller and is active in the feminist movement",
    3: "You bought a non-refundable $500 ski trip ticket. Later you bought a non-refundable $200 ski trip ticket to a different resort you think you'd enjoy MORE. You then realize both trips are on the same weekend. Which trip should you go on? (A) The $500 trip (B) The $200 trip",
    4: "A fair coin has been flipped 9 times and landed heads each time. What is the probability the 10th flip will be heads? (A) Less than 50% (B) Exactly 50% (C) More than 50% (D) It depends on the coin's momentum",
    5: "Alice is taller than Bob. Bob is shorter than Charlie. Is Alice taller than Charlie? (A) Yes (B) No (C) Cannot be determined from the information given",
    6: "Study of WWII bombers: planes returning from missions had bullet holes clustered on the wings and fuselage, but few on the engines. Where should you add armor? (A) Wings and fuselage where the holes are (B) The engines where there are few holes",
    7: "You're on a game show with 3 doors. Behind one is a car; behind the others, goats. You pick door 1. The host, who knows what's behind the doors, opens door 3 to reveal a goat. Should you switch to door 2? (A) Yes, switching gives you a 2/3 chance (B) No, it doesn't matter, it's 50/50 (C) No, you should stick with your original choice",
    8: "Hospital A has a 90% surgery success rate overall but handles 80% major surgeries. Hospital B has an 85% success rate overall but handles 30% major surgeries. When you look at the data: Hospital A has higher success rates in BOTH major AND minor surgery categories. Which hospital is better? (A) Hospital A (B) Hospital B (C) Cannot determine without more information",
    9: "A study finds that cities with more ice cream sales also have more drowning incidents. What should we conclude? (A) Ice cream causes drowning (B) Drowning causes ice cream sales (C) A confounding variable likely explains both (D) Ice cream and drowning are unrelated",
    10: "A basketball player scores 45 points in one game (his season average is 20). A coach praises him effusively. In the next game he scores 18 points. Did the praise cause the decline? (A) Yes, the praise made him overconfident (B) No, this is likely regression to the mean (C) More data is needed",
}


@lru_cache(maxsize=None)
def load_friction_results():
    path = os.path.join(DATA, "milestone9", "milestone9_track4_results.json")
    data = _read_json(path)
    for item in data:
        item["question"] = FRICTION_QUESTIONS.get(item.get("id"), "")
    return data


@lru_cache(maxsize=None)
def load_friction_csv():
    path = os.path.join(DATA, "milestone9", "AIAnalysts_M9_Track4_results.csv")
    return _read_csv(path)
