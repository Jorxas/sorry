import { scenes } from './domElements.js';
import { playAmbientAudio } from './audio.js';
import { lightTorch, lightCenterTorch } from './torches.js';
import { submitAnswer, nextDialogue, helpJordan, refuseHelp } from './dialogue.js';
import { fixHeart } from './heart.js';
import { stopDungeon, answerJennySound, handleMobileTouch, nextLevel4Dialogue, submitLevel4Info, initDungeonLevel4, initDungeonLevel3 } from './dungeon.js';

// Point d'entrée principal
export function startGame() {
    console.log("startGame appelé");
    if (!scenes.intro) {
        console.error("scenes.intro non trouvé");
        return;
    }
    if (!scenes.torches) {
        console.error("scenes.torches non trouvé");
        return;
    }
    scenes.intro.classList.add('hidden');
    scenes.torches.classList.remove('hidden');
    playAmbientAudio();
}

// Fonction pour aller directement au niveau 3 (labyrinthe avec porte)
export function skipToLevel3() {
    console.log("skipToLevel3 appelé");
    if (!scenes.intro) {
        console.error("scenes.intro non trouvé");
        return;
    }
    if (!scenes.dungeon) {
        console.error("scenes.dungeon non trouvé");
        return;
    }
    scenes.intro.classList.add('hidden');
    // Aller directement au donjon niveau 3
    scenes.dungeon.classList.remove('hidden');
    initDungeonLevel3();
}

// Fonction pour aller directement au niveau 4 (dernier couloir)
export function skipToLevel4() {
    console.log("skipToLevel4 appelé");
    if (!scenes.intro) {
        console.error("scenes.intro non trouvé");
        return;
    }
    if (!scenes.dungeon) {
        console.error("scenes.dungeon non trouvé");
        return;
    }
    scenes.intro.classList.add('hidden');
    // Aller directement au donjon niveau 4
    scenes.dungeon.classList.remove('hidden');
    initDungeonLevel4();
}

// Exposer les fonctions globales nécessaires pour les onclick
// S'assurer que les fonctions sont disponibles immédiatement
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
window.skipToLevel3 = skipToLevel3;
window.skipToLevel4 = skipToLevel4;

// Vérifier que les fonctions sont bien exposées
console.log("Fonctions exposées:", {
    startGame: typeof window.startGame,
    skipToLevel3: typeof window.skipToLevel3,
    skipToLevel4: typeof window.skipToLevel4
});
