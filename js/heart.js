import { gameState } from './gameState.js';
import { scenes, container } from './domElements.js';
import { playSound } from './audio.js';

/* --- LOGIQUE FINALE --- */
export function fixHeart() {
    const heart = document.getElementById('heart-container');
    gameState.heartClicks++;
    
    playSound('hit');

    if (gameState.heartClicks < 5) {
        heart.style.transform = `scale(${1 + (gameState.heartClicks/10)})`;
        document.getElementById('click-counter').innerText = (5 - gameState.heartClicks) + " coups restants...";
    } else {
        heart.className = 'fas fa-heart fixed';
        heart.style.color = '#d63031';
        document.getElementById('click-counter').innerText = "Cœur réparé.";
        
        setTimeout(() => {
            document.body.style.backgroundColor = "white";
            container.style.opacity = 0;
            setTimeout(() => {
                scenes.heart.classList.add('hidden');
                scenes.letter.classList.remove('hidden');
                container.style.opacity = 1;
                document.body.style.color = "#222";
                playSound('angel');
            }, 1000);
        }, 1500);
    }
}
