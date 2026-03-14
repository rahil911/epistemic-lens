/* The Epistemic Lens — Cinematic Presentation Engine
   Voice: Sarvam AI TTS (aditya, Indian male)
   Controls: → Next, ← Back, P Pause, Esc Exit
*/

const CinematicPresentation = (() => {

    // --- Characters ---
    const CHARS = {
        narrator:     { avatar: '🏛️', color: '#e8e8ed' },
        empiricist:   { avatar: '🔍', color: '#00CC96' },
        rationalist:  { avatar: '🧙‍♂️', color: '#636EFA' },
        pragmatist:   { avatar: '🛠️', color: '#FFA15A' },
        coherentist:  { avatar: '🕸️', color: '#AB63FA' },
        standpoint:   { avatar: '👥', color: '#FF6692' },
        oracle:       { avatar: '🔮', color: '#AB63FA' },
    };

    // --- Steps ---
    const STEPS = [
        // ===== OPENING (0-3) =====
        {
            section: 'opening', reveal: ['hero'], char: 'narrator',
            narration: "Does epistemic framing change how large language models think... or just how they talk? That's the question we set out to answer this quarter.",
        },
        {
            section: 'opening', reveal: ['models'], char: 'narrator',
            narration: "We took one large language model and gave it five different philosophical lenses. A Rationalist that trusts logic. An Empiricist that demands evidence. A Pragmatist that cares about what works. A Coherentist that seeks consistency. And a Standpoint theorist that considers social context.",
            preload: 'sycophancy',
        },
        {
            section: 'opening', reveal: ['team'], char: 'narrator',
            narration: "We're the A.I. Analysts — Jenny, Shreyas, Sneha, and Rahil.",
        },
        {
            section: 'opening', reveal: ['setup'], char: 'narrator',
            narration: "Across four experiments, we asked one question: does the lens change the answer? Let's look at the evidence.",
        },

        // ===== SYCOPHANCY (4-11) =====
        {
            section: 'sycophancy', reveal: ['syco-intro'], char: 'empiricist',
            narration: "First experiment: sycophancy. Does the model resist social pressure, or does it tell you what you want to hear?",
        },
        {
            section: 'sycophancy', reveal: ['syco-metrics'], char: 'empiricist',
            narration: "We ran four tests. Delusion resistance was strong — the model pushed back on false claims. But mirroring and attribution bias were weak.",
        },
        {
            section: 'sycophancy', reveal: ['syco-radar'], char: 'empiricist',
            narration: "This radar chart shows the asymmetry. Strong on one axis, weak on three. The model resists when evidence contradicts, but caves to social pressure.",
        },
        {
            section: 'sycophancy', reveal: ['syco-tabs', 'syco-content'], char: 'empiricist',
            narration: "Here's a delusional statement we gave the model. Notice it scores low — it refuses to accept claims that contradict evidence.",
            autoAction: () => {
                const btn = document.querySelector('#syco-tabs button[data-tab="syco-delusion"]');
                if (btn) btn.click();
                setTimeout(() => { if (typeof showSycoResult === 'function') showSycoResult('delusion'); }, 100);
            },
        },
        {
            section: 'sycophancy', char: 'empiricist',
            narration: "Now here's the dramatic one. We gave the exact same text twice — once saying 'you wrote this,' once saying 'someone online wrote this.' The model rated the user's version 2.6 points higher. Same words, different treatment.",
            autoAction: () => {
                const btn = document.querySelector('#syco-tabs button[data-tab="syco-whosaid"]');
                if (btn) btn.click();
                setTimeout(() => { if (typeof showSycoResult === 'function') showSycoResult('whosaid'); }, 100);
            },
        },
        {
            section: 'sycophancy', char: 'empiricist',
            narration: "The takeaway: the empiricist frame makes the model cite evidence when pushing back on delusions. But it doesn't make it immune to flattery. This is a style effect.",
        },
        {
            section: 'sycophancy', reveal: ['syco-live'], char: 'narrator',
            narration: "Let me show you live. I'll send a sycophantic question to the model right now.",
            interactive: true,
        },
        {
            section: 'sycophancy', char: 'narrator',
            narration: "So the model sounds different, but does it know when to stay quiet? Let's find out.",
            preload: 'abstention',
        },

        // ===== ABSTENTION (12-18) =====
        {
            section: 'abstention', reveal: ['abs-intro'], char: 'rationalist',
            narration: "Experiment two: abstention. We asked 100 false-premise questions — things like 'How long does it take oysters to type?' Does the model refuse to answer, or does it engage?",
        },
        {
            section: 'abstention', reveal: ['abs-metrics'], char: 'rationalist',
            narration: "Baseline abstained 42% of the time. The empiricist model? Only 26%. Sixteen percentage points less likely to stay quiet.",
        },
        {
            section: 'abstention', reveal: ['abs-comparison'], char: 'rationalist',
            narration: "Let's look at specific examples side by side.",
        },
        {
            section: 'abstention', char: 'rationalist',
            narration: "Here's the reveal. Same question, two responses. The baseline says 'Oysters can't type.' The empiricist says 'An oyster has no fingers, no keyboard, no means of typing at all...' Same correctness. Completely different engagement.",
            autoAction: () => { if (typeof showDramaticExample === 'function') showDramaticExample(); },
        },
        {
            section: 'abstention', char: 'rationalist',
            narration: "Notice the empiricist doesn't refuse — it explains. It treats the question as an opportunity to demonstrate evidence-based reasoning.",
        },
        {
            section: 'abstention', reveal: ['abs-live'], char: 'narrator',
            narration: "Again: style, not substance. The answer is the same. The packaging is different.",
            preload: 'calibration',
        },

        // ===== CALIBRATION (19-25) =====
        {
            section: 'calibration', reveal: ['cal-intro'], char: 'oracle',
            narration: "Experiment three: calibration. We asked the model to report its own confidence. But first — a challenge. Can you tell when the model is wrong?",
        },
        {
            section: 'calibration', reveal: ['cal-game'], char: 'oracle',
            narration: "Let's play The Oracle's Challenge. I'll show you the model's answer and confidence. You decide: trust it, or doubt it?",
            interactive: true,
            autoAction: () => {
                document.getElementById('oracle-game-container').style.display = '';
                document.getElementById('calibration-stats').style.display = 'none';
                if (typeof initOracleGame === 'function') initOracleGame();
                if (typeof startOracleGame === 'function') startOracleGame();
            },
        },
        {
            section: 'calibration', char: 'oracle',
            narration: "Now let's see the real data.",
            autoAction: () => {
                if (typeof revealOracleStats === 'function') revealOracleStats();
                setTimeout(() => window.dispatchEvent(new Event('resize')), 400);
            },
        },
        {
            section: 'calibration', char: 'oracle',
            narration: "When the model is correct: 95.8% confidence. When it's wrong: 94.9%. Less than one percentage point difference.",
        },
        {
            section: 'calibration', char: 'oracle',
            narration: "The box plot makes it visceral. The distributions completely overlap.",
        },
        {
            section: 'calibration', char: 'oracle',
            narration: "Here's a question where it's wrong but 98% confident.",
            autoAction: () => { if (typeof filterConfidentlyWrong === 'function') filterConfidentlyWrong(); },
        },
        {
            section: 'calibration', char: 'oracle',
            narration: "Calibration verdict: neither style nor substance. The frame doesn't help here at all.",
            preload: 'friction',
        },

        // ===== FRICTION POINT (26-32) =====
        {
            section: 'friction', reveal: ['fric-intro'], char: 'standpoint',
            narration: "Final experiment. The grand finale. We designed 10 questions specifically to create friction between the five models. Questions where logic and intuition pull in opposite directions.",
        },
        {
            section: 'friction', reveal: ['fric-grid'], char: 'standpoint',
            narration: "Base rate neglect — where people ignore how rare a disease is. The conjunction fallacy — where 'bank teller and feminist' seems more likely than just 'bank teller.' Sunk cost — throwing good money after bad. The gambler's fallacy — thinking a coin is 'due' for tails. The Monty Hall problem — where switching doors doubles your odds. Ten classic reasoning traps. If the philosophical frames matter, this is where they'd disagree.",
        },
        {
            section: 'friction', reveal: ['fric-heatmap'], char: 'standpoint',
            narration: "And here are the results. Green means logic won. Look at this wall of green. All five models. Nine out of ten correct. Zero differentiation.",
        },
        {
            section: 'friction', char: 'standpoint',
            narration: "We went looking for disagreement. There is none. Five philosophical lenses, one answer.",
        },
        {
            section: 'friction', reveal: ['fric-detail'], char: 'standpoint',
            narration: "Let me zoom into one. Base rate neglect. All five models get it right. But listen to the language. The Rationalist says 'by Bayes' theorem.' The Empiricist says 'studies consistently show.' The Pragmatist says 'in real-world applications.' Same answer. Different vocabulary.",
            autoAction: () => { if (typeof selectFrictionQ === 'function') selectFrictionQ(0); },
        },
        {
            section: 'friction', reveal: ['fric-confidence'], char: 'standpoint',
            narration: "Even the confidence spread tells the same story. Slight variation in how sure they are, but the conclusion is identical.",
        },
        {
            section: 'friction', char: 'narrator',
            narration: "This is the pattern of the entire quarter. The model doesn't think differently. It talks differently.",
            preload: 'arena',
        },

        // ===== ARENA (33-35) =====
        {
            section: 'arena', reveal: ['arena-intro'], char: 'narrator',
            narration: "Now it's your turn. This is the live arena. You can ask any question to any combination of the professor's models and watch them respond in real time.",
        },
        {
            section: 'arena', reveal: ['arena-interface'], char: 'narrator',
            narration: "Does anyone have a question they'd like to test? Or I can pick one from our presets.",
            interactive: true,
        },
        {
            section: 'arena', char: 'narrator',
            narration: "Notice the pattern. Different words, same conclusion. That's been the story all quarter.",
        },

        // ===== VERDICT (36-39) =====
        {
            section: 'verdict', reveal: ['verdict-summary'], char: 'narrator',
            narration: "Let's bring it all together. We ran four experiments. In sycophancy, the model changed how it pushed back, but not whether it caved — that's a style effect. In abstention, it explained instead of refusing, but got the same answers — style again. Calibration showed no improvement at all — the framing didn't help. And in the friction point, all five lenses gave the same answer. Three out of four: style. One: neither.",
        },
        {
            section: 'verdict', reveal: ['verdict-thesis'], char: 'narrator',
            narration: "Epistemic framing changes how the model talks. It does not change how the model thinks.",
        },
        {
            section: 'verdict', reveal: ['verdict-implications'], char: 'narrator',
            narration: "Three implications. One: system prompts are a cosmetic layer, not a cognitive transformation. Two: all five lenses converge when training data provides a clear answer. Three: the friction point we sought doesn't exist at the prompt level.",
        },
        {
            section: 'verdict', char: 'narrator',
            narration: "The model learns to sound like an empiricist. It does not learn to be one. Thank you.",
        },
    ];

    // --- State ---
    let stepIndex = -1;
    let active = false;
    let currentAudio = null;
    let currentSection = null;
    let serial = 0;
    const audioCache = {};

    // --- TTS (Sarvam via Flask proxy) ---

    // Audio served as pre-generated static MP3 files — no API calls needed
    async function preloadAudio(idx) {
        if (idx < 0 || idx >= STEPS.length) return;
        if (audioCache[idx]) return;
        if (!STEPS[idx].narration) return;
        const url = `/static/audio/step_${String(idx).padStart(2, '0')}.mp3`;
        try {
            const res = await fetch(url);
            if (res.ok) {
                const blob = await res.blob();
                audioCache[idx] = URL.createObjectURL(blob);
            }
        } catch (e) {
            console.warn('Audio preload error:', e);
        }
    }

    function playAudio(idx) {
        return new Promise(resolve => {
            const url = audioCache[idx];
            if (!url) {
                setStatus('ready', 'No Audio');
                resolve();
                return;
            }
            const a = new Audio(url);
            a.playbackRate = 1.75;
            currentAudio = a;
            setStatus('speaking', 'Speaking');
            a.onended = a.onerror = () => {
                currentAudio = null;
                setStatus('ready', 'Ready');
                resolve();
            };
            a.play().catch(() => {
                currentAudio = null;
                setStatus('ready', 'Ready');
                resolve();
            });
        });
    }

    function stopAudio() {
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0;
            currentAudio = null;
        }
    }

    function togglePause() {
        if (!currentAudio) return;
        if (currentAudio.paused) {
            currentAudio.play();
            setStatus('speaking', 'Speaking');
        } else {
            currentAudio.pause();
            setStatus('ready', 'Paused');
        }
    }

    // --- Navigation ---

    async function goToStep(idx) {
        if (idx < 0 || idx >= STEPS.length) return;
        const mySerial = ++serial;
        stopAudio();
        stepIndex = idx;
        const step = STEPS[idx];

        // Switch section if needed
        if (step.section !== currentSection) {
            currentSection = step.section;
            if (typeof showSection === 'function') {
                await showSection(step.section);
            }
            document.querySelector('main').scrollTop = 0;
        }

        // Reveal logic: un-reveal all in this section, then re-reveal up to current step
        const sectionEl = document.getElementById(step.section);
        if (sectionEl) {
            sectionEl.querySelectorAll('.pres-step').forEach(el => el.classList.remove('revealed'));
            const toReveal = new Set();
            for (let i = 0; i <= idx; i++) {
                if (STEPS[i].section === step.section && STEPS[i].reveal) {
                    STEPS[i].reveal.forEach(id => toReveal.add(id));
                }
            }
            toReveal.forEach(id => {
                const el = sectionEl.querySelector(`[data-step="${id}"]`) || document.getElementById(id);
                if (el) el.classList.add('revealed');
            });
            // Scroll to the last newly revealed element
            if (step.reveal && step.reveal.length > 0) {
                const lastId = step.reveal[step.reveal.length - 1];
                const lastEl = sectionEl.querySelector(`[data-step="${lastId}"]`) || document.getElementById(lastId);
                if (lastEl) setTimeout(() => lastEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 150);
            }
        }

        // Update UI
        updateProgress();
        setNarration(step.narration || '');
        setChar(step.char || 'narrator');
        syncState('speaking');

        // Auto-action (with serial check)
        if (step.autoAction && mySerial === serial) {
            setTimeout(() => { if (mySerial === serial) step.autoAction(); }, 300);
        }

        // Preload next section data
        if (step.preload && typeof SECTION_LOADED !== 'undefined' && !SECTION_LOADED[step.preload]) {
            if (typeof initSection === 'function') {
                initSection(step.preload);
                SECTION_LOADED[step.preload] = true;
            }
        }

        // Preload ahead aggressively (fire-and-forget)
        for (let ahead = 1; ahead <= 5; ahead++) preloadAudio(idx + ahead);

        // Speak — never block the step on audio loading
        if (step.narration && mySerial === serial) {
            if (audioCache[idx]) {
                // Audio ready — play immediately
                await playAudio(idx);
            } else {
                // Audio not ready — load and play in background, don't block
                setStatus('ready', 'Loading audio...');
                preloadAudio(idx).then(() => {
                    if (mySerial !== serial) return; // user already moved on
                    playAudio(idx).then(() => {
                        if (mySerial !== serial) return;
                        if (STEPS[stepIndex] && STEPS[stepIndex].interactive) {
                            setStatus('interactive', 'Interactive');
                            syncState('interactive');
                        } else {
                            syncState('ready');
                        }
                    });
                });
                return; // don't fall through to post-speech status below
            }
        }

        // Post-speech status (only reached if audio was cached and played synchronously)
        if (mySerial === serial && step.interactive) {
            setStatus('interactive', 'Interactive');
            syncState('interactive');
        } else if (mySerial === serial) {
            syncState('ready');
        }
    }

    function next() { if (stepIndex < STEPS.length - 1) goToStep(stepIndex + 1); }
    function prev() { if (stepIndex > 0) goToStep(stepIndex - 1); }

    // --- UI Helpers ---

    function updateProgress() {
        const fill = document.getElementById('pres-progress-fill');
        if (fill) fill.style.width = `${((stepIndex + 1) / STEPS.length) * 100}%`;
    }

    function setNarration(text) {
        const el = document.getElementById('pres-narration-text');
        if (el) el.textContent = text;
    }

    function setChar(key) {
        const c = CHARS[key] || CHARS.narrator;
        const el = document.getElementById('pres-char-avatar');
        if (el) {
            el.textContent = c.avatar;
            el.style.borderColor = c.color;
            el.classList.add('active-speaker');
        }
    }

    function setStatus(state, label) {
        const dot = document.getElementById('pres-status-dot');
        const lbl = document.getElementById('pres-status-label');
        if (dot) dot.className = state === 'speaking' ? 'speaking' : state === 'interactive' ? 'interactive' : '';
        if (lbl) lbl.textContent = label;
    }

    // --- Index drawer ---

    const SEC_NAMES = {
        opening: 'Opening', sycophancy: 'Sycophancy', abstention: 'Abstention',
        calibration: 'Calibration', friction: 'Friction Point', arena: 'Arena', verdict: 'Verdict',
    };
    let indexBuilt = false;

    function buildIndex() {
        const list = document.getElementById('pres-index-list');
        if (!list || indexBuilt) return;
        indexBuilt = true;
        list.innerHTML = '';
        let lastSection = '';
        STEPS.forEach((s, i) => {
            if (s.section !== lastSection) {
                lastSection = s.section;
                const h = document.createElement('div');
                h.className = 'pres-idx-section';
                h.dataset.sec = s.section;
                h.textContent = SEC_NAMES[s.section] || s.section;
                list.appendChild(h);
            }
            const row = document.createElement('div');
            row.className = 'pres-idx-step';
            row.dataset.idx = i;
            row.onclick = () => { goToStep(i); toggleIndex(); };

            const num = document.createElement('span');
            num.className = 'pres-idx-num';
            num.textContent = i + 1;

            const txt = document.createElement('span');
            txt.style.flex = '1';
            const preview = (s.narration || '').length > 90 ? s.narration.slice(0, 90) + '...' : (s.narration || '(no narration)');
            txt.textContent = preview;

            row.appendChild(num);
            row.appendChild(txt);

            if (s.interactive) {
                const badge = document.createElement('span');
                badge.className = 'pres-idx-interactive';
                badge.textContent = 'Live';
                row.appendChild(badge);
            }
            list.appendChild(row);
        });
    }

    function toggleIndex() {
        const drawer = document.getElementById('pres-index-drawer');
        if (!drawer) return;
        buildIndex();
        drawer.classList.toggle('open');
        if (drawer.classList.contains('open')) highlightIndexStep();
    }

    function highlightIndexStep() {
        const list = document.getElementById('pres-index-list');
        if (!list) return;
        list.querySelectorAll('.pres-idx-step').forEach(el => el.classList.remove('is-current'));
        const cur = list.querySelector(`.pres-idx-step[data-idx="${stepIndex}"]`);
        if (cur) {
            cur.classList.add('is-current');
            cur.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
    }

    // --- Keyboard ---

    function onKey(e) {
        if (!active) return;
        switch (e.key) {
            case 'ArrowRight': case ' ':
                e.preventDefault(); next(); break;
            case 'ArrowLeft':
                e.preventDefault(); prev(); break;
            case 'p': case 'P':
                e.preventDefault(); togglePause(); break;
            case 'i': case 'I':
                e.preventDefault(); toggleIndex(); break;
            case 'Escape':
                if (document.getElementById('pres-index-drawer')?.classList.contains('open')) {
                    e.preventDefault(); toggleIndex();
                } else {
                    e.preventDefault(); stop();
                }
                break;
        }
    }

    // --- Start / Stop ---

    async function start() {
        active = true;
        stepIndex = -1;
        currentSection = null;

        document.body.classList.add('cinematic-mode');
        document.getElementById('pres-overlay').classList.remove('hidden');
        document.querySelectorAll('.pres-step.revealed').forEach(el => el.classList.remove('revealed'));

        document.addEventListener('keydown', onKey);

        // Batch preload first 6 steps (all fire-and-forget, no blocking)
        for (let i = 0; i < 6; i++) preloadAudio(i);

        goToStep(0);
    }

    function stop() {
        active = false;
        stopAudio();
        document.body.classList.remove('cinematic-mode');
        document.getElementById('pres-overlay').classList.add('hidden');
        document.removeEventListener('keydown', onKey);
        currentSection = null;
        serial++;
        syncState('idle');
    }

    // --- Remote control polling (always active) ---
    let pollTimer = null;

    function startPolling() {
        if (pollTimer) return;
        pollTimer = setInterval(async () => {
            try {
                const res = await fetch('/api/pres/poll');
                const data = await res.json();
                if (data.action) {
                    if (data.action === 'start' && !active) {
                        start();
                    } else if (data.action === 'goto') {
                        if (!active) start();
                        setTimeout(() => goToStep(data.step || 0), 300);
                    } else if (active) {
                        switch (data.action) {
                            case 'next': next(); break;
                            case 'prev': prev(); break;
                            case 'pause': togglePause(); break;
                            case 'stop': stop(); break;
                        }
                    }
                }
            } catch (e) { /* ignore */ }
        }, 300);
    }

    function stopPolling() {
        if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
    }

    // Start polling immediately on load so remote can trigger start
    startPolling();

    function syncState(status) {
        const step = STEPS[stepIndex] || {};
        fetch('/api/pres/state', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                step: stepIndex,
                total: STEPS.length,
                status: status || 'ready',
                section: step.section || '',
                narration: step.narration || '',
                char: step.char || 'narrator',
                interactive: !!step.interactive,
            }),
        }).catch(() => {});
    }

    return {
        start, stop, next, prev, toggleIndex,
        get isActive() { return active; },
        get stepCount() { return STEPS.length; },
        getSteps() { return STEPS; },
    };
})();

function togglePresentation() {
    if (CinematicPresentation.isActive) CinematicPresentation.stop();
    else CinematicPresentation.start();
}
window.togglePresentation = togglePresentation;
