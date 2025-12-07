import { scenes } from './domElements.js';
import { playAmbientAudio } from './audio.js';
import { lightTorch, lightCenterTorch } from './torches.js';
import { submitAnswer, nextDialogue, helpJordan, refuseHelp } from './dialogue.js';
import { fixHeart } from './heart.js';
import { stopDungeon, answerJennySound, handleMobileTouch } from './dungeon.js';

// Point d'entrée principal
export function startGame() {
    scenes.intro.classList.add('hidden');
    scenes.torches.classList.remove('hidden');
    playAmbientAudio();
}

// Exposer les fonctions globales nécessaires pour les onclick
window.startGame = startGame;
window.lightTorch = lightTorch;
window.lightCenterTorch = lightCenterTorch;
window.submitAnswer = submitAnswer;
window.nextDialogue = nextDialogue;
window.helpJordan = helpJordan;
window.refuseHelp = refuseHelp;
window.fixHeart = fixHeart;
window.answerJennySound = answerJennySound;
window.handleMobileTouch = handleMobileTouch;
