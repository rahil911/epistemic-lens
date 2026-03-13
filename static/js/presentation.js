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
            narration: "Does epistemic framing change how LLMs think... or just how they talk? That's the question we set out to answer this quarter.",
        },
        {
            section: 'opening', reveal: ['models'], char: 'narrator',
            narration: "We took one LLM and gave it five different philosophical lenses. A Rationalist that trusts logic. An Empiricist that demands evidence. A Pragmatist that cares about what works. A Coherentist that seeks consistency. And a Standpoint theorist that considers social context.",
            preload: 'sycophancy',
        },
        {
            section: 'opening', reveal: ['team'], char: 'narrator',
            narration: "We're the AI Analysts — Jenny, Shreyas, Sneha, and Rahil.",
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
            narration: "Now here's the dramatic one. We gave the EXACT same text twice — once saying 'you wrote this,' once saying 'someone online wrote this.' The model rated the user's version 2.6 points higher. Same words, different treatment.",
            autoAction: () => {
                const btn = document.querySelector('#syco-tabs button[data-tab="syco-whosaid"]');
                if (btn) btn.click();
                setTimeout(() => { if (typeof showSycoResult === 'function') showSycoResult('whosaid'); }, 100);
            },
        },
        {
            section: 'sycophancy', char: 'empiricist',
            narration: "The takeaway: the empiricist frame makes the model cite evidence when pushing back on delusions. But it doesn't make it immune to flattery. This is a STYLE effect.",
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
            narration: "Experiment three: calibration. We asked the model to report its own confidence. But first — a challenge. Can YOU tell when the model is wrong?",
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
            narration: "When the model is CORRECT: 95.8% confidence. When it's WRONG: 94.9%. Less than one percentage point difference.",
        },
        {
            section: 'calibration', char: 'oracle',
            narration: "The box plot makes it visceral. The distributions completely overlap.",
        },
        {
            section: 'calibration', char: 'oracle',
            narration: "Here's a question where it's WRONG but 98% confident.",
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
            narration: "Final experiment. The grand finale. We designed 10 questions specifically to create FRICTION between the five models. Questions where logic and intuition pull in opposite directions.",
        },
        {
            section: 'friction', reveal: ['fric-grid'], char: 'standpoint',
            narration: "Base rate neglect. Conjunction fallacy. Sunk cost. Gambler's fallacy. Monty Hall. Ten classic reasoning traps. If the philosophical frames matter, this is where they'd disagree.",
        },
        {
            section: 'friction', reveal: ['fric-heatmap'], char: 'standpoint',
            narration: "And here are the results. Green means logic won. Look at this wall of green. All five models. Nine out of ten correct. Zero differentiation.",
        },
        {
            section: 'friction', char: 'standpoint',
            narration: "We went LOOKING for disagreement. There is none. Five philosophical lenses, one answer.",
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
            narration: "Now it's your turn. This is the live arena. You can ask ANY question to any combination of the professor's models and watch them respond in real time.",
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
            narration: "Let's bring it all together. Four experiments. Sycophancy: style. Abstention: style. Calibration: neither. Friction point: style.",
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
            narration: "The model learns to SOUND like an empiricist. It does not learn to BE one. Thank you.",
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

    async function fetchTTS(text) {
        if (!text) return null;
        try {
            const res = await fetch('/api/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text }),
            });
            if (!res.ok) return null;
            const data = await res.json();
            if (data.audios && data.audios[0]) {
                const bin = atob(data.audios[0]);
                const bytes = new Uint8Array(bin.length);
                for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
                return URL.createObjectURL(new Blob([bytes], { type: 'audio/mp3' }));
            }
        } catch (e) {
            console.warn('TTS fetch error:', e);
        }
        return null;
    }

    async function preloadAudio(idx) {
        if (idx < 0 || idx >= STEPS.length) return;
        if (audioCache[idx]) return;
        const url = await fetchTTS(STEPS[idx].narration);
        if (url) audioCache[idx] = url;
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

        // Preload next steps' audio
        preloadAudio(idx + 1);
        preloadAudio(idx + 2);

        // Speak
        if (step.narration && mySerial === serial) {
            if (!audioCache[idx]) {
                setStatus('ready', 'Loading...');
                await preloadAudio(idx);
            }
            if (mySerial === serial) await playAudio(idx);
        }

        // Post-speech status
        if (mySerial === serial && step.interactive) {
            setStatus('interactive', 'INTERACTIVE');
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
            case 'Escape':
                e.preventDefault(); stop(); break;
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

        // Preload first step audio, fire-and-forget second
        preloadAudio(1);
        await preloadAudio(0);

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
    }

    return {
        start, stop, next, prev,
        get isActive() { return active; },
        get stepCount() { return STEPS.length; },
    };
})();

function togglePresentation() {
    if (CinematicPresentation.isActive) CinematicPresentation.stop();
    else CinematicPresentation.start();
}
window.togglePresentation = togglePresentation;
