import { gameState, resetGameState } from './gameState.js';
import { overlay, centerTorch, scenes, container } from './domElements.js';
import { playScreamerAudio } from './audio.js';

/* --- LOGIQUE JUMPSCARE --- */
export function triggerJumpscare() {
    overlay.classList.remove('hidden');
    
    // Jouer le fichier audio screamer
    playScreamerAudio();
    
    // Reset game after 2 seconds
    setTimeout(() => {
        overlay.classList.add('hidden');
        // Reset to step 1 of torches but keep scene
        resetGameState();
        document.querySelectorAll('.torch').forEach(t => t.classList.remove('lit'));
        centerTorch.style.opacity = '0';
        centerTorch.classList.remove('lit');
        scenes.dialogue.classList.add('hidden');
        scenes.torches.classList.remove('hidden');
        container.style.filter = 'none';
        container.classList.remove('glitch-effect');
    }, 2000);
}
