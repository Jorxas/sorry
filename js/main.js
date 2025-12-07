import { scenes } from './domElements.js';
import { playAmbientAudio } from './audio.js';
import { lightTorch, lightCenterTorch } from './torches.js';
import { submitAnswer, nextDialogue, helpJordan, refuseHelp } from './dialogue.js';
import { fixHeart } from './heart.js';
import { stopDungeon, answerJennySound, handleMobileTouch, nextLevel4Dialogue, submitLevel4Info, initDungeonLevel4 } from './dungeon.js';

// Point d'entrée principal
export function startGame() {
    scenes.intro.classList.add('hidden');
    scenes.torches.classList.remove('hidden');
    playAmbientAudio();
}

// Fonction pour aller directement au niveau 4 (dernier couloir)
export function skipToLevel4() {
    scenes.intro.classList.add('hidden');
    // Aller directement au donjon niveau 4
    scenes.dungeon.classList.remove('hidden');
    initDungeonLevel4();
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
window.nextLevel4Dialogue = nextLevel4Dialogue;
window.submitLevel4Info = submitLevel4Info;
window.skipToLevel4 = skipToLevel4;
