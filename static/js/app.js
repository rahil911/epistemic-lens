/* The Epistemic Lens — Frontend Logic */

const MODEL_COLORS = {
    Rationalist: '#636EFA', Empiricist: '#00CC96', Pragmatist: '#FFA15A',
    Coherentist: '#AB63FA', Standpoint: '#FF6692', Baseline: '#7F7F7F', emp100: '#00CC96'
};

const MODEL_PERSONAS = {
    Rationalist: '"I trust logic and reason above all. If the math checks out, that\'s my answer."',
    Empiricist: '"Show me the data. I only believe what observation and evidence can support."',
    Pragmatist: '"I care about what works in practice. Theory is nice, but results matter more."',
    Coherentist: '"I look for the story that fits together best. Truth is what\'s most consistent."',
    Standpoint: '"Who\'s asking matters. I consider the social context and lived experience behind every question."',
    Baseline: '"I\'m the control — no philosophical lens, just the default model responding as-is."',
    emp100: '"I\'m the Empiricist with the system prompt cranked to max. Evidence is everything."',
};

const DARK_LAYOUT = {
    paper_bgcolor: '#13131a', plot_bgcolor: '#13131a',
    font: { color: '#e8e8ed', family: 'Inter, sans-serif', size: 13 },
    margin: { l: 50, r: 30, t: 40, b: 40 },
};

const PLOTLY_CONFIG = { displayModeBar: false, responsive: true };

// Cache for loaded data
const DATA = {};
const SECTION_LOADED = {};

// ==================== NAVIGATION ====================

document.querySelectorAll('#sidebar .sidebar-nav a').forEach(link => {
    link.addEventListener('click', () => {
        if (document.body.classList.contains('cinematic-mode')) return;
        const section = link.dataset.section;
        showSection(section);
    });
});

async function showSection(sectionId) {
    document.querySelectorAll('#sidebar .sidebar-nav a').forEach(a => a.classList.remove('active'));
    const link = document.querySelector(`#sidebar .sidebar-nav a[data-section="${sectionId}"]`);
    if (link) link.classList.add('active');

    document.querySelectorAll('main section').forEach(s => s.classList.remove('active'));
    const section = document.getElementById(sectionId);
    if (section) section.classList.add('active');

    if (!SECTION_LOADED[sectionId]) {
        await initSection(sectionId);
        SECTION_LOADED[sectionId] = true;
    }
}

async function initSection(section) {
    if (section === 'sycophancy') await initSycophancy();
    else if (section === 'abstention') await initAbstention();
    else if (section === 'calibration') await initCalibration();
    else if (section === 'friction') await initFriction();
    else if (section === 'arena') await initArena();
}

// Expose functions for presentation.js
window.showSection = showSection;
window.initSycophancy = initSycophancy;
window.initAbstention = initAbstention;
window.initCalibration = initCalibration;
window.initFriction = initFriction;
window.initArena = initArena;

// Tab switching (generic)
document.addEventListener('click', e => {
    if (e.target.matches('.tab-bar button')) {
        const bar = e.target.closest('.tab-bar');
        bar.querySelectorAll('button').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        const tabId = e.target.dataset.tab;
        const parent = bar.parentElement;
        parent.querySelectorAll(':scope > .tab-content').forEach(tc => tc.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
    }
});

function togglePresenter() {
    document.body.classList.toggle('presenter-mode', document.getElementById('presenterMode').checked);
}

// ==================== DATA FETCHING ====================

async function fetchData(endpoint) {
    if (DATA[endpoint]) return DATA[endpoint];
    const res = await fetch('/api/data/' + endpoint);
    const data = await res.json();
    DATA[endpoint] = data;
    return data;
}

async function queryModel(model, question) {
    const res = await fetch('/api/query', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, question })
    });
    return res.json();
}

async function queryParallel(models, question) {
    const res = await fetch('/api/query/parallel', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ models, question })
    });
    return res.json();
}

// ==================== SYCOPHANCY ====================

async function initSycophancy() {
    const [delusion, mirror, pickside, whosaid] = await Promise.all([
        fetchData('sycophancy/delusion'), fetchData('sycophancy/mirror'),
        fetchData('sycophancy/pickside'), fetchData('sycophancy/whosaid'),
    ]);

    // Compute averages
    const avgDelusion = avg(delusion.map(r => parseFloat(r.score)));
    const avgMirrorShift = avg(mirror.map(r => Math.abs(parseFloat(r.score2) - parseFloat(r.score1))));
    const avgPickside = avg(pickside.map(r => parseFloat(r.score1)));
    const avgWhosaid = avg(whosaid.map(r => Math.abs(parseFloat(r.score_self) - parseFloat(r.score_other))));

    // Scorecard
    const sc = document.getElementById('syco-scorecard');
    sc.innerHTML = [
        metricCard('Delusion Resistance', avgDelusion.toFixed(2) + '/5', 'badge-strong', 'Strong'),
        metricCard('Mirroring Shift', avgMirrorShift.toFixed(2), 'badge-moderate', 'Moderate'),
        metricCard('Picking Sides Bias', avgPickside.toFixed(2), 'badge-weak', 'Weak'),
        metricCard('Attribution Bias', avgWhosaid.toFixed(2), 'badge-weak', 'Weak'),
    ].join('');

    // Radar chart
    const radarData = [{
        type: 'scatterpolar', r: [avgDelusion, avgMirrorShift, avgPickside, avgWhosaid, avgDelusion],
        theta: ['Delusion\nResistance', 'Mirroring\nShift', 'Picking Sides\nBias', 'Attribution\nBias', 'Delusion\nResistance'],
        fill: 'toself', fillcolor: 'rgba(0,204,150,0.1)',
        line: { color: '#00CC96', width: 2 },
        marker: { size: 6, color: '#00CC96' }
    }];
    Plotly.newPlot('syco-radar-chart', radarData, {
        ...DARK_LAYOUT, polar: {
            bgcolor: '#13131a',
            radialaxis: { visible: true, range: [0, 5], color: '#555', gridcolor: '#2a2a3a' },
            angularaxis: { color: '#8888a0', gridcolor: '#2a2a3a' }
        }, showlegend: false, title: { text: 'Sycophancy Profile (emp100)', font: { size: 14, color: '#8888a0' } }
    }, PLOTLY_CONFIG);

    // Populate dropdowns
    populateSelect('syco-delusion-select', delusion.map((r, i) => ({ value: i, text: truncate(r.statement, 80) })));
    populateSelect('syco-mirror-select', mirror.map((r, i) => ({ value: i, text: r.topic })));
    populateSelect('syco-whosaid-select', whosaid.map((r, i) => ({ value: i, text: truncate(r.statement, 80) })));
    populateSelect('syco-pickside-select', pickside.map((r, i) => ({ value: i, text: truncate(r.statement1, 60) + ' vs. ...' })));

    // Pre-load live question dropdown
    const qBank = await fetchData('sycophancy/questions/delusion');
    populateSelect('syco-live-preload', qBank.map((q, i) => ({ value: q.statement, text: truncate(q.statement, 80) })), true);

    showSycoResult('delusion');
}

function showSycoResult(type) {
    const data = DATA['sycophancy/' + type];
    const idx = parseInt(document.getElementById('syco-' + type + '-select').value);
    const r = data[idx];
    const container = document.getElementById('syco-' + type + '-result');

    if (type === 'delusion') {
        container.innerHTML = `
            ${questionSpotlight('Delusional statement given to the model', r.statement)}
            <div class="card">
                <div class="gauge-container mb-20">
                    <span class="text-sm text-muted">Acceptance:</span>
                    <div class="gauge-bar"><div class="gauge-fill" style="width:${parseFloat(r.score)/5*100}%;background:${parseFloat(r.score) > 2.5 ? '#FF4D6A' : '#00CC96'}"></div></div>
                    <span class="gauge-value">${r.score}/5</span>
                </div>
                <details><summary class="text-sm" style="cursor:pointer;color:var(--accent)">Read full response</summary><p class="text-muted text-sm" style="margin-top:8px;white-space:pre-wrap">${r.response}</p></details>
            </div>`;
    } else if (type === 'whosaid') {
        container.innerHTML = `
            ${questionSpotlight('Same statement — told to model twice with different attribution', r.statement)}
            <div class="card-row cols-2">
                <div class="response-card" style="border-top:3px solid #00CC96">
                    <div class="response-header"><span class="model-badge" style="background:rgba(0,204,150,0.15);color:#00CC96">Told: "You wrote this"</span><span class="gauge-value" style="color:#00CC96">${r.score_self}/5</span></div>
                    <div class="response-body">${truncate(r.response_self, 400)}</div>
                </div>
                <div class="response-card" style="border-top:3px solid #7F7F7F">
                    <div class="response-header"><span class="model-badge" style="background:rgba(127,127,127,0.15);color:#7F7F7F">Told: "Someone online wrote this"</span><span class="gauge-value" style="color:#FF4D6A">${r.score_other}/5</span></div>
                    <div class="response-body">${truncate(r.response_other, 400)}</div>
                </div>
            </div>
            <div class="insight">Same text, different attribution. Score difference: <strong>${(parseFloat(r.score_self) - parseFloat(r.score_other)).toFixed(1)} points</strong>.</div>`;
    } else if (type === 'mirror') {
        container.innerHTML = `
            ${questionSpotlight('Topic given to the model with two opposite stances', r.topic)}
            <div class="card-row cols-2">
                <div class="response-card" style="border-top:3px solid #636EFA">
                    <div class="response-header"><span>Stance 1</span><span class="gauge-value">${r.score1}/5</span></div>
                    <div class="response-body">${truncate(r.response1, 400)}</div>
                </div>
                <div class="response-card" style="border-top:3px solid #FFA15A">
                    <div class="response-header"><span>Stance 2</span><span class="gauge-value">${r.score2}/5</span></div>
                    <div class="response-body">${truncate(r.response2, 400)}</div>
                </div>
            </div>`;
    } else if (type === 'pickside') {
        container.innerHTML = `
            ${questionSpotlight('Two opposing opinions — model was asked to pick a side', r.statement1 + '<br><span style="color:var(--text-muted);font-size:0.85rem">vs.</span><br>' + r.statement2)}
            <div class="card-row cols-2">
                <div class="response-card" style="border-top:3px solid #636EFA">
                    <div class="response-header"><span>Response to Statement 1</span><span class="gauge-value">${r.score1}</span></div>
                    <div class="response-body">${truncate(r.response1, 400)}</div>
                </div>
                <div class="response-card" style="border-top:3px solid #FFA15A">
                    <div class="response-header"><span>Response to Statement 2</span><span class="gauge-value">${r.score2}</span></div>
                    <div class="response-body">${truncate(r.response2, 400)}</div>
                </div>
            </div>`;
    }
}

async function runSycoLive() {
    const q = document.getElementById('syco-live-input').value.trim();
    if (!q) return;
    const container = document.getElementById('syco-live-result');
    container.innerHTML = loadingHTML('Querying emp100...');
    const result = await queryModel('emp100', q);
    container.innerHTML = responseCardHTML('emp100', result.response, result.confidence);
}

// ==================== ABSTENTION ====================

async function initAbstention() {
    const [metrics, results, questions] = await Promise.all([
        fetchData('abstention/metrics'), fetchData('abstention/results'), fetchData('abstention/questions'),
    ]);

    // Metric cards
    const b = metrics['Baseline'];
    const e = metrics['Epistemic (emp100)'];
    document.getElementById('abst-metrics').innerHTML = [
        metricCard('Baseline Abstention', b.abstention_rate + '%', 'badge-moderate', ''),
        metricCard('emp100 Abstention', e.abstention_rate + '%', 'badge-strong', '-16pp'),
        metricCard('Baseline Accuracy', b.accuracy_answerable + '%', 'badge-strong', ''),
        metricCard('emp100 Accuracy', e.accuracy_answerable + '%', 'badge-moderate', ''),
    ].join('');

    // Bar chart
    const barData = [
        { x: ['Abstention Rate', 'False Answer Rate', 'Accuracy', 'Overall Abstention'],
          y: [b.abstention_rate, b.false_answer_rate, b.accuracy_answerable, b.overall_abstention],
          name: 'Baseline', marker: { color: '#7F7F7F' }, type: 'bar' },
        { x: ['Abstention Rate', 'False Answer Rate', 'Accuracy', 'Overall Abstention'],
          y: [e.abstention_rate, e.false_answer_rate, e.accuracy_answerable, e.overall_abstention],
          name: 'emp100', marker: { color: '#00CC96' }, type: 'bar' },
    ];
    Plotly.newPlot('abst-bar-chart', barData, { ...DARK_LAYOUT, barmode: 'group',
        title: { text: 'Baseline vs emp100 on FalseQA', font: { size: 14, color: '#8888a0' } },
        yaxis: { title: '%', gridcolor: '#2a2a3a' }, xaxis: { gridcolor: '#2a2a3a' }
    }, PLOTLY_CONFIG);

    // Populate question dropdown (only false premise questions)
    const falseQs = results.filter((r, i) => {
        const q = questions[i];
        return q && q.label === '1';
    });
    populateSelect('abst-question-select', results.map((r, i) => ({
        value: i, text: truncate(r.question, 80)
    })));

    showAbstComparison();
}

function showAbstComparison() {
    const results = DATA['abstention/results'];
    const idx = parseInt(document.getElementById('abst-question-select').value);
    const r = results[idx];
    document.getElementById('abst-comparison').innerHTML = `
        ${questionSpotlight('False-premise question asked to both models', r.question)}
        <div class="response-card" style="border-top:3px solid #7F7F7F">
            <div class="response-header">
                ${modelBadgeHTML('Baseline')}
                <span class="status-badge ${r.baseline_abstained === 'True' ? 'status-abstained' : 'status-answered'}">${r.baseline_abstained === 'True' ? 'Abstained' : 'Answered'}</span>
            </div>
            <div class="response-body">${r.baseline_response}</div>
        </div>
        <div class="response-card" style="border-top:3px solid #00CC96">
            <div class="response-header">
                ${modelBadgeHTML('emp100')}
                <span class="status-badge ${r.epistemic_abstained === 'True' ? 'status-abstained' : 'status-answered'}">${r.epistemic_abstained === 'True' ? 'Abstained' : 'Answered'}</span>
            </div>
            <div class="response-body">${r.epistemic_response}</div>
        </div>`;
}

function showDramaticExample() {
    const results = DATA['abstention/results'];
    const dramatic = results.findIndex(r => r.baseline_abstained === 'True' && r.epistemic_abstained === 'False');
    if (dramatic >= 0) {
        document.getElementById('abst-question-select').value = dramatic;
        showAbstComparison();
    }
}

async function runAbstLive() {
    const q = document.getElementById('abst-live-input').value.trim();
    if (!q) return;
    const container = document.getElementById('abst-live-result');
    container.innerHTML = `
        <div class="response-card"><div class="response-header"><span>Baseline</span></div><div class="response-body">${loadingHTML('Querying...')}</div></div>
        <div class="response-card"><div class="response-header"><span>emp100</span></div><div class="response-body">${loadingHTML('Querying...')}</div></div>`;
    const results = await queryParallel(['Baseline', 'emp100'], q);
    container.innerHTML = `
        <div class="response-card" style="border-top:3px solid #7F7F7F">
            <div class="response-header">${modelBadgeHTML('Baseline')}</div>
            <div class="response-body">${results.Baseline ? results.Baseline.response : 'No response'}</div>
        </div>
        <div class="response-card" style="border-top:3px solid #00CC96">
            <div class="response-header">${modelBadgeHTML('emp100')}</div>
            <div class="response-body">${results.emp100 ? results.emp100.response : 'No response'}</div>
        </div>`;
}

// ==================== CALIBRATION ====================

async function initCalibration() {
    const data = await fetchData('calibration');

    const correct = data.filter(r => r.classification === 'Correct');
    const incorrect = data.filter(r => r.classification === 'Incorrect');
    const abstain = data.filter(r => r.classification === 'Abstain');

    const avgCorrect = avg(correct.map(r => parseFloat(r.confidence)));
    const avgIncorrect = avg(incorrect.map(r => parseFloat(r.confidence)));

    document.getElementById('cal-correct-val').textContent = avgCorrect.toFixed(1) + '%';
    document.getElementById('cal-incorrect-val').textContent = avgIncorrect.toFixed(1) + '%';

    // Box plot
    const boxData = [
        { y: correct.map(r => parseFloat(r.confidence)), name: `Correct (n=${correct.length})`,
          type: 'box', marker: { color: '#00CC96' }, boxpoints: 'all', jitter: 0.4, pointpos: -1.5 },
        { y: incorrect.map(r => parseFloat(r.confidence)), name: `Incorrect (n=${incorrect.length})`,
          type: 'box', marker: { color: '#FF4D6A' }, boxpoints: 'all', jitter: 0.4, pointpos: -1.5 },
        { y: abstain.map(r => parseFloat(r.confidence)), name: `Abstain (n=${abstain.length})`,
          type: 'box', marker: { color: '#FFA15A' }, boxpoints: 'all', jitter: 0.4, pointpos: -1.5 },
    ];
    Plotly.newPlot('cal-boxplot', boxData, {
        ...DARK_LAYOUT, title: { text: 'Confidence Distribution by Correctness', font: { size: 14, color: '#8888a0' } },
        yaxis: { title: 'Confidence %', range: [80, 102], gridcolor: '#2a2a3a' }, showlegend: false,
    }, PLOTLY_CONFIG);

    // Histogram
    const histData = [
        { x: correct.map(r => parseFloat(r.confidence)), name: 'Correct', marker: { color: 'rgba(0,204,150,0.6)' }, type: 'histogram', nbinsx: 15 },
        { x: incorrect.map(r => parseFloat(r.confidence)), name: 'Incorrect', marker: { color: 'rgba(255,77,106,0.6)' }, type: 'histogram', nbinsx: 15 },
    ];
    Plotly.newPlot('cal-histogram', histData, {
        ...DARK_LAYOUT, barmode: 'overlay',
        title: { text: 'Confidence Histogram', font: { size: 14, color: '#8888a0' } },
        xaxis: { title: 'Confidence %', gridcolor: '#2a2a3a' }, yaxis: { title: 'Count', gridcolor: '#2a2a3a' },
    }, PLOTLY_CONFIG);

    // Question dropdown
    populateSelect('cal-question-select', data.map((r, i) => ({
        value: i, text: `[${r.classification}] ${truncate(r.question, 70)}`
    })));

    showCalQuestion();
}

function showCalQuestion() {
    const data = DATA['calibration'];
    const idx = parseInt(document.getElementById('cal-question-select').value);
    const r = data[idx];
    const conf = parseFloat(r.confidence);
    const color = r.classification === 'Correct' ? '#00CC96' : r.classification === 'Incorrect' ? '#FF4D6A' : '#FFA15A';
    document.getElementById('cal-question-detail').innerHTML = `
        ${questionSpotlight('Question asked to emp100', r.question)}
        <div class="card">
            <div class="flex-between mb-20">
                <span class="status-badge status-${r.classification.toLowerCase()}">${r.classification}</span>
                <span class="text-sm text-muted">Label: ${r.label === '1' ? 'False Premise' : 'Answerable'}</span>
            </div>
            <div class="gauge-container mb-20">
                <span class="text-sm text-muted">Confidence:</span>
                <div class="gauge-bar"><div class="gauge-fill" style="width:${conf}%;background:${color}"></div></div>
                <span class="gauge-value" style="color:${color}">${conf}%</span>
            </div>
            <details open><summary class="text-sm" style="cursor:pointer;color:var(--accent)">Model response</summary><p class="text-muted text-sm" style="margin-top:8px;white-space:pre-wrap">${r.response}</p></details>
        </div>`;
}

function filterConfidentlyWrong() {
    const data = DATA['calibration'];
    const sel = document.getElementById('cal-question-select');
    const wrongIdx = data.findIndex(r => r.classification === 'Incorrect' && parseFloat(r.confidence) > 90);
    if (wrongIdx >= 0) { sel.value = wrongIdx; showCalQuestion(); }
}

async function runCalLive() {
    const q = document.getElementById('cal-live-input').value.trim();
    if (!q) return;
    const container = document.getElementById('cal-live-result');
    container.innerHTML = loadingHTML('Querying emp100 with confidence scoring...');
    const prompt = q + '\n\nFormat your response ending with:\nConfidence: [0-100]%';
    const result = await queryModel('emp100', prompt);
    const conf = result.confidence || 0;
    const color = '#00CC96';
    container.innerHTML = `
        <div class="card">
            <div class="gauge-container mb-20">
                <span class="text-sm text-muted">Reported Confidence:</span>
                <div class="gauge-bar"><div class="gauge-fill" style="width:${conf}%;background:${color}"></div></div>
                <span class="gauge-value" style="color:${color}">${conf}%</span>
            </div>
            <div class="response-card"><div class="response-header">${modelBadgeHTML('emp100')}</div>
            <div class="response-body">${result.response}</div></div>
        </div>`;
}

// ==================== ORACLE GAME ====================

let oracleState = { round: 1, score: 0, maxRounds: 5, questions: [], currentQ: null, isComplete: false };

async function initOracleGame() {
    const data = await fetchData('calibration');
    const shuffle = arr => arr.sort(() => 0.5 - Math.random());
    const incorrect = shuffle(data.filter(r => r.classification === 'Incorrect')).slice(0, 3);
    const correct = shuffle(data.filter(r => r.classification === 'Correct')).slice(0, 5 - incorrect.length);
    oracleState.questions = shuffle([...incorrect, ...correct]);
    oracleState.round = 1;
    oracleState.score = 0;
    oracleState.isComplete = false;
    // Ensure renderOracleRound is defined or called later; it's safe here as function is hoisted or defined in same scope
}

function startOracleGame() {
    document.getElementById('oracle-intro').style.display = 'none';
    document.getElementById('oracle-stage').style.display = 'block';
    renderOracleRound();
}

function renderOracleRound() {
    if (oracleState.round > oracleState.maxRounds) { return endOracleGame(); }
    const q = oracleState.questions[oracleState.round - 1];
    oracleState.currentQ = q;
    
    document.getElementById('oracle-round').textContent = oracleState.round;
    document.getElementById('oracle-score').textContent = oracleState.score;
    document.getElementById('oracle-q').textContent = q.question;
    document.getElementById('oracle-a').textContent = q.response;
    document.getElementById('oracle-conf').textContent = Math.round(parseFloat(q.confidence)) + '%';
    
    document.getElementById('oracle-controls').style.display = 'flex';
    document.getElementById('oracle-feedback').style.display = 'none';
    document.getElementById('oracle-next-btn').style.display = 'none';
    
    // Reset Avatar
    const avatar = document.getElementById('oracle-avatar');
    avatar.textContent = '🤖';
    avatar.style.transform = 'scale(1)';
    document.getElementById('oracle-mood').textContent = 'Confident';
    document.getElementById('oracle-mood').className = 'text-xs text-muted mt-10';
}

function oracleGuess(choice) {
    const q = oracleState.currentQ;
    const isModelCorrect = q.classification === 'Correct';
    const isUserRight = (choice === 'Trust' && isModelCorrect) || (choice === 'Doubt' && !isModelCorrect);
    
    if (isUserRight) oracleState.score++;
    document.getElementById('oracle-score').textContent = oracleState.score;
    
    const fb = document.getElementById('oracle-feedback');
    fb.style.display = 'block';
    document.getElementById('oracle-controls').style.display = 'none';
    document.getElementById('oracle-next-btn').style.display = 'block';
    
    const avatar = document.getElementById('oracle-avatar');
    const mood = document.getElementById('oracle-mood');
    
    if (isUserRight) {
        fb.style.background = 'rgba(0, 204, 150, 0.15)'; fb.style.color = '#00CC96';
        if (isModelCorrect) {
            fb.innerHTML = '<strong>Correct!</strong> The model was right.';
            avatar.textContent = '😎'; mood.textContent = 'VALIDATED'; mood.className = 'text-xs mt-10 text-success';
        } else {
            fb.innerHTML = '<strong>GOTCHA!</strong> The model was CONFIDENT but WRONG.';
            avatar.textContent = '😰'; mood.textContent = 'EXPOSED'; mood.className = 'text-xs mt-10 text-danger';
            avatar.style.transform = 'scale(0.9) rotate(10deg)';
        }
    } else {
        fb.style.background = 'rgba(255, 77, 106, 0.15)'; fb.style.color = '#FF4D6A';
        if (isModelCorrect) {
            fb.innerHTML = '<strong>Oops!</strong> The model was actually right.';
            avatar.textContent = '🤷'; mood.textContent = 'MISUNDERSTOOD'; mood.className = 'text-xs mt-10 text-muted';
        } else {
            fb.innerHTML = '<strong>YOU GOT FOOLED!</strong> It was WRONG despite high confidence.';
            avatar.textContent = '😈'; mood.textContent = 'DECEPTIVE'; mood.className = 'text-xs mt-10 text-warning';
            avatar.style.transform = 'scale(1.1)';
        }
    }
}

function nextOracleRound() {
    oracleState.round++;
    renderOracleRound();
}

function endOracleGame() {
    document.getElementById('oracle-stage').style.display = 'none';
    document.getElementById('oracle-summary').style.display = 'block';
    document.getElementById('oracle-final-score').textContent = `${oracleState.score}/5`;
    const txt = document.getElementById('oracle-summary-text');
    if (oracleState.score >= 4) txt.textContent = "You saw through the illusion of confidence! High scores mean nothing if uncalibrated.";
    else txt.textContent = "See how easy it is to be fooled? The model sounds sure of itself even when hallucinating.";
}

function revealOracleStats() {
    document.getElementById('calibration-stats').style.display = 'block';
    document.getElementById('oracle-game-container').style.display = 'none';
    window.dispatchEvent(new Event('resize'));
}

// ==================== FRICTION POINT ====================

async function initFriction() {
    const data = await fetchData('friction');
    const models = ['Rationalist', 'Empiricist', 'Pragmatist', 'Coherentist', 'Standpoint'];

    // Questions grid — full text, clickable
    const grid = document.getElementById('friction-questions-grid');
    grid.innerHTML = data.map((q, i) => `
        <div class="card friction-q-card ${i === 0 ? 'friction-q-active' : ''}" data-idx="${i}" style="padding:16px;cursor:pointer;transition:border-color 0.2s" onclick="selectFrictionQ(${i})">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
                <span class="text-sm" style="color:var(--accent);font-weight:600">Q${q.id}: ${q.category.replace(/_/g, ' ')}</span>
                <span class="text-sm text-muted" style="font-style:italic">${q.conflict_type}</span>
            </div>
            <p class="text-sm" style="color:#c8c8d0;line-height:1.5;margin:0">${q.question}</p>
        </div>`).join('');

    // Heatmap table
    const table = document.getElementById('friction-heatmap');
    let html = '<thead><tr><th style="text-align:left">Question</th>';
    models.forEach(m => { html += `<th style="color:${MODEL_COLORS[m]}">${m}</th>`; });
    html += '</tr></thead><tbody>';
    data.forEach(q => {
        html += `<tr><td class="q-label" style="max-width:320px"><strong>Q${q.id}</strong> ${truncate(q.question, 90)}</td>`;
        models.forEach(m => {
            const cls = q[m + '_classification'];
            const conf = q[m + '_confidence'];
            const cssClass = cls === 'Logic' ? 'heatmap-logic' : cls === 'Other' ? 'heatmap-other' : 'heatmap-intuition';
            html += `<td class="${cssClass}">${conf}%</td>`;
        });
        html += '</tr>';
    });
    html += '</tbody>';
    table.innerHTML = html;

    // Show first question detail
    showFrictionDetail(0);

    // Confidence spread chart (Q10)
    const q10 = data[9]; // regression_to_mean
    const confData = [{
        x: models, y: models.map(m => q10[m + '_confidence']),
        type: 'bar',
        marker: { color: models.map(m => MODEL_COLORS[m]) },
    }];
    Plotly.newPlot('friction-confidence-chart', confData, {
        ...DARK_LAYOUT,
        title: { text: 'Q10 (Regression to Mean) — Confidence Spread', font: { size: 14, color: '#8888a0' } },
        yaxis: { title: 'Confidence %', range: [80, 100], gridcolor: '#2a2a3a' },
        xaxis: { gridcolor: '#2a2a3a' }, showlegend: false,
    }, PLOTLY_CONFIG);

    // Pre-loaded questions for live test
    const preloaded = data.map(q => ({ value: q.question, text: `Q${q.id}: ${q.category.replace(/_/g, ' ')}` }));
    preloaded.push({ value: "A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost? (A) $0.10 (B) $0.05 (C) $0.50 (D) $0.01", text: "Extra: Bat and Ball" });
    preloaded.push({ value: "If it takes 5 machines 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets? (A) 100 minutes (B) 5 minutes (C) 20 minutes (D) 1 minute", text: "Extra: Widgets" });
    populateSelect('friction-live-preload', preloaded, true);

    // Model checkboxes
    renderModelCheckboxes('friction-model-checkboxes', models);
}

function selectFrictionQ(idx) {
    document.querySelectorAll('.friction-q-card').forEach(c => c.classList.remove('friction-q-active'));
    document.querySelector(`.friction-q-card[data-idx="${idx}"]`).classList.add('friction-q-active');
    showFrictionDetail(idx);
    document.getElementById('friction-detail-cards').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showFrictionDetail(idx) {
    const data = DATA['friction'];
    const q = data[idx];
    const models = ['Rationalist', 'Empiricist', 'Pragmatist', 'Coherentist', 'Standpoint'];
    const container = document.getElementById('friction-detail-cards');

    // Show selected question prominently at top
    let html = questionSpotlight(
        'Q' + q.id + ': ' + q.category.replace(/_/g, ' ') + ' — <span style="font-weight:400;color:var(--text-secondary)">' + q.conflict_type + '</span>',
        q.question
    );

    // Model response cards
    html += '<div class="card-row cols-5">';
    html += models.map(m => {
        const cls = q[m + '_classification'];
        const conf = q[m + '_confidence'];
        const color = MODEL_COLORS[m];
        const badgeClass = cls === 'Logic' ? 'status-correct' : 'status-incorrect';
        return `<div class="response-card" style="border-top:3px solid ${color}">
            <div class="response-header">
                <span class="model-badge" style="background:${color}22;color:${color}"><span class="dot" style="background:${color}"></span> ${m}</span>
                <span class="status-badge ${badgeClass}">${cls} ${conf}%</span>
            </div>
            <div class="response-body">${truncate(q[m + '_response'], 500)}</div>
        </div>`;
    }).join('');
    html += '</div>';
    container.innerHTML = html;
}

async function runFrictionLive() {
    const q = document.getElementById('friction-live-input').value.trim();
    if (!q) return;
    const models = getCheckedModels('friction-model-checkboxes');
    if (models.length === 0) return;
    const container = document.getElementById('friction-live-result');
    container.innerHTML = loadingHTML(`Querying ${models.length} models in parallel...`);
    const prompt = q + '\n\nInstructions:\n1. Answer by selecting the best option and explain your reasoning.\n2. Give a confidence score (0-100%).\n\nFormat your response ending with:\nConfidence: [0-100]%';
    const results = await queryParallel(models, prompt);
    container.innerHTML = '<div class="card-row cols-' + Math.min(models.length, 5) + '">' +
        models.map(m => {
            const r = results[m] || {};
            const color = MODEL_COLORS[m];
            return responseCardHTML(m, r.response || 'No response', r.confidence);
        }).join('') + '</div>';
}

// ==================== LIVE ARENA ====================

async function initArena() {
    const allModels = ['Rationalist', 'Empiricist', 'Pragmatist', 'Coherentist', 'Standpoint', 'Baseline', 'emp100'];
    const defaultOn = ['Rationalist', 'Empiricist', 'Pragmatist', 'Coherentist', 'Standpoint'];
    renderModelCheckboxes('arena-model-checkboxes', allModels, defaultOn);

    // Load presets
    const [sycoQs, falseQs, frictionData] = await Promise.all([
        fetchData('sycophancy/questions/delusion'),
        fetchData('abstention/questions'),
        fetchData('friction'),
    ]);

    populateSelect('arena-syco-select', sycoQs.map((q, i) => ({ value: q.statement, text: truncate(q.statement, 80) })));
    populateSelect('arena-false-select', falseQs.filter(q => q.label === '1').map((q, i) => ({ value: q.question, text: truncate(q.question, 80) })));
    populateSelect('arena-bias-select', frictionData.map(q => ({ value: q.question, text: `Q${q.id}: ${q.category.replace(/_/g, ' ')}` })));
}

function loadArenaPreset(selectId) {
    const val = document.getElementById(selectId).value;
    document.getElementById('arena-input').value = val;
}

async function runArena() {
    const q = document.getElementById('arena-input').value.trim();
    if (!q) return;
    const models = getCheckedModels('arena-model-checkboxes');
    if (models.length === 0) return;

    const addConf = document.getElementById('arena-confidence').checked;
    const prompt = addConf ? q + '\n\nFormat your response ending with:\nConfidence: [0-100]%' : q;

    const container = document.getElementById('arena-results');
    container.innerHTML = loadingHTML(`Querying ${models.length} models in parallel...`);
    document.getElementById('arena-run-btn').disabled = true;

    const results = await queryParallel(models, prompt);
    document.getElementById('arena-run-btn').disabled = false;

    const cols = Math.min(models.length, 5);
    let html = questionSpotlight('Question sent to ' + models.length + ' models', q);
    html += '<div class="card-row cols-' + cols + '">';
    models.forEach(m => {
        const r = results[m] || {};
        html += responseCardHTML(m, r.response || 'No response', r.confidence);
    });
    html += '</div>';

    // Quick analysis
    const responses = models.map(m => (results[m] || {}).response || '');
    const confidences = models.map(m => (results[m] || {}).confidence).filter(c => c !== null && c !== undefined);

    html += '<div class="card mt-20"><h4 style="margin-bottom:12px">Quick Analysis</h4>';
    html += `<p class="text-sm text-muted">Models queried: ${models.length}</p>`;
    if (confidences.length > 0) {
        const avgConf = avg(confidences);
        const spread = Math.max(...confidences) - Math.min(...confidences);
        html += `<p class="text-sm text-muted">Avg confidence: ${avgConf.toFixed(1)}% | Spread: ${spread} pp</p>`;
    }
    const wordCounts = models.map((m, i) => `${m}: ${responses[i].split(/\s+/).length} words`);
    html += `<p class="text-sm text-muted">Word counts: ${wordCounts.join(' | ')}</p>`;
    html += '</div>';

    container.innerHTML = html;
}

// ==================== HELPERS ====================

function avg(arr) {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function truncate(s, n) {
    if (!s) return '';
    return s.length > n ? s.slice(0, n) + '...' : s;
}

function metricCard(label, value, badgeClass, badgeText) {
    const badge = badgeText ? `<span class="metric-badge ${badgeClass}">${badgeText}</span>` : '';
    return `<div class="metric-card"><div class="metric-label">${label}</div><div class="metric-value">${value}</div>${badge}</div>`;
}

function loadingHTML(msg) {
    return `<div class="loading"><div class="loading-dots"><span></span><span></span><span></span></div>${msg}</div>`;
}

function modelBadgeHTML(model, extraStyle) {
    const color = MODEL_COLORS[model] || '#888';
    const persona = MODEL_PERSONAS[model] || '';
    const tip = persona ? ` data-tooltip="${persona.replace(/"/g, '&quot;')}"` : '';
    return `<span class="model-badge has-tooltip" style="background:${color}22;color:${color};${extraStyle || ''}"${tip}><span class="dot" style="background:${color}"></span> ${model}</span>`;
}

function responseCardHTML(model, response, confidence) {
    const color = MODEL_COLORS[model] || '#888';
    let confHTML = '';
    if (confidence !== null && confidence !== undefined) {
        confHTML = `<div class="gauge-container" style="margin-top:12px; padding:0 16px 12px">
            <span class="text-sm text-muted">Confidence:</span>
            <div class="gauge-bar"><div class="gauge-fill" style="width:${confidence}%;background:${color}"></div></div>
            <span class="gauge-value" style="color:${color}">${confidence}%</span>
        </div>`;
    }
    return `<div class="response-card" style="border-top:3px solid ${color}">
        <div class="response-header">
            ${modelBadgeHTML(model)}
        </div>
        <div class="response-body">${response}</div>
        ${confHTML}
    </div>`;
}

function questionSpotlight(label, text) {
    return `<div class="question-spotlight">
        <div class="question-spotlight-label">${label}</div>
        <div class="question-spotlight-text">${text}</div>
    </div>`;
}

function populateSelect(id, options, keepFirst) {
    const sel = document.getElementById(id);
    const start = keepFirst ? 1 : 0;
    if (!keepFirst) sel.innerHTML = '';
    options.forEach(o => {
        const opt = document.createElement('option');
        opt.value = o.value;
        opt.textContent = o.text;
        sel.appendChild(opt);
    });
}

function renderModelCheckboxes(containerId, models, defaultOn) {
    if (!defaultOn) defaultOn = models;
    const container = document.getElementById(containerId);
    container.innerHTML = models.map(m => {
        const color = MODEL_COLORS[m];
        const checked = defaultOn.includes(m) ? 'checked' : '';
        const checkedClass = defaultOn.includes(m) ? 'checked' : '';
        return `<label class="checkbox-pill ${checkedClass}" style="--pill-color:${color};${defaultOn.includes(m) ? 'border-color:' + color : ''}" onclick="togglePill(this, '${color}')">
            <input type="checkbox" value="${m}" ${checked}>
            <span class="dot" style="background:${color}"></span>${m}
        </label>`;
    }).join('');
}

function togglePill(el, color) {
    const cb = el.querySelector('input');
    setTimeout(() => {
        if (cb.checked) {
            el.classList.add('checked');
            el.style.borderColor = color;
        } else {
            el.classList.remove('checked');
            el.style.borderColor = '';
        }
    }, 0);
}

function getCheckedModels(containerId) {
    const checks = document.querySelectorAll('#' + containerId + ' input[type="checkbox"]:checked');
    return Array.from(checks).map(c => c.value);
}
