# The Epistemic Lens

**Does epistemic framing change how LLMs think — or just how they talk?**

An interactive research dashboard exploring whether philosophical system prompts (Rationalist, Empiricist, Pragmatist, Coherentist, Standpoint) alter an LLM's reasoning or merely its vocabulary. Built for the IMT 598 Epistemology course at the University of Washington.

**Live Demo**: [https://rahil911.duckdns.org:3901](https://rahil911.duckdns.org:3901)

![Dashboard Preview](https://img.shields.io/badge/Status-Live-brightgreen)

---

## The Research Question

We took one LLM ([NebulaOne](https://nebulaone-pilot.uw.edu/)) and gave it five different philosophical system prompts — epistemic "lenses." Then we ran four experiments to test whether these lenses change the model's actual reasoning or just its surface-level language.

### The Models

| Model | Epistemic Tradition | System Prompt Focus | Color |
|-------|-------------------|-------------------|-------|
| **Rationalist** | Rationalism | Trusts formal logic, deductive reasoning, a priori knowledge | `#636EFA` |
| **Empiricist** | Empiricism | Demands evidence, observation, data-driven conclusions | `#00CC96` |
| **Pragmatist** | Pragmatism | Prioritizes what works in practice, real-world utility | `#FFA15A` |
| **Coherentist** | Coherentism | Seeks internal consistency, mutual support between beliefs | `#AB63FA` |
| **Standpoint** | Standpoint Theory | Considers social context, power dynamics, situated knowledge | `#FF6692` |
| **Baseline** | None | Standard model with no epistemic framing | `#7F7F7F` |
| **emp100** | Empiricism (tuned) | The team's primary empiricist model used across all experiments | `#00CC96` |

All models share the same underlying LLM — the only difference is the system prompt. The `emp100` model is the AI Analysts team's empiricist model with an enhanced 100-word epistemic preamble.

### The NebulaOne Platform

Models are hosted on [NebulaOne Pilot](https://nebulaone-pilot.uw.edu/), the University of Washington's internal LLM platform. Each model is a public endpoint with SSE streaming — the dashboard queries them in real-time via a Flask backend proxy.

**API Pattern**: `POST` to `https://nebulaone-pilot.uw.edu/api/internal/publicConversations/byGptPublicEndpoint/<model_name>` with SSE streaming. Response chunks are base64-encoded in `response-updated` events.

---

## Four Experiments

### 1. Sycophancy Bench
Tests whether the model resists social pressure across four dimensions:
- **Delusion Resistance**: Does it push back on false claims?
- **Opinion Mirroring**: Does it parrot back the user's opinions?
- **Who Said It (Attribution Bias)**: Does it rate text differently based on who wrote it?
- **Pick a Side**: Can it maintain neutrality on controversial topics?

**Finding**: Strong on delusion resistance (evidence-based pushback), weak on mirroring and attribution. The empiricist frame changes *how* it pushes back (citing evidence) but doesn't eliminate social bias. **Style effect.**

### 2. Abstention Bench
100 false-premise questions from FalseQA (e.g., "How long does it take oysters to type?"). Does the model refuse to answer, or does it engage?

**Finding**: Baseline abstained 42% of the time. Empiricist model only 26%. But when the empiricist engages, it explains *why* the premise is wrong rather than just refusing. Same correctness, different packaging. **Style effect.**

### 3. Calibration
40 questions where the model reports its own confidence. How well does stated confidence predict actual accuracy?

**Finding**: When correct: 95.8% confidence. When wrong: 94.9% confidence. Less than 1 percentage point difference. The model is poorly calibrated regardless of epistemic framing. **Neither style nor substance.**

### 4. Friction Point
10 classic reasoning traps (base rate neglect, conjunction fallacy, Monty Hall, Simpson's paradox, etc.) designed to create disagreement between the five models.

**Finding**: All five models got 9/10 correct with near-identical reasoning. Zero differentiation. The only difference: the Rationalist says "by Bayes' theorem," the Empiricist says "studies consistently show," the Pragmatist says "in real-world applications." Same answer, different vocabulary. **Style effect.**

### Verdict

> **Epistemic framing changes how the model talks. It does not change how the model thinks.**

---

## Architecture

```
Browser
  → Flask (Python 3.10, port 5050)
    → NebulaOne SSE streaming (live model queries)
    → Sarvam AI TTS (voice narration for presentation mode)
    → Static data (CSV/JSON from experiments)
```

### Tech Stack
- **Backend**: Flask with python-dotenv
- **Frontend**: Vanilla JS, Plotly.js for charts
- **TTS**: [Sarvam AI](https://www.sarvam.ai/) text-to-speech (Indian English, `bulbul:v3` model)
- **LLM API**: NebulaOne SSE streaming with base64-encoded responses
- **Deployment**: PM2 on Linux, nginx reverse proxy with SSL

### Key Files

| File | Purpose |
|------|---------|
| `app.py` | Flask backend — routes for data, live model queries, TTS proxy |
| `nebula_api.py` | NebulaOne SSE streaming client, parallel model queries |
| `data_loader.py` | CSV/JSON data loading with LRU caching |
| `static/js/app.js` | Dashboard UI — charts, tabs, sidebar navigation, live queries |
| `static/js/presentation.js` | Cinematic presentation mode — 40-step guided experience with TTS |
| `static/css/style.css` | Dark theme styling, cinematic mode transitions |
| `templates/index.html` | Single-page dashboard with 7 sections |

---

## Cinematic Presentation Mode

A 40-step guided experience layered on top of the dashboard. Toggle with the "Present" button in the sidebar.

### Features
- **Voice narration**: Sarvam AI TTS with Indian English voice (speaker: `aditya`)
- **Progressive reveals**: UI elements appear step-by-step with CSS transitions
- **Keyboard controls**: `→`/`Space` next, `←` back, `P` pause, `Esc` exit
- **Interactive moments**: Live model demos mid-presentation
- **Auto-actions**: Automatic tab clicks, chart filters, dramatic examples
- **TTS preloading**: Next step's audio precomputed during current step
- **Character system**: Different narrators per section (Narrator, Empiricist, Oracle, etc.)

### Presentation Flow
1. **Opening** (4 steps) — Research question, model introductions, team credit
2. **Sycophancy** (8 steps) — Metric cards, radar chart, tab demos, live test
3. **Abstention** (6 steps) — Metrics, bar chart, dramatic oyster example
4. **Calibration** (7 steps) — Oracle game, two big numbers, box plot, confidently wrong examples
5. **Friction Point** (7 steps) — Question cards, heatmap, vocabulary analysis
6. **Arena** (3 steps) — Live audience Q&A with all models
7. **Verdict** (4 steps) — Evidence table, thesis, implications

---

## Setup

### Prerequisites
- Python 3.9+
- pip

### Install & Run

```bash
# Clone
git clone https://github.com/rahil911/epistemic-lens.git
cd epistemic-lens

# Install dependencies
pip install flask requests python-dotenv

# Configure environment (optional — only needed for TTS in presentation mode)
cp .env.example .env
# Edit .env with your Sarvam API key

# Run
python app.py
```

Open [http://localhost:5050](http://localhost:5050)

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SARVAM_API_KEY` | No (TTS only) | [Sarvam AI](https://www.sarvam.ai/) API key for voice narration |

The dashboard works fully without the TTS key — presentation mode will simply skip voice narration.

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Dashboard UI |
| `/api/models` | GET | List all 7 models with colors |
| `/api/data/sycophancy/<type>` | GET | Sycophancy results (delusion/mirror/pickside/whosaid) |
| `/api/data/sycophancy/questions/<type>` | GET | Raw question bank for each sycophancy test |
| `/api/data/abstention/results` | GET | 100 FalseQA results (baseline vs empiricist) |
| `/api/data/abstention/metrics` | GET | Aggregated abstention metrics |
| `/api/data/abstention/questions` | GET | FalseQA question bank |
| `/api/data/calibration` | GET | 40 calibration results with confidence scores |
| `/api/data/friction` | GET | 10 friction point results across all 5 models |
| `/api/query` | POST | Query a single model live (body: `{model, question}`) |
| `/api/query/parallel` | POST | Query multiple models in parallel (body: `{models[], question}`) |
| `/api/tts` | POST | Text-to-speech via Sarvam AI (body: `{text}`) |

---

## Team

**AI Analysts** — IMT 598 Epistemology, University of Washington (Winter 2026)

- Jenny
- Shreyas
- Sneha
- Rahil Harihar

**Epistemic Tradition**: Empiricism

---

## License

This project was built for academic research at the University of Washington. The experimental data, model configurations, and analysis are part of the IMT 598 Epistemology coursework.
