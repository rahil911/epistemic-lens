"""Playwright CLI-based tests for The Epistemic Lens dashboard."""

import pytest
import subprocess
import time
import requests
import sys
import os

# Add parent dir to path so we can import app modules for API tests
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

BASE_URL = "http://localhost:5050"


@pytest.fixture(scope="session", autouse=True)
def start_server():
    """Start Flask server before tests, stop after."""
    env = os.environ.copy()
    env["PYTHONPATH"] = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    proc = subprocess.Popen(
        [sys.executable, "app.py"],
        cwd=os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        stdout=subprocess.PIPE, stderr=subprocess.PIPE,
        env=env,
    )
    # Wait for server to be ready
    for _ in range(20):
        try:
            requests.get(BASE_URL, timeout=1)
            break
        except Exception:
            time.sleep(0.5)
    yield proc
    proc.terminate()
    proc.wait(timeout=5)


@pytest.fixture(scope="session")
def browser_context(browser):
    context = browser.new_context(viewport={"width": 1400, "height": 900})
    yield context
    context.close()


@pytest.fixture()
def page(browser_context):
    p = browser_context.new_page()
    p.goto(BASE_URL)
    p.wait_for_load_state("networkidle")
    yield p
    p.close()


# ==================== TEST 1: Homepage Loads ====================

def test_homepage_loads(page):
    """Verify the homepage loads with title, sidebar, and opening section."""
    assert page.title() == "The Epistemic Lens"

    # Sidebar present with 7 nav links
    nav_links = page.locator("#sidebar .sidebar-nav a")
    assert nav_links.count() == 7

    # Opening section is active
    opening = page.locator("#opening")
    assert opening.is_visible()

    # Hero question text
    hero = page.locator(".hero-question")
    assert "epistemic framing" in hero.inner_text().lower()

    # 5 model dots
    dots = page.locator(".model-dot")
    assert dots.count() == 5


# ==================== TEST 2: Sidebar Navigation ====================

def test_sidebar_navigation(page):
    """Click each sidebar link and verify section switching."""
    sections = ["opening", "sycophancy", "abstention", "calibration", "friction", "arena", "verdict"]

    for section in sections:
        link = page.locator(f'#sidebar .sidebar-nav a[data-section="{section}"]')
        link.click()
        page.wait_for_timeout(400)

        # Section should be visible
        sec_el = page.locator(f"#{section}")
        assert sec_el.is_visible(), f"Section {section} should be visible"

        # Link should be active
        assert "active" in link.get_attribute("class"), f"Link for {section} should be active"

        # Other sections should NOT be visible
        for other in sections:
            if other != section:
                assert not page.locator(f"#{other}").is_visible(), f"Section {other} should be hidden when {section} is active"


# ==================== TEST 3: Presenter Notes Toggle ====================

def test_presenter_notes_toggle(page):
    """Verify presenter notes toggle shows/hides notes."""
    # Notes hidden by default
    note = page.locator("#opening .presenter-note")
    assert not note.is_visible()

    # Toggle on
    page.locator("#presenterMode").check()
    page.wait_for_timeout(200)
    assert note.is_visible()

    # Toggle off
    page.locator("#presenterMode").uncheck()
    page.wait_for_timeout(200)
    assert not note.is_visible()


# ==================== TEST 4: Sycophancy Page ====================

def test_sycophancy_page(page):
    """Verify sycophancy section renders with data."""
    page.locator('#sidebar .sidebar-nav a[data-section="sycophancy"]').click()
    page.wait_for_timeout(3000)  # Wait for data fetch + chart render

    # 4 metric cards
    cards = page.locator("#syco-scorecard .metric-card")
    assert cards.count() == 4

    # Metric values are populated (not empty)
    first_value = cards.first.locator(".metric-value").inner_text()
    assert first_value != "" and first_value != "--"

    # Radar chart rendered (Plotly creates svg inside the container)
    page.wait_for_timeout(1000)
    radar = page.locator("#syco-radar-chart svg")
    assert radar.count() > 0

    # Tab switching
    tabs = ["syco-delusion", "syco-mirror", "syco-whosaid", "syco-pickside"]
    for tab in tabs:
        page.locator(f'#syco-tabs button[data-tab="{tab}"]').click()
        page.wait_for_timeout(300)
        assert page.locator(f"#{tab}").is_visible()

    # Live test elements exist
    assert page.locator("#syco-live-input").is_visible()
    assert page.get_by_role("button", name="Send to emp100", exact=True).is_visible()


# ==================== TEST 5: Abstention Page ====================

def test_abstention_page(page):
    """Verify abstention section renders with metrics and comparison."""
    page.locator('#sidebar .sidebar-nav a[data-section="abstention"]').click()
    page.wait_for_timeout(3000)

    # Metric cards rendered
    cards = page.locator("#abst-metrics .metric-card")
    assert cards.count() == 4

    # Check key values are in the page
    metrics_text = page.locator("#abst-metrics").inner_text()
    assert "42" in metrics_text  # Baseline abstention
    assert "26" in metrics_text  # emp100 abstention

    # Bar chart
    chart = page.locator("#abst-bar-chart svg")
    assert chart.count() > 0

    # "Show dramatic example" button
    btn = page.get_by_role("button", name="Show dramatic example")
    assert btn.is_visible()
    btn.click()
    page.wait_for_timeout(500)

    # Comparison cards should show
    comparison = page.locator("#abst-comparison .response-card")
    assert comparison.count() == 2

    # Live test elements
    assert page.locator("#abst-live-input").is_visible()


# ==================== TEST 6: Calibration Page ====================

def test_calibration_page(page):
    """Verify calibration section renders with charts and data."""
    page.locator('#sidebar .sidebar-nav a[data-section="calibration"]').click()
    page.wait_for_timeout(1500)

    # The two big numbers
    correct_val = page.locator("#cal-correct-val").inner_text()
    incorrect_val = page.locator("#cal-incorrect-val").inner_text()
    assert "%" in correct_val
    assert "%" in incorrect_val

    # Box plot
    boxplot = page.locator("#cal-boxplot svg")
    assert boxplot.count() > 0

    # Histogram
    histogram = page.locator("#cal-histogram svg")
    assert histogram.count() > 0

    # Question dropdown populated
    options = page.locator("#cal-question-select option")
    assert options.count() == 40

    # "Show confidently wrong" button
    btn = page.get_by_role("button", name="confidently wrong")
    assert btn.is_visible()
    btn.click()
    page.wait_for_timeout(300)

    # Detail card should show
    detail = page.locator("#cal-question-detail .card")
    assert detail.count() > 0

    # Live test elements
    assert page.locator("#cal-live-input").is_visible()


# ==================== TEST 7: Friction Point Page ====================

def test_friction_page(page):
    """Verify friction point heatmap and question details."""
    page.locator('#sidebar .sidebar-nav a[data-section="friction"]').click()
    page.wait_for_timeout(1500)

    # 10 question cards in grid
    q_cards = page.locator("#friction-questions-grid .card")
    assert q_cards.count() == 10

    # Heatmap table: 10 data rows
    rows = page.locator("#friction-heatmap tbody tr")
    assert rows.count() == 10

    # Count green cells (Logic) — should be 45 (9 correct x 5 models)
    green_cells = page.locator("#friction-heatmap .heatmap-logic")
    assert green_cells.count() == 45

    # Count yellow cells (Other) — should be 5 (Simpson's Paradox x 5 models)
    yellow_cells = page.locator("#friction-heatmap .heatmap-other")
    assert yellow_cells.count() == 5

    # Question detail dropdown has 10 options
    options = page.locator("#friction-question-select option")
    assert options.count() == 10

    # Select a question and check response cards
    page.locator("#friction-question-select").select_option(index=0)
    page.wait_for_timeout(300)
    detail_cards = page.locator("#friction-detail-cards .response-card")
    assert detail_cards.count() == 5

    # Confidence chart
    conf_chart = page.locator("#friction-confidence-chart svg")
    assert conf_chart.count() > 0

    # Model checkboxes (5 by default)
    checkboxes = page.locator("#friction-model-checkboxes input[type='checkbox']")
    assert checkboxes.count() == 5

    # Live test elements
    assert page.locator("#friction-live-input").is_visible()


# ==================== TEST 8: Arena Page ====================

def test_arena_page(page):
    """Verify arena page has all interactive elements."""
    page.locator('#sidebar .sidebar-nav a[data-section="arena"]').click()
    page.wait_for_timeout(3000)

    # Textarea
    assert page.locator("#arena-input").is_visible()

    # Model checkboxes (7 total)
    checkboxes = page.locator("#arena-model-checkboxes input[type='checkbox']")
    assert checkboxes.count() == 7

    # 5 should be checked by default
    checked = page.locator("#arena-model-checkboxes input[type='checkbox']:checked")
    assert checked.count() == 5

    # Run button
    assert page.locator("#arena-run-btn").is_visible()

    # Confidence checkbox
    assert page.locator("#arena-confidence").is_visible()

    # 3 pre-loaded tabs
    tabs = page.locator("#arena-tabs button")
    assert tabs.count() == 3

    # Load a preset question — wait for data to load first
    page.locator('#arena-tabs button[data-tab="arena-preload-bias"]').click()
    page.wait_for_timeout(500)
    # Wait until select is populated (has more than 0 options)
    page.wait_for_function("document.getElementById('arena-bias-select').options.length > 0", timeout=5000)
    page.locator("#arena-bias-select").select_option(index=0)
    page.locator("#arena-preload-bias button").click()
    page.wait_for_timeout(300)

    # Textarea should be filled with question text
    val = page.locator("#arena-input").input_value()
    assert len(val) > 10


# ==================== TEST 9: Verdict Page ====================

def test_verdict_page(page):
    """Verify verdict page has summary table, thesis, and implications."""
    page.locator('#sidebar .sidebar-nav a[data-section="verdict"]').click()
    page.wait_for_timeout(400)

    # Summary table with 4 data rows
    rows = page.locator(".verdict-table tbody tr")
    assert rows.count() == 4

    # 3 Style tags + 1 Neither tag
    style_tags = page.locator(".verdict-style")
    neither_tags = page.locator(".verdict-neither")
    assert style_tags.count() == 3
    assert neither_tags.count() == 1

    # Thesis text
    thesis = page.locator(".thesis-main").inner_text()
    assert "talks" in thesis.lower()
    assert "thinks" in thesis.lower()

    # 3 implication cards
    impl_cards = page.locator(".implication-card")
    assert impl_cards.count() == 3


# ==================== TEST 10: Data API Endpoints ====================

def test_data_api_models():
    """Test /api/models returns all 7 models."""
    r = requests.get(f"{BASE_URL}/api/models")
    data = r.json()
    assert len(data) == 7
    assert "Rationalist" in data
    assert "color" in data["Rationalist"]


def test_data_api_sycophancy():
    """Test sycophancy data endpoint."""
    r = requests.get(f"{BASE_URL}/api/data/sycophancy/delusion")
    data = r.json()
    assert len(data) == 5
    assert "statement" in data[0]
    assert "score" in data[0]


def test_data_api_abstention_metrics():
    """Test abstention metrics endpoint."""
    r = requests.get(f"{BASE_URL}/api/data/abstention/metrics")
    data = r.json()
    assert "Baseline" in data
    assert "Epistemic (emp100)" in data
    assert data["Baseline"]["abstention_rate"] == 42.0


def test_data_api_calibration():
    """Test calibration data endpoint."""
    r = requests.get(f"{BASE_URL}/api/data/calibration")
    data = r.json()
    assert len(data) == 40
    assert "confidence" in data[0]
    assert "classification" in data[0]


def test_data_api_friction():
    """Test friction results endpoint."""
    r = requests.get(f"{BASE_URL}/api/data/friction")
    data = r.json()
    assert len(data) == 10
    assert "Rationalist_response" in data[0]
    assert "Empiricist_confidence" in data[0]


def test_data_api_abstention_questions():
    """Test FalseQA questions endpoint."""
    r = requests.get(f"{BASE_URL}/api/data/abstention/questions")
    data = r.json()
    assert len(data) == 100
