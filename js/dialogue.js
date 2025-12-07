import { gameState } from './gameState.js';
import { scenes } from './domElements.js';
import { CONFIG } from './config.js';
import { triggerJumpscare } from './jumpscare.js';
import { initDungeon } from './dungeon.js';

/* --- LOGIQUE DIALOGUE --- */
export function startDialogueSequence() {
    scenes.dialogue.classList.remove('hidden');
    gameState.step = 1;
    updateDialogue();
}

export function updateDialogue() {
    const title = document.getElementById('dialogue-title');
    const text = document.getElementById('dialogue-text');
    const inputArea = document.getElementById('input-area');
    const nextBtn = document.getElementById('next-btn-area');
    const input = document.getElementById('user-input');

    input.value = "";
    inputArea.classList.add('hidden');
    nextBtn.classList.add('hidden');
    const choiceArea = document.getElementById('choice-area');
    if (choiceArea) choiceArea.classList.add('hidden');

    if (gameState.step === 1) {
        title.innerText = "Réveil...";
        text.innerText = "Ma tête tourne... Tout est flou. Une voix résonne dans le noir.";
        setTimeout(() => { gameState.step++; updateDialogue(); }, 3000);
    } else if (gameState.step === 2) {
        title.innerText = "QUI ES-TU ?";
        text.innerText = "Dis-moi ton prénom ou disparais à jamais.";
        inputArea.classList.remove('hidden');
        input.focus();
        input.onkeypress = function(e) {
            if (e.key === 'Enter') submitAnswer();
        };
    } else if (gameState.step === 3) {
        title.innerText = "Souvenirs...";
        text.innerHTML = `Ah... ${input.value}... <br>La dernière chose dont je me souviens, c'est une dispute. Des mots durs. <br>Mais attends... Qui suis-je, moi ?`;
        inputArea.classList.remove('hidden');
        input.focus();
        input.onkeypress = function(e) {
            if (e.key === 'Enter') submitAnswer();
        };
    } else if (gameState.step === 4) {
        title.innerText = "C'est vrai !";
        text.innerHTML = `Ah wai ${gameState.playerName} mais tu as oublié de préciser beau gosse qui fait <span style="color: red;">1,92m</span>.<br> (Bon, peut-être un peu moins dans la vraie vie, mais c'est mon jeu ici).`;
        nextBtn.classList.remove('hidden');
    } else if (gameState.step === 5) {
        title.innerText = "Coincé";
        text.innerText = "Je suis coincé ici à cause d'une bêtise. Aide-moi à retrouver mon ami(e).";
        nextBtn.classList.remove('hidden');
    } else if (gameState.step === 6) {
        title.innerText = "...";
        text.innerText = "Veux-tu m'aider à la retrouver ?";
        const choiceArea = document.getElementById('choice-area');
        choiceArea.classList.remove('hidden');
    } else if (gameState.step === 7) {
        // Cette étape est maintenant gérée par helpJordan() qui va directement au donjon
        // Le donjon peut ensuite mener au cœur si nécessaire
    }
}

export function submitAnswer() {
    const input = document.getElementById('user-input').value.toLowerCase().trim();
    
    if (gameState.step === 2) {
        // Vérification Nom Amie
        if (CONFIG.friendName.includes(input)) {
            gameState.step = 3;
            updateDialogue();
        } else {
            triggerJumpscare();
        }
    } else if (gameState.step === 3) {
        // Vérification Ton Nom
        if (CONFIG.myName.includes(input)) {
            gameState.playerName = document.getElementById('user-input').value.trim(); // Garde la casse originale
            gameState.step = 4;
            updateDialogue();
        } else {
            triggerJumpscare();
        }
    }
}

export function nextDialogue() {
    gameState.step++;
    updateDialogue();
}

export function helpJordan() {
    // Transition vers le donjon avec effet de fondu
    scenes.dialogue.style.opacity = '0';
    
    setTimeout(() => {
        scenes.dialogue.classList.add('hidden');
        scenes.dialogue.style.opacity = '1'; // Reset pour la prochaine fois
        
        // Afficher le donjon avec transition
        scenes.dungeon.classList.remove('hidden');
        scenes.dungeon.style.opacity = '0';
        
        // Animation de fondu
        setTimeout(() => {
            scenes.dungeon.style.opacity = '1';
            initDungeon();
        }, 50);
    }, 500);
}

export function refuseHelp() {
    triggerJumpscare();
}
