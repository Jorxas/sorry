export const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

/* --- SYSTÈME DE SON (Web Audio API) --- */
export function playSound(type) {
    if (!audioCtx) return;
    // Resume audio context if suspended (required by some browsers)
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'fire') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.5);
        gainNode.gain.setValueAtTime(0.5, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
    }
    else if (type === 'reveal') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.linearRampToValueAtTime(800, now + 1);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.5);
        gainNode.gain.linearRampToValueAtTime(0, now + 1);
        osc.start(now);
        osc.stop(now + 1);
    }
    else if (type === 'glitch') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(50, now);
        osc.frequency.linearRampToValueAtTime(1000, now + 0.1);
        gainNode.gain.setValueAtTime(0.5, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
    }
    else if (type === 'scream') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, now); // Low rumble
        osc.frequency.linearRampToValueAtTime(800, now + 0.1); // Scream up
        
        // White noise simulation for scream texture
        const bufferSize = audioCtx.sampleRate * 2; 
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = audioCtx.createGain();
        noise.connect(noiseGain);
        noiseGain.connect(audioCtx.destination);
        noiseGain.gain.setValueAtTime(1, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 1);
        noise.start(now);

        osc.start(now);
        osc.stop(now + 0.5);
    }
    else if (type === 'hit') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(0.01, now + 0.1);
        gainNode.gain.setValueAtTime(0.5, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    }
    else if (type === 'ambiance') {
        // Ambient sound for torch scene
        osc.type = 'sine';
        osc.frequency.setValueAtTime(60, now);
        osc.frequency.linearRampToValueAtTime(80, now + 2);
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.linearRampToValueAtTime(0.1, now + 2);
        osc.start(now);
        osc.stop(now + 2);
    }
    else if (type === 'angel') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now); // A4
        osc.frequency.setValueAtTime(554, now + 0.2); // C#5
        osc.frequency.setValueAtTime(659, now + 0.4); // E5
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.2, now + 1);
        gainNode.gain.linearRampToValueAtTime(0, now + 4);
        osc.start(now);
        osc.stop(now + 4);
    }
}

export function playAmbientAudio() {
    const ambientAudio = document.getElementById('ambient-audio');
    if (ambientAudio) {
        ambientAudio.volume = 0.5; // Volume modéré pour l'ambiance
        ambientAudio.loop = true;
        const playPromise = ambientAudio.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => {
                // Si le fichier audio ne peut pas être joué, utiliser le son généré
                console.log("Impossible de jouer le fichier audio ambiant, utilisation du son généré", e);
                playSound('ambiance');
            });
        }
    } else {
        playSound('ambiance');
    }
}

export function playScreamerAudio() {
    const screamerAudio = document.getElementById('screamer-audio');
    if (screamerAudio) {
        screamerAudio.currentTime = 0;
        screamerAudio.volume = 1.0;
        const playPromise = screamerAudio.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => {
                // Si le fichier audio ne peut pas être joué, utiliser le son généré
                console.log("Impossible de jouer le fichier audio, utilisation du son généré", e);
                playSound('scream');
            });
        }
    } else {
        playSound('scream');
    }
}

