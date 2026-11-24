document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Animación de Pétalos de Sakura (Canvas) ---
    const canvas = document.getElementById('sakura-canvas');
    const ctx = canvas.getContext('2d');
    let petals = [];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Petal {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * -canvas.height;
            this.size = Math.random() * 8 + 6;
            this.speedY = Math.random() * 1.2 + 0.6;
            this.speedX = Math.random() * 1 - 0.5;
            this.angle = Math.random() * Math.PI * 2;
            this.spin = Math.random() * 0.03 - 0.015;
        }
        update() {
            this.y += this.speedY;
            this.x += this.speedX + Math.sin(this.angle) * 0.5;
            this.angle += this.spin;
            if (this.y > canvas.height) this.reset();
        }
        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.fillStyle = 'rgba(255, 183, 197, 0.85)';
            ctx.beginPath();
            ctx.ellipse(0, 0, this.size, this.size / 2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    for (let i = 0; i < 40; i++) petals.push(new Petal());

    function animateSakura() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        petals.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animateSakura);
    }
    animateSakura();

    // --- 2. Sintetizador de Audio Web ---
    let audioCtx = null;
    let activeOscillators = [];
    let lyricTimers = [];

    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    function playTone(freq, duration, type = 'sine', delay = 0) {
        initAudio();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);

        gain.gain.setValueAtTime(0.14, audioCtx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + duration);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + delay);
        osc.stop(audioCtx.currentTime + delay + duration);
        activeOscillators.push(osc);
    }

    function stopAllMusic() {
        activeOscillators.forEach(osc => {
            try { osc.stop(); } catch (e) {}
        });
        activeOscillators = [];
        lyricTimers.forEach(id => clearTimeout(id));
        lyricTimers = [];
        document.getElementById('visualizer').classList.remove('playing');
        document.getElementById('stop-gt-btn').classList.add('hidden');
        document.getElementById('play-gt-btn').classList.remove('hidden');
    }

    // --- 3. Lógica del Pastel con Velas "19" ---
    const candles = document.querySelectorAll('.num-candle');
    const wishMsg = document.getElementById('wish-message');
    const relightBtn = document.getElementById('relight-btn');

    candles.forEach(candle => {
        candle.addEventListener('click', () => {
            if (candle.getAttribute('data-lit') === 'true') {
                candle.setAttribute('data-lit', 'false');
                playTone(523.25, 0.2, 'sine');
                checkAllCandles();
            }
        });
    });

    function checkAllCandles() {
        const allOut = Array.from(candles).every(c => c.getAttribute('data-lit') === 'false');
        if (allOut) {
            wishMsg.style.display = 'block';
            relightBtn.classList.remove('hidden');
            playTone(523.25, 0.2, 'triangle', 0);
            playTone(659.25, 0.2, 'triangle', 0.15);
            playTone(783.99, 0.4, 'triangle', 0.3);
        }
    }

    relightBtn.addEventListener('click', () => {
        candles.forEach(c => c.setAttribute('data-lit', 'true'));
        wishMsg.style.display = 'none';
        relightBtn.classList.add('hidden');
        playTone(440, 0.2, 'sine');
    });

    // --- 4. Máquina Gachapon ---
    const gachaKnob = document.getElementById('gacha-knob');
    const droppedCapsule = document.getElementById('dropped-capsule');
    const modal = document.getElementById('gacha-modal');
    const closeModal = document.getElementById('close-modal');
    const modalOkBtn = document.getElementById('modal-ok-btn');
    const modalText = document.getElementById('modal-text');
    const modalIcon = document.getElementById('modal-icon');

    const wishes = [
        { icon: '🌸', text: '¡Felices 19 años, Hiromi! Que esta nueva etapa esté llena de momentos tan bonitos como un día bajo los cerezos.' },
        { icon: '✨', text: 'Mucho éxito en todo lo que te propongas en tus 19, Hiromi. Que nunca te falte inspiración, salud y motivos para sonreír.' },
        { icon: '🎀', text: 'Hoy 20 de noviembre se celebra tu cumple #19. ¡Pásala increíble, Hiromi, y disfruta tu día al máximo!' },
        { icon: '⭐', text: 'Que la vida te sorprenda con nuevas aventuras, buena música y mucha paz mental. ¡Feliz cumpleaños, Hiromi!' }
    ];

    let rotation = 0;

    gachaKnob.addEventListener('click', () => {
        rotation += 360;
        gachaKnob.style.transform = `rotate(${rotation}deg)`;
        playTone(300, 0.15, 'square', 0);
        playTone(450, 0.2, 'square', 0.15);

        droppedCapsule.classList.add('hidden');
        setTimeout(() => {
            droppedCapsule.classList.remove('hidden');
            playTone(600, 0.3, 'sine', 0);
        }, 500);
    });

    droppedCapsule.addEventListener('click', () => {
        const randomWish = wishes[Math.floor(Math.random() * wishes.length)];
        modalIcon.textContent = randomWish.icon;
        modalText.textContent = randomWish.text;
        modal.classList.remove('hidden');
        droppedCapsule.classList.add('hidden');
        playTone(783.99, 0.3, 'triangle', 0);
    });

    [closeModal, modalOkBtn].forEach(el => {
        el.addEventListener('click', () => modal.classList.add('hidden'));
    });

    

    // --- 5. Melodía Completa: "Cumpleaños Feliz" (Cajita Musical) ---
    const playGtBtn = document.getElementById('play-gt-btn');
    const stopGtBtn = document.getElementById('stop-gt-btn');
    const visualizer = document.getElementById('visualizer');
    const lyricsLine = document.getElementById('lyrics-line');

    function playMusicBoxNote(freq, duration, delay) {
        initAudio();
        const now = audioCtx.currentTime + delay;

        const osc = audioCtx.createOscillator();
        const overtone = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const overtoneGain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        overtone.type = 'triangle';
        overtone.frequency.setValueAtTime(freq * 2, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0008, now + duration + 0.25);

        overtoneGain.gain.setValueAtTime(0.02, now);
        overtoneGain.exponentialRampToValueAtTime(0.0001, now + duration * 0.5);

        osc.connect(gain);
        overtone.connect(overtoneGain);
        overtoneGain.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now);
        overtone.start(now);
        osc.stop(now + duration + 0.3);
        overtone.stop(now + duration + 0.3);

        activeOscillators.push(osc, overtone);
    }

    playGtBtn.addEventListener('click', () => {
        stopAllMusic();
        visualizer.classList.add('playing');
        playGtBtn.classList.add('hidden');
        stopGtBtn.classList.remove('hidden');

        // Notas en Do Mayor (con Si bemol para el clímax)
        const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.00, A4 = 440.00, Bb4 = 466.16, C5 = 523.25;

        // Las 4 frases completas de "Cumpleaños Feliz"
        const melody = [
            // Frase 1: "Feliz cumpleaños a ti"
            { f: C4,  d: 0.28, t: 0.00 },
            { f: C4,  d: 0.18, t: 0.32 },
            { f: D4,  d: 0.45, t: 0.54 },
            { f: C4,  d: 0.45, t: 1.04 },
            { f: F4,  d: 0.45, t: 1.54 },
            { f: E4,  d: 0.85, t: 2.04 },

            // Frase 2: "Feliz cumpleaños a ti"
            { f: C4,  d: 0.28, t: 3.10 },
            { f: C4,  d: 0.18, t: 3.42 },
            { f: D4,  d: 0.45, t: 3.64 },
            { f: C4,  d: 0.45, t: 4.14 },
            { f: G4,  d: 0.45, t: 4.64 },
            { f: F4,  d: 0.85, t: 5.14 },

            // Frase 3: "Feliz cumpleaños querida Hiromi"
            { f: C4,  d: 0.28, t: 6.20 },
            { f: C4,  d: 0.18, t: 6.52 },
            { f: C5,  d: 0.45, t: 6.74 },
            { f: A4,  d: 0.45, t: 7.24 },
            { f: F4,  d: 0.45, t: 7.74 },
            { f: E4,  d: 0.45, t: 8.24 },
            { f: D4,  d: 0.85, t: 8.74 },

            // Frase 4: "Feliz cumpleaños a ti"
            { f: Bb4, d: 0.28, t: 9.80 },
            { f: Bb4, d: 0.18, t: 10.12 },
            { f: A4,  d: 0.45, t: 10.34 },
            { f: F4,  d: 0.45, t: 10.84 },
            { f: G4,  d: 0.45, t: 11.34 },
            { f: F4,  d: 1.10, t: 11.84 }
        ];

        melody.forEach(n => playMusicBoxNote(n.f, n.d, n.t));

        // Letra sincronizada con las 4 frases
        const lyricsCue = [
            { text: '🎶 ¡Feliz cumpleaños a ti...! 🎶', time: 0 },
            { text: '✨ ¡Feliz cumpleaños a ti...! ✨', time: 3100 },
            { text: '🌸 ¡Feliz cumpleaños, Hiromi...! 🌸', time: 6200 },
            { text: '🎂 ¡Feliz cumpleaños #19 a ti! 🎉', time: 9800 }
        ];

        lyricsCue.forEach(cue => {
            const id = setTimeout(() => {
                lyricsLine.textContent = cue.text;
            }, cue.time);
            lyricTimers.push(id);
        });

        const endTimer = setTimeout(() => {
            stopAllMusic();
        }, 13300);
        lyricTimers.push(endTimer);
    });

    stopGtBtn.addEventListener('click', () => {
        stopAllMusic();
        lyricsLine.textContent = '🎶 ¡Feliz cumpleaños a ti...! 🎶';
    });
});