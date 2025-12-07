import { gameState } from './gameState.js';
import { centerTorch, container, scenes } from './domElements.js';
import { playSound } from './audio.js';
import { startDialogueSequence } from './dialogue.js';

/* --- LOGIQUE TORCHES --- */
export function lightTorch(id) {
    const el = document.getElementById(id);
    if (!el.classList.contains('lit')) {
        el.classList.add('lit');
        playSound('fire');
        gameState.torchesLit++;
        if (gameState.torchesLit === 4) {
            setTimeout(() => {
                centerTorch.style.opacity = '1';
                playSound('reveal');
            }, 500);
        }
    }
}

export function lightCenterTorch() {
    if (gameState.torchesLit >= 4) {
        centerTorch.classList.add('lit');
        playSound('glitch');
        
        // Effet de réveil (Glitch + Blur)
        container.classList.add('glitch-effect');
        container.style.filter = 'blur(10px)';
        
        setTimeout(() => {
            container.classList.remove('glitch-effect');
            container.style.filter = 'blur(0px)';
            scenes.torches.classList.add('hidden');
            startDialogueSequence();
        }, 2000);
    }
}
