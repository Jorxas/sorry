import { scenes, overlay, centerTorch, container } from './domElements.js';
import { triggerJumpscare } from './jumpscare.js';
import { playScreamerAudio } from './audio.js';
import { resetGameState } from './gameState.js';

// Variables du donjon
let canvas, ctx;
let dungeonInitialized = false;
let currentLevel = 1; // 1 = donjon, 2 = labyrinthe initial, 3 = labyrinthe avec porte
let jennySoundPlayed = false; // Pour savoir si le son a été joué au moins une fois
let jennySoundHeard = false; // Pour savoir si le joueur a répondu
let canMove = false; // Pour bloquer le mouvement jusqu'à la fin du dialogue
let traumaMessageShown = false; // Pour savoir si le message traumatisme a été affiché
let level4DialogueStep = 0; // Étape du dialogue niveau 4 (0 = pas commencé, 1-3 = dialogues fierté, 4 = réponse Jordan, 5 = question info)
let blackSquareCollisionHandled = false; // Pour éviter de déclencher plusieurs fois
let jennyLevel4Reached = false; // Pour savoir si Jenny a été atteinte dans le niveau 4

// Charger l'image du tileset
const tileSprite = new Image();
tileSprite.src = "img/titleset.png";

// Variables de chargement
let imagesLoaded = 0;
const totalImages = 1;

// Joueur - avatar simple (carré coloré style Game Boy)
// Taille réduite pour faciliter les virages
const player = {
    x: 32,
    y: 32,
    size: 12, // Réduit de 16 à 12 pour plus de marge dans les virages
    speed: 2,
    color: '#4a90e2'
};

// Jenny - carré rose à la fin du labyrinthe
const jenny = {
    x: 0,
    y: 0,
    size: 12, // Même taille que le joueur
    color: '#ff69b4' // Rose
};

// Carré noir au milieu du niveau 4
const blackSquare = {
    x: 0,
    y: 0,
    size: 12,
    width: 1, // Largeur en tiles (1 carré - une seule colonne)
    height: 1, // Hauteur en tiles (1 carré)
    color: '#000000' // Noir
};

// Carte du donjon (0 = sol, 1 = mur, 2 = porte)
const dungeonMap = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// Labyrinthe complexe avec beaucoup de culs-de-sac mais seulement 2 chemins vers Jenny (0 = sol, 1 = mur)
// Les deux chemins vers Jenny sont : 
// - Chemin gauche : depuis le haut, descendre à gauche, puis aller vers le centre
// - Chemin droit : depuis le haut, descendre à droite, puis aller vers le centre
const labyrinthMap = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,0,1,0,1,0,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
    [1,1,1,1,1,0,1,0,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,0,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,1,0,1],
    [1,1,1,1,1,0,1,0,1,0,1,1,1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,1,0,1],
    [1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,1,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
    [1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1],
    [1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// Nouveau labyrinthe complexe avec porte en haut (0 = sol, 1 = mur, 2 = porte)
const labyrinthMapWithDoor = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1], // Porte en haut au milieu
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
    [1,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,1],
    [1,0,1,0,1,1,1,0,1,0,1,1,1,1,1,1,1,1,1,0,1,0,1,1,1,1,0,1,0,1],
    [1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,1],
    [1,1,1,0,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,0,1,1,1,1],
    [1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,0,1,1,1,1,0,1],
    [1,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,1],
    [1,1,1,0,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1,0,1,1,1,1],
    [1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// Niveau 4 : Une seule ligne verticale libre au milieu, tout le reste rempli de carrés rouges
// (0 = sol, 1 = mur, 3 = bloc rouge)
// Le carré noir est au milieu de cette ligne verticale
const lineMap = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,3,3,3,3,3,3,3,3,3,3,3,3,3,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1],
    [1,3,3,3,3,3,3,3,3,3,3,3,3,3,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1],
    [1,3,3,3,3,3,3,3,3,3,3,3,3,3,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1],
    [1,3,3,3,3,3,3,3,3,3,3,3,3,3,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1],
    [1,3,3,3,3,3,3,3,3,3,3,3,3,3,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1],
    [1,3,3,3,3,3,3,3,3,3,3,3,3,3,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1],
    [1,3,3,3,3,3,3,3,3,3,3,3,3,3,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1],
    [1,3,3,3,3,3,3,3,3,3,3,3,3,3,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1],
    [1,3,3,3,3,3,3,3,3,3,3,3,3,3,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1],
    [1,3,3,3,3,3,3,3,3,3,3,3,3,3,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1],
    [1,3,3,3,3,3,3,3,3,3,3,3,3,3,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1],
    [1,3,3,3,3,3,3,3,3,3,3,3,3,3,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1],
    [1,3,3,3,3,3,3,3,3,3,3,3,3,3,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1],
    [1,3,3,3,3,3,3,3,3,3,3,3,3,3,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1],
    [1,3,3,3,3,3,3,3,3,3,3,3,3,3,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1],
    [1,3,3,3,3,3,3,3,3,3,3,3,3,3,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1],
    [1,3,3,3,3,3,3,3,3,3,3,3,3,3,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1],
    [1,3,3,3,3,3,3,3,3,3,3,3,3,3,0,3,3,3,3,3,3,3,3,3,3,3,3,3,3,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// Ajouter une porte dans le donjon (à droite, au milieu)
dungeonMap[10][28] = 2; // Porte à la position (28, 10)

const tileSize = 16;

// Contrôles
const keys = {};

// Son de porte
function playDoorSound() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    const now = audioCtx.currentTime;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.linearRampToValueAtTime(100, now + 0.3);
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.3);
}

// Fonction pour gérer les touches mobiles
// Variables pour le système de clic/touch pour se déplacer
let targetX = null;
let targetY = null;
let isMovingToTarget = false;

// Fonction pour convertir les coordonnées écran en coordonnées du monde du jeu
function screenToWorld(screenX, screenY) {
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const worldX = (screenX - rect.left) * scaleX;
    const worldY = (screenY - rect.top) * scaleY;
    
    return { x: worldX, y: worldY };
}

// Fonction pour vérifier si le chemin en ligne droite est libre
function isPathClear(startX, startY, endX, endY, map) {
    const dx = endX - startX;
    const dy = endY - startY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.ceil(distance / (tileSize / 2)); // Vérifier tous les demi-tiles
    
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const checkX = startX + dx * t;
        const checkY = startY + dy * t;
        
        const tileX = Math.floor(checkX / tileSize);
        const tileY = Math.floor(checkY / tileSize);
        
        if (tileY >= 0 && tileY < map.length && tileX >= 0 && tileX < map[0].length) {
            const tile = map[tileY][tileX];
            // Vérifier si c'est un mur, une porte ou un bloc rouge
            if (tile === 1 || tile === 2 || tile === 3) {
                return false;
            }
        } else {
            return false; // Hors limites
        }
    }
    
    return true;
}

// Fonction pour gérer les contrôles tactiles par clic/touch
function setupTouchControls() {
    // Utiliser la scène du donjon pour les contrôles tactiles (tout l'écran)
    const dungeonScene = document.getElementById('scene-dungeon');
    if (!dungeonScene || !canvas) return;
    
    // Gérer les touches tactiles
    dungeonScene.addEventListener('touchstart', (e) => {
        // Ne pas empêcher si on clique sur un bouton D-pad
        if (e.target && e.target.closest('#mobile-dpad')) {
            return;
        }
        e.preventDefault();
        const touch = e.touches[0];
        handleClickOrTouch(touch.clientX, touch.clientY);
    }, { passive: false });
    
    // Gérer les clics souris (pour desktop aussi)
    canvas.addEventListener('click', (e) => {
        // Ne pas empêcher si on clique sur un bouton D-pad
        if (e.target && e.target.closest('#mobile-dpad')) {
            return;
        }
        e.preventDefault();
        handleClickOrTouch(e.clientX, e.clientY);
    }, { passive: false });
    
    dungeonScene.addEventListener('touchmove', (e) => {
        // Ne pas empêcher si on touche un bouton D-pad
        if (e.target && e.target.closest('#mobile-dpad')) {
            return;
        }
        e.preventDefault();
    }, { passive: false });
    
    // Configurer les boutons D-pad avec des gestionnaires d'événements
    setupDpadButtons();
}

// Fonction pour configurer les boutons D-pad
function setupDpadButtons() {
    console.log('setupDpadButtons appelé');
    const btnUp = document.getElementById('mobile-btn-up');
    const btnDown = document.getElementById('mobile-btn-down');
    const btnLeft = document.getElementById('mobile-btn-left');
    const btnRight = document.getElementById('mobile-btn-right');
    
    console.log('Boutons trouvés:', { btnUp: !!btnUp, btnDown: !!btnDown, btnLeft: !!btnLeft, btnRight: !!btnRight });
    
    // Fonction helper pour créer les gestionnaires d'événements
    const createButtonHandlers = (button, key) => {
        if (!button) return;
        
        // Supprimer les anciens gestionnaires en clonant le bouton
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // Ajouter les nouveaux gestionnaires
        newButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Touchstart sur', key);
            handleMobileDirection(key, true);
        }, { passive: false });
        
        newButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Touchend sur', key);
            handleMobileDirection(key, false);
        }, { passive: false });
        
        newButton.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Touchcancel sur', key);
            handleMobileDirection(key, false);
        }, { passive: false });
        
        newButton.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Mousedown sur', key);
            handleMobileDirection(key, true);
        });
        
        newButton.addEventListener('mouseup', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Mouseup sur', key);
            handleMobileDirection(key, false);
        });
        
        newButton.addEventListener('mouseleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Mouseleave sur', key);
            handleMobileDirection(key, false);
        });
    };
    
    createButtonHandlers(btnUp, 'ArrowUp');
    createButtonHandlers(btnDown, 'ArrowDown');
    createButtonHandlers(btnLeft, 'ArrowLeft');
    createButtonHandlers(btnRight, 'ArrowRight');
}

function handleClickOrTouch(clientX, clientY) {
    if (!canvas) return;
    
    // Convertir les coordonnées écran en coordonnées du monde
    const worldPos = screenToWorld(clientX, clientY);
    
    // Vérifier si on est sur mobile
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) return; // Sur desktop, garder les contrôles clavier
    
    // Masquer le message d'instruction au premier clic
    const instructionMsg = document.getElementById('mobile-control-instruction');
    if (instructionMsg && !instructionMsg.classList.contains('hidden')) {
        instructionMsg.classList.add('hidden');
    }
    
    const map = getCurrentMap();
    
    // Vérifier si le chemin est libre
    const playerCenterX = player.x + player.size / 2;
    const playerCenterY = player.y + player.size / 2;
    
    if (isPathClear(playerCenterX, playerCenterY, worldPos.x, worldPos.y, map)) {
        // Le chemin est libre, définir la cible
        targetX = worldPos.x - player.size / 2; // Ajuster pour le centre du joueur
        targetY = worldPos.y - player.size / 2;
        isMovingToTarget = true;
    }
}

export function handleMobileTouch(key, isPressed) {
    keys[key] = isPressed;
    // Empêcher le comportement par défaut
    return false;
}

// Fonction pour gérer les boutons de direction mobile
export function handleMobileDirection(key, isPressed) {
    console.log('handleMobileDirection appelé:', key, isPressed);
    keys[key] = isPressed;
    // Arrêter le mouvement vers la cible si on utilise les boutons
    if (isPressed) {
        isMovingToTarget = false;
        targetX = null;
        targetY = null;
    }
    return false;
}

// Son de Jenny
let jennySoundAudio = null;

// Son de pleur pour le donjon 2
let cryAudio = null;

// Fonction pour jouer le son de Jenny une fois
function playJennySound() {
    if (!jennySoundAudio) {
        jennySoundAudio = document.getElementById('jenny-sound-audio');
    }
    if (jennySoundAudio && !jennySoundPlayed) {
        jennySoundAudio.volume = 0.5;
        jennySoundAudio.loop = false;
        const playPromise = jennySoundAudio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                // Quand le son commence à jouer
                jennySoundPlayed = true;
            }).catch(e => {
                console.log("Impossible de jouer le son de Jenny", e);
            });
            
            // Détecter quand le son se termine
            jennySoundAudio.onended = function() {
                // Afficher le dialogue après que le son soit terminé
                if (!jennySoundHeard) {
                    showJennyDialogue();
                }
            };
        }
    }
}

// Fonction pour afficher le dialogue de Jordan
function showJennyDialogue() {
    const dialogue = document.getElementById('dungeon-dialogue');
    if (dialogue) {
        dialogue.classList.remove('hidden');
    }
}

// Fonction pour répondre au dialogue
export function answerJennySound(answer) {
    const dialogue = document.getElementById('dungeon-dialogue');
    const dialogueText = document.getElementById('dungeon-dialogue-text');
    
    if (dialogue && dialogueText) {
        jennySoundHeard = true;
        
        // Cacher les boutons
        const buttons = dialogue.querySelectorAll('button');
        buttons.forEach(btn => btn.style.display = 'none');
        
        // Afficher la première réponse de Jordan
        dialogueText.innerHTML = "Jordan : C'était Jenny...";
        
        // Après 2 secondes, afficher la deuxième phrase
        setTimeout(() => {
            dialogueText.innerHTML = "Jordan : Allons la chercher !";
            
            // Cacher le dialogue après 3 secondes supplémentaires et permettre le mouvement
            setTimeout(() => {
                dialogue.classList.add('hidden');
                canMove = true; // Permettre le mouvement après le dialogue
                // Réafficher les boutons pour la prochaine fois
                buttons.forEach(btn => btn.style.display = 'block');
            }, 3000);
        }, 2000);
    }
}

// Fonction appelée quand l'image est chargée
function imageLoaded() {
    imagesLoaded++;
    if (imagesLoaded === totalImages && dungeonInitialized) {
        loop();
    }
}

tileSprite.onload = imageLoaded;
tileSprite.onerror = function() {
    console.error("Erreur lors du chargement de titleset.png");
    imageLoaded();
};

// Fonction pour obtenir la carte actuelle
function getCurrentMap() {
    if (currentLevel === 1) {
        return dungeonMap;
    } else {
        return lineMap; // Niveau 4 : ligne droite
    }
}

// Fonction pour vérifier l'orientation (plus utilisée, conservée pour compatibilité)
function checkOrientation() {
    // Plus besoin de vérifier l'orientation, le jeu fonctionne en mode portrait
}

// Initialiser le donjon
export function initDungeon() {
    canvas = document.getElementById('dungeonCanvas');
    if (!canvas) {
        console.error("Canvas du donjon non trouvé");
        return;
    }
    
    ctx = canvas.getContext('2d');
    
    // Adapter la taille du canvas selon l'appareil
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        // Sur mobile, utiliser les dimensions de l'écran en mode portrait
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    } else {
        // Sur desktop, taille fixe
        canvas.width = 480;
        canvas.height = 320;
    }
    ctx.imageSmoothingEnabled = false;
    
    // Aller directement au niveau 4 (dernier couloir)
    currentLevel = 4;
    // Repositionner le joueur au milieu horizontalement (colonne 14), en bas verticalement
    player.x = 14 * tileSize; // Colonne 14 (milieu)
    player.y = 18 * tileSize; // En bas (ligne 18)
    // Positionner le carré noir au milieu vertical, colonne 14 (une seule colonne libre)
    blackSquare.x = 14 * tileSize; // Colonne 14 (milieu)
    blackSquare.y = 9 * tileSize; // Milieu vertical (ligne 9)
    // Positionner Jenny en haut au milieu
    jenny.x = 14 * tileSize; // Colonne 14 (milieu)
    jenny.y = 1 * tileSize; // En haut (ligne 1)
    
    // Réinitialiser les flags
    jennySoundPlayed = false;
    jennySoundHeard = true; // Permettre le mouvement directement
    canMove = true;
    traumaMessageShown = false;
    level4DialogueStep = 0;
    blackSquareCollisionHandled = false;
    jennyLevel4Reached = false;
    
    // Afficher les boutons pour mobile
    const isMobileCheck = window.innerWidth <= 768;
    if (isMobileCheck) {
        setTimeout(() => {
            const dpad = document.getElementById('mobile-dpad');
            if (dpad) {
                dpad.classList.remove('hidden');
                // S'assurer que les boutons sont configurés
                setupDpadButtons();
            }
        }, 500); // Attendre un peu pour que le canvas soit prêt
    }
    
    // Ajouter les écouteurs de clavier
    window.addEventListener('keydown', (e) => {
        keys[e.key] = true;
    });
    
    window.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });
    
    // Gérer le redimensionnement de la fenêtre
    window.addEventListener('resize', () => {
        if (canvas && dungeonInitialized) {
            const isMobile = window.innerWidth <= 768;
            if (isMobile) {
                // Sur mobile, utiliser les dimensions de l'écran
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            } else {
                canvas.width = 480;
                canvas.height = 320;
            }
        }
    });
    
    // Vérifier l'orientation au chargement
    checkOrientation();
    
    // Configurer les contrôles tactiles pour mobile
    setupTouchControls();
    
    dungeonInitialized = true;
    
    if (imagesLoaded === totalImages) {
        loop();
    }
}

// Fonction pour initialiser directement le niveau 3 (labyrinthe avec porte)
export function initDungeonLevel3() {
    canvas = document.getElementById('dungeonCanvas');
    if (!canvas) {
        console.error("Canvas du donjon non trouvé");
        return;
    }
    
    ctx = canvas.getContext('2d');
    
    // Adapter la taille du canvas selon l'appareil
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        // Sur mobile, utiliser les dimensions de l'écran en mode portrait
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    } else {
        canvas.width = 480;
        canvas.height = 320;
    }
    ctx.imageSmoothingEnabled = false;
    
    // Aller directement au niveau 3 (labyrinthe avec porte)
    currentLevel = 3;
    // Repositionner le joueur en bas du labyrinthe (sur une case libre)
    // Dans labyrinthMapWithDoor, ligne 18 colonne 14 est un mur, utiliser colonne 13 ou 15
    player.x = 13 * tileSize; // Colonne 13 (libre à la ligne 18)
    player.y = 18 * tileSize; // Ligne 18 (libre)
    
    // Réinitialiser les flags
    jennySoundPlayed = false;
    jennySoundHeard = true; // Permettre le mouvement directement
    canMove = true;
    traumaMessageShown = false;
    level4DialogueStep = 0;
    blackSquareCollisionHandled = false;
    jennyLevel4Reached = false;
    
    // Afficher les boutons D-pad sur mobile
    const isMobileCheck = window.innerWidth <= 768;
    if (isMobileCheck) {
        const dpad = document.getElementById('mobile-dpad');
        if (dpad) {
            dpad.classList.remove('hidden');
            // S'assurer que les boutons sont configurés
            setupDpadButtons();
        }
    }
    
    // Ajouter les écouteurs de clavier
    window.addEventListener('keydown', (e) => {
        keys[e.key] = true;
    });
    
    window.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });
    
    // Gérer le redimensionnement de la fenêtre
    window.addEventListener('resize', () => {
        if (canvas && dungeonInitialized) {
            const isMobile = window.innerWidth <= 768;
            if (isMobile) {
                // Sur mobile, utiliser les dimensions de l'écran
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            } else {
                canvas.width = 480;
                canvas.height = 320;
            }
        }
    });
    
    // Vérifier l'orientation au chargement
    checkOrientation();
    
    // Configurer les contrôles tactiles pour mobile
    setupTouchControls();
    
    // Marquer le donjon comme initialisé
    dungeonInitialized = true;
    
    // Démarrer la boucle de jeu directement
    loop();
}

// Fonction pour initialiser directement le niveau 4 (dernier couloir)
export function initDungeonLevel4() {
    canvas = document.getElementById('dungeonCanvas');
    if (!canvas) {
        console.error("Canvas du donjon non trouvé");
        return;
    }
    
    ctx = canvas.getContext('2d');
    
    // Adapter la taille du canvas selon l'appareil
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        // Sur mobile, utiliser les dimensions de l'écran en mode portrait
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    } else {
        canvas.width = 480;
        canvas.height = 320;
    }
    ctx.imageSmoothingEnabled = false;
    
    // Aller directement au niveau 4 (ligne verticale unique)
    currentLevel = 4;
    // Repositionner le joueur au milieu horizontalement (colonne 14), en bas verticalement
    player.x = 14 * tileSize; // Milieu horizontal (colonne 14)
    player.y = 18 * tileSize; // En bas (ligne 18)
    // Positionner le carré noir au milieu vertical, colonne 14 (une seule colonne libre)
    blackSquare.x = 14 * tileSize; // Colonne 14 (milieu)
    blackSquare.y = 9 * tileSize; // Milieu vertical (ligne 9)
    // Positionner Jenny en haut au milieu
    jenny.x = 14 * tileSize; // Colonne 14 (milieu)
    jenny.y = 1 * tileSize; // En haut (ligne 1)
    
    // Réinitialiser les flags
    jennySoundPlayed = false;
    jennySoundHeard = true; // Permettre le mouvement directement
    canMove = true;
    traumaMessageShown = false;
    level4DialogueStep = 0;
    blackSquareCollisionHandled = false;
    jennyLevel4Reached = false;
    
    // Afficher les boutons D-pad sur mobile
    const isMobileCheck = window.innerWidth <= 768;
    if (isMobileCheck) {
        const dpad = document.getElementById('mobile-dpad');
        if (dpad) {
            dpad.classList.remove('hidden');
            // S'assurer que les boutons sont configurés
            setupDpadButtons();
        }
    }
    
    // Ajouter les écouteurs de clavier
    window.addEventListener('keydown', (e) => {
        keys[e.key] = true;
    });
    
    window.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });
    
    // Gérer le redimensionnement de la fenêtre
    window.addEventListener('resize', () => {
        if (canvas && dungeonInitialized) {
            const isMobile = window.innerWidth <= 768;
            if (isMobile) {
                // Sur mobile, utiliser les dimensions de l'écran
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            } else {
                canvas.width = 480;
                canvas.height = 320;
            }
        }
    });
    
    // Vérifier l'orientation au chargement
    checkOrientation();
    
    // Configurer les contrôles tactiles pour mobile
    setupTouchControls();
    
    // Marquer le donjon comme initialisé
    dungeonInitialized = true;
    
    // Démarrer la boucle de jeu directement (pas besoin d'attendre les images pour le niveau 4)
    loop();
}

// Fonction pour changer de niveau (maintenant passe directement au niveau 4)
function changeLevel() {
    // Passer directement au niveau 4 (dernier couloir)
    currentLevel = 4;
    // Repositionner le joueur au milieu horizontalement (colonne 14), en bas verticalement
    player.x = 14 * tileSize; // Colonne 14 (milieu)
    player.y = 18 * tileSize; // En bas (ligne 18)
    // Positionner le carré noir au milieu vertical, colonne 14 (une seule colonne libre)
    blackSquare.x = 14 * tileSize; // Colonne 14 (milieu)
    blackSquare.y = 9 * tileSize; // Milieu vertical (ligne 9)
    // Positionner Jenny en haut au milieu
    jenny.x = 14 * tileSize; // Colonne 14 (milieu)
    jenny.y = 1 * tileSize; // En haut (ligne 1)
    
    // Réinitialiser les flags
    blackSquareCollisionHandled = false;
    level4DialogueStep = 0;
    jennyLevel4Reached = false;
}

// Fonction de mise à jour
function update() {
    // Ne pas permettre le mouvement si le dialogue n'est pas terminé (niveau 1)
    if (currentLevel === 1 && !jennySoundHeard) {
        return;
    }
    
    // Ne pas permettre le mouvement si le message traumatisme est affich� (mais permettre au niveau 3)
    // Au niveau 3, le joueur doit pouvoir se d�placer vers la porte
    if (currentLevel !== 3 && currentLevel !== 4) {
        const traumaMsg = document.getElementById('trauma-message');
        const jordanDialogue = document.getElementById('jordan-dialogue-trauma');
        if (traumaMessageShown && ((traumaMsg && !traumaMsg.classList.contains('hidden')) ||
            (jordanDialogue && !jordanDialogue.classList.contains('hidden')))) {
            return;
        }
    }
    
    // Au niveau 4, bloquer le mouvement pendant tout le dialogue (depuis le début jusqu'à la fin)
    if (currentLevel === 4) {
        // Bloquer le mouvement si le dialogue a commencé (level4DialogueStep > 0) et n'est pas terminé (level4DialogueStep < 8)
        if (level4DialogueStep > 0 && level4DialogueStep < 8) {
            return;
        }
        // Vérifier aussi si le dialogue est visible
        const dialogueBox = document.getElementById('dungeon-dialogue-level4');
        if (dialogueBox && !dialogueBox.classList.contains('hidden')) {
            return;
        }
    }
    
    const map = getCurrentMap();
    
    let newX = player.x;
    let newY = player.y;
    
    // Vérifier si on est sur mobile
    const isMobile = window.innerWidth <= 768;
    
    // Sur mobile, vérifier d'abord si on utilise les boutons de direction
    if (isMobile && (keys['ArrowUp'] || keys['ArrowDown'] || keys['ArrowLeft'] || keys['ArrowRight'])) {
        // Utiliser les boutons de direction
        if (keys['ArrowUp'] || keys['w'] || keys['W']) {
            newY -= player.speed;
        }
        if (keys['ArrowDown'] || keys['s'] || keys['S']) {
            newY += player.speed;
        }
        if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
            newX -= player.speed;
        }
        if (keys['ArrowRight'] || keys['d'] || keys['D']) {
            newX += player.speed;
        }
        // Arrêter le mouvement vers la cible si on utilise les boutons
        isMovingToTarget = false;
        targetX = null;
        targetY = null;
    } else if (isMobile && isMovingToTarget && targetX !== null && targetY !== null) {
        // Déplacer vers la cible en ligne droite
        const dx = targetX - player.x;
        const dy = targetY - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > player.speed) {
            // Se déplacer vers la cible
            const angle = Math.atan2(dy, dx);
            newX = player.x + Math.cos(angle) * player.speed;
            newY = player.y + Math.sin(angle) * player.speed;
            
            // Vérifier si on rencontre un obstacle
            const playerCenterX = newX + player.size / 2;
            const playerCenterY = newY + player.size / 2;
            const tileX = Math.floor(playerCenterX / tileSize);
            const tileY = Math.floor(playerCenterY / tileSize);
            
            if (tileY >= 0 && tileY < map.length && tileX >= 0 && tileX < map[0].length) {
                const tile = map[tileY][tileX];
                if (tile === 1 || tile === 2 || tile === 3) {
                    // Obstacle rencontré, arrêter le mouvement
                    isMovingToTarget = false;
                    targetX = null;
                    targetY = null;
                    return;
                }
            }
            
            // Vérifier aussi la collision avec le carré noir (niveau 4)
            if (currentLevel === 4 && !blackSquareCollisionHandled) {
                const blackWidth = blackSquare.width * tileSize;
                const blackHeight = blackSquare.height * tileSize;
                const playerLeft = newX;
                const playerRight = newX + player.size;
                const playerTop = newY;
                const playerBottom = newY + player.size;
                
                const blackLeft = blackSquare.x;
                const blackRight = blackSquare.x + blackWidth;
                const blackTop = blackSquare.y;
                const blackBottom = blackSquare.y + blackHeight;
                
                const margin = 2;
                const wouldCollide = !(playerRight < blackLeft - margin || playerLeft > blackRight + margin || playerBottom < blackTop - margin || playerTop > blackBottom + margin);
                
                if (wouldCollide) {
                    // Collision avec le carré noir, arrêter le mouvement et déclencher le dialogue
                    isMovingToTarget = false;
                    targetX = null;
                    targetY = null;
                    blackSquareCollisionHandled = true;
                    showLevel4Dialogue();
                    return;
                }
            }
        } else {
            // Atteint la cible
            newX = targetX;
            newY = targetY;
            isMovingToTarget = false;
            targetX = null;
            targetY = null;
        }
    } else {
        // Contrôles clavier classiques (desktop)
        if (keys['ArrowUp'] || keys['w'] || keys['W']) {
            newY -= player.speed;
        }
        if (keys['ArrowDown'] || keys['s'] || keys['S']) {
            newY += player.speed;
        }
        if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
            newX -= player.speed;
        }
        if (keys['ArrowRight'] || keys['d'] || keys['D']) {
            newX += player.speed;
        }
    }
    
    // Collision avec les murs - système amélioré pour faciliter les virages
    // On vérifie le centre du joueur plutôt que les 4 coins pour plus de tolérance
    const centerX = newX + player.size / 2;
    const centerY = newY + player.size / 2;
    const tileX = Math.floor(centerX / tileSize);
    const tileY = Math.floor(centerY / tileSize);
    
    // Vérifier aussi les coins avec une marge réduite
    const margin = 2; // Marge de tolérance
    const tileX1 = Math.floor((newX + margin) / tileSize);
    const tileY1 = Math.floor((newY + margin) / tileSize);
    const tileX2 = Math.floor((newX + player.size - margin) / tileSize);
    const tileY2 = Math.floor((newY + player.size - margin) / tileSize);
    
    if (tileY >= 0 && tileY < map.length && tileX >= 0 && tileX < map[0].length) {
        const centerTile = map[tileY][tileX];
        const tile1 = (tileY1 >= 0 && tileY1 < map.length && tileX1 >= 0 && tileX1 < map[0].length) ? map[tileY1][tileX1] : 1;
        const tile2 = (tileY1 >= 0 && tileY1 < map.length && tileX2 >= 0 && tileX2 < map[0].length) ? map[tileY1][tileX2] : 1;
        const tile3 = (tileY2 >= 0 && tileY2 < map.length && tileX1 >= 0 && tileX1 < map[0].length) ? map[tileY2][tileX1] : 1;
        const tile4 = (tileY2 >= 0 && tileY2 < map.length && tileX2 >= 0 && tileX2 < map[0].length) ? map[tileY2][tileX2] : 1;
        
        // Vérifier si on entre dans la porte (niveau 1) - maintenant passe directement au niveau 4
        if (currentLevel === 1 && (centerTile === 2 || tile1 === 2 || tile2 === 2 || tile3 === 2 || tile4 === 2)) {
            changeLevel();
            return;
        }
        
        // Vérifier les collisions avec les murs et blocs rouges
        // Le centre doit être libre, et au moins 3 des 4 coins doivent être libres
        const freeCorners = [tile1, tile2, tile3, tile4].filter(t => t !== 1 && t !== 2 && t !== 3).length;
        let canPass = (centerTile !== 1 && centerTile !== 2 && centerTile !== 3) && freeCorners >= 3;
        
        // Vérifier la collision avec le carré noir dans le niveau 4 (avant de permettre le mouvement)
        // Permettre au joueur de se rapprocher, mais bloquer et déclencher le dialogue s'il entre en collision
        if (canPass && currentLevel === 4 && !blackSquareCollisionHandled) {
            const blackWidth = blackSquare.width * tileSize;
            const blackHeight = blackSquare.height * tileSize;
            const playerLeft = newX;
            const playerRight = newX + player.size;
            const playerTop = newY;
            const playerBottom = newY + player.size;
            
            const blackLeft = blackSquare.x;
            const blackRight = blackSquare.x + blackWidth;
            const blackTop = blackSquare.y;
            const blackBottom = blackSquare.y + blackHeight;
            
            // Collision AABB - avec une marge pour détecter la proximité
            const margin = 2; // Marge de détection
            const wouldCollide = !(playerRight < blackLeft - margin || playerLeft > blackRight + margin || playerBottom < blackTop - margin || playerTop > blackBottom + margin);
            
            if (wouldCollide) {
                // Bloquer le mouvement et déclencher le dialogue
                canPass = false;
                blackSquareCollisionHandled = true;
                console.log("Collision avec le carré noir détectée, déclenchement du dialogue");
                showLevel4Dialogue();
            }
        }
        
        if (canPass) {
            player.x = newX;
            player.y = newY;
        }
    }
    
    
    // Note: La détection de collision avec le carré noir est maintenant gérée dans le code de prévention de mouvement
    // (lignes 584-603) pour éviter que le joueur ne puisse jamais déclencher le dialogue
    
    // Vérifier si on atteint Jenny à la fin dans le niveau 4
    if (currentLevel === 4) {
        const playerCenterX = player.x + player.size / 2;
        const playerCenterY = player.y + player.size / 2;
        const jennyCenterX = jenny.x + jenny.size / 2;
        const jennyCenterY = jenny.y + jenny.size / 2;
        
        const distanceToJenny = Math.sqrt(
            Math.pow(playerCenterX - jennyCenterX, 2) + Math.pow(playerCenterY - jennyCenterY, 2)
        );
        
        const jennyCollisionDistance = (player.size + jenny.size) / 2 + 4;
        
        if (distanceToJenny <= jennyCollisionDistance && !jennyLevel4Reached) {
            // Atteint Jenny à la fin - afficher le message
            jennyLevel4Reached = true;
            showJennyLevel4Message();
        }
    }
}

// Fonction pour dessiner l'avatar simple
function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.size, player.size);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(player.x, player.y, player.size, player.size);
    ctx.fillStyle = '#000';
    ctx.fillRect(player.x + 3, player.y + 3, 2, 2);
    ctx.fillRect(player.x + 11, player.y + 3, 2, 2);
}

// Fonction pour dessiner Jenny
function drawJenny() {
    ctx.fillStyle = jenny.color;
    ctx.fillRect(jenny.x, jenny.y, jenny.size, jenny.size);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(jenny.x, jenny.y, jenny.size, jenny.size);
    // Yeux (ajustés pour la taille de 12)
    ctx.fillStyle = '#000';
    ctx.fillRect(jenny.x + 2, jenny.y + 2, 2, 2);
    ctx.fillRect(jenny.x + 8, jenny.y + 2, 2, 2);
}

// Fonction de dessin
function draw() {
    if (!ctx || !canvas) return;
    
    const map = getCurrentMap();
    
    // Fond différent selon le niveau
    if (currentLevel === 1) {
        ctx.fillStyle = '#9bbc0f'; // Vert Game Boy pour donjon 1
    } else if (currentLevel === 4) {
        ctx.fillStyle = '#1a0a0a'; // Noir très foncé pour niveau 4 (boss fight)
    } else {
        ctx.fillStyle = '#2d1b1b'; // Rouge foncé pour donjon 2 (labyrinthe)
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dessiner la carte
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            const tileX = x * tileSize;
            const tileY = y * tileSize;
            
            if (map[y][x] === 1) {
                // Mur
                if (currentLevel === 4) {
                    // Niveau 4 - murs normaux
                    ctx.fillStyle = '#2d1b1b';
                    ctx.fillRect(tileX, tileY, tileSize, tileSize);
                    ctx.strokeStyle = '#1a0a0a';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(tileX, tileY, tileSize, tileSize);
                } else {
                    // Niveau 1 - utiliser le tileset si disponible, sinon fallback
                    if (tileSprite.complete && tileSprite.naturalWidth > 0) {
                        ctx.drawImage(tileSprite, 0, 0, tileSize, tileSize, tileX, tileY, tileSize, tileSize);
                    } else {
                        ctx.fillStyle = '#306230';
                        ctx.fillRect(tileX, tileY, tileSize, tileSize);
                        ctx.strokeStyle = '#0f380f';
                        ctx.lineWidth = 1;
                        ctx.strokeRect(tileX, tileY, tileSize, tileSize);
                    }
                }
            } else if (map[y][x] === 3) {
                // Bloc rouge (niveau 4) - rempli comme un boss fight
                ctx.fillStyle = '#8b0000';
                ctx.fillRect(tileX, tileY, tileSize, tileSize);
                ctx.strokeStyle = '#ff0000';
                ctx.lineWidth = 2;
                ctx.strokeRect(tileX, tileY, tileSize, tileSize);
                // Ajouter un motif pour plus d'impact
                ctx.fillStyle = '#5a0000';
                ctx.fillRect(tileX + 2, tileY + 2, tileSize - 4, tileSize - 4);
                // Détails rouges
                ctx.fillStyle = '#ff0000';
                ctx.fillRect(tileX + 4, tileY + 4, 2, 2);
                ctx.fillRect(tileX + 10, tileY + 4, 2, 2);
                ctx.fillRect(tileX + 4, tileY + 10, 2, 2);
                ctx.fillRect(tileX + 10, tileY + 10, 2, 2);
            } else if (map[y][x] === 2) {
                // Porte
                ctx.fillStyle = '#8b4513'; // Marron pour la porte
                ctx.fillRect(tileX, tileY, tileSize, tileSize);
                ctx.strokeStyle = '#654321';
                ctx.strokeRect(tileX, tileY, tileSize, tileSize);
                // Poignée
                ctx.fillStyle = '#ffd700';
                ctx.fillRect(tileX + 12, tileY + 6, 2, 4);
            } else if (map[y][x] === 0) {
                // Sol - utiliser le tileset avec des couleurs rouges
                if (currentLevel === 4) {
                    // Niveau 4 - sol sombre pour le boss fight
                    ctx.fillStyle = '#0a0a0a';
                    ctx.fillRect(tileX, tileY, tileSize, tileSize);
                    ctx.strokeStyle = '#1a0a0a';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(tileX, tileY, tileSize, tileSize);
                } else if (tileSprite.complete && tileSprite.naturalWidth > 0) {
                    // Dessiner une partie du tileset pour le sol (chercher une tuile rouge dans le tileset)
                    // On va utiliser différentes parties du tileset pour varier
                    const tileOffsetX = (x + y) % 3; // Variation pour le sol
                    const tileOffsetY = 1; // Ligne du tileset pour le sol
                    ctx.drawImage(
                        tileSprite, 
                        tileOffsetX * tileSize, 
                        tileOffsetY * tileSize, 
                        tileSize, 
                        tileSize, 
                        tileX, 
                        tileY, 
                        tileSize, 
                        tileSize
                    );
                } else {
                    // Fallback avec couleur rouge/brun pour le sol
                    ctx.fillStyle = '#8b4513'; // Brun/rouge pour le sol
                    ctx.fillRect(tileX, tileY, tileSize, tileSize);
                    // Ajouter un motif rouge
                    ctx.fillStyle = '#8b0000';
                    ctx.fillRect(tileX + 2, tileY + 2, tileSize - 4, tileSize - 4);
                }
            }
        }
    }
    
    
    // Dessiner le carré noir et Jenny si on est dans le niveau 4
    if (currentLevel === 4) {
        // Dessiner le carré noir au milieu (3 tiles de largeur)
        const blackWidth = blackSquare.width * tileSize;
        const blackHeight = blackSquare.height * tileSize;
        ctx.fillStyle = blackSquare.color;
        ctx.fillRect(blackSquare.x, blackSquare.y, blackWidth, blackHeight);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.strokeRect(blackSquare.x, blackSquare.y, blackWidth, blackHeight);
        
        // Dessiner Jenny à la fin
        drawJenny();
    }
    
    // Dessiner le joueur
    drawPlayer();
}

// Boucle principale
let animationFrameId = null;
function loop() {
    if (!dungeonInitialized || !scenes.dungeon || scenes.dungeon.classList.contains('hidden')) {
        return;
    }
    
    update();
    draw();
    animationFrameId = requestAnimationFrame(loop);
}

// Fonction pour afficher le message traumatisme
function showTraumaMessage() {
    if (traumaMessageShown) return; // Ne pas afficher plusieurs fois
    
    traumaMessageShown = true;
    const traumaMsg = document.getElementById('trauma-message');
    if (traumaMsg) {
        traumaMsg.classList.remove('hidden');
        stopDungeon();
        
        // Après 3 secondes, afficher le dialogue de Jordan
        setTimeout(() => {
            traumaMsg.classList.add('hidden');
            const jordanDialogue = document.getElementById('jordan-dialogue-trauma');
            if (jordanDialogue) {
                jordanDialogue.classList.remove('hidden');
            }
            
            // Après 2 secondes, jouer le son de porte et changer le labyrinthe
            setTimeout(() => {
                if (jordanDialogue) {
                    jordanDialogue.classList.add('hidden');
                }
                playDoorSound();
                
                // Changer au niveau 3 avec la porte
                currentLevel = 3;
                // Repositionner le joueur en bas du labyrinthe (sur une case libre)
                // Dans labyrinthMapWithDoor, ligne 18 colonne 14 est un mur, utiliser colonne 13
                player.x = 13 * tileSize; // Colonne 13 (libre à la ligne 18)
                player.y = 18 * tileSize; // Ligne 18 (libre)�s du centre)
                // Reprendre le jeu
                loop();
            }, 2000);
        }, 3000);
    }
}

// Fonction pour arrêter le donjon
export function stopDungeon() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    if (jennySoundAudio) {
        jennySoundAudio.pause();
    }
    if (cryAudio) {
        cryAudio.pause();
    }
}

// Fonction pour afficher le dialogue du niveau 4
function showLevel4Dialogue() {
    level4DialogueStep = 1;
    const dialogueBox = document.getElementById('dungeon-dialogue-level4');
    const dialogueText = document.getElementById('level4-dialogue-text');
    const inputArea = document.getElementById('level4-input-area');
    const nextBtn = document.getElementById('level4-next-btn');
    const questionArea = document.getElementById('level4-question-area');
    
    if (dialogueBox) {
        dialogueBox.classList.remove('hidden');
        inputArea.classList.add('hidden');
        nextBtn.classList.add('hidden');
        questionArea.classList.add('hidden');
        updateLevel4Dialogue();
    }
}

// Fonction pour mettre à jour le dialogue du niveau 4
function updateLevel4Dialogue() {
    const dialogueText = document.getElementById('level4-dialogue-text');
    const inputArea = document.getElementById('level4-input-area');
    const nextBtn = document.getElementById('level4-next-btn');
    const questionArea = document.getElementById('level4-question-area');
    const input = document.getElementById('level4-user-input');
    
    if (!dialogueText) return;
    
    if (level4DialogueStep === 1) {
        // Premier dialogue de la fierté
        dialogueText.innerText = "Pourquoi tu veux t'excuser pour quelqu'un que tu connais à peine ?";
        nextBtn.classList.remove('hidden');
    } else if (level4DialogueStep === 2) {
        // Deuxième dialogue de la fierté
        dialogueText.innerText = "Quelqu'un de dégoûtant, un enfant immature qui ne sait rien de toi.";
        nextBtn.classList.remove('hidden');
    } else if (level4DialogueStep === 3) {
        // Troisième dialogue de la fierté
        dialogueText.innerText = "En plus t'excuser alors que tu n'as même pas tort, c'est un non-sens.";
        nextBtn.classList.remove('hidden');
    } else if (level4DialogueStep === 4) {
        // Réponse de Jordan avec champ de saisie
        dialogueText.innerText = "Jordan : C'est vrai tu as raison, elle n'a pas conscience de mes ...";
        inputArea.classList.remove('hidden');
        input.value = "";
        input.focus();
        // Le bouton CONTINUER est visible mais désactivé jusqu'à ce qu'elle tape quelque chose
        nextBtn.classList.remove('hidden');
        nextBtn.disabled = true;
        nextBtn.style.opacity = '0.5';
        nextBtn.style.cursor = 'not-allowed';
        // Détecter quand l'utilisateur tape pour activer le bouton
        input.oninput = function() {
            if (input.value.trim().length > 0) {
                nextBtn.disabled = false;
                nextBtn.style.opacity = '1';
                nextBtn.style.cursor = 'pointer';
            } else {
                nextBtn.disabled = true;
                nextBtn.style.opacity = '0.5';
                nextBtn.style.cursor = 'not-allowed';
            }
        };
        input.onkeypress = function(e) {
            if (e.key === 'Enter' && !nextBtn.disabled) {
                checkLevel4Answer();
            }
        };
    } else if (level4DialogueStep === 5) {
        // Après la réponse correcte, afficher la question
        dialogueText.innerText = "Jordan : C'est vrai tu as raison, elle n'a pas conscience de mes traumatismes et elle ne sait même rien sur moi.";
        inputArea.classList.add('hidden');
        nextBtn.classList.remove('hidden');
        // Réinitialiser le bouton (réactiver)
        nextBtn.disabled = false;
        nextBtn.style.opacity = '1';
        nextBtn.style.cursor = 'pointer';
    } else if (level4DialogueStep === 6) {
        // Afficher la question sur les informations
        dialogueText.innerText = "";
        nextBtn.classList.add('hidden');
        questionArea.classList.remove('hidden');
        // Focus sur le champ de saisie
        const infoInput = document.getElementById('level4-info-input');
        if (infoInput) {
            infoInput.value = "";
            infoInput.focus();
            infoInput.onkeypress = function(e) {
                if (e.key === 'Enter') {
                    submitLevel4Info();
                }
            };
        }
    } else if (level4DialogueStep === 7) {
        // Message de Jordan après réponse correcte
        dialogueText.innerText = "Jordan : Certes elle ne sait rien de moi mais je suis l'adulte de nous deux donc je dois m'excuser c'est ça le message.";
        questionArea.classList.add('hidden');
        nextBtn.classList.remove('hidden');
        nextBtn.disabled = false;
        nextBtn.style.opacity = '1';
        nextBtn.style.cursor = 'pointer';
    } else if (level4DialogueStep === 8) {
        // Fermer le dialogue et permettre au joueur de continuer vers Jenny
        const dialogueBox = document.getElementById('dungeon-dialogue-level4');
        if (dialogueBox) {
            dialogueBox.classList.add('hidden');
        }
        // Réinitialiser le flag pour permettre le mouvement
        level4DialogueStep = 0; // Réinitialiser pour permettre le mouvement
    } else if (level4DialogueStep === 9) {
        // Message "Message pour Jenny" avec bouton LIRE
        dialogueText.innerText = "Message pour Jenny";
        questionArea.classList.add('hidden');
        nextBtn.classList.remove('hidden');
        const continueBtn = document.getElementById('level4-continue-btn');
        if (continueBtn) {
            continueBtn.innerText = "LIRE";
        }
        nextBtn.disabled = false;
        nextBtn.style.opacity = '1';
        nextBtn.style.cursor = 'pointer';
    } else if (level4DialogueStep === 10) {
        // Afficher le message d'excuse reformulé et plus sincère
        dialogueText.innerHTML = `
            <h2 style="color: #d63031; font-family: 'Special Elite', monospace; margin-top: 0;">Pardon...</h2>
            <p style="color: #e0e0e0; font-family: 'Special Elite', monospace; font-size: 1.1rem; margin: 10px 0;">
                Je m'excuse pour t'avoir fait surréagir en me ressassant le passé. C'est quelque chose qui ne m'est certes pas arrivé, mais que je vois beaucoup dans mon entourage.
            </p>
            <p style="color: #e0e0e0; font-family: 'Special Elite', monospace; font-size: 1.1rem; margin: 10px 0;">
                Tu es importante pour moi. Je suis désolé pour ce que j'ai dit/fait.
            </p>
            <p style="color: #e0e0e0; font-family: 'Special Elite', monospace; font-size: 1.1rem; margin: 10px 0;">
                Est-ce qu'on peut rallumer la lumière ensemble ?
            </p>
            <div style="text-align: right; margin-top: 20px; font-weight: bold; color: #e0e0e0; font-family: 'Special Elite', monospace;">
                - Ton pote (le beau gosse de 1m92)
            </div>
        `;
        const continueBtn = document.getElementById('level4-continue-btn');
        if (continueBtn) {
            continueBtn.innerText = "CONTINUER";
        }
        nextBtn.classList.remove('hidden');
        nextBtn.disabled = false;
        nextBtn.style.opacity = '1';
        nextBtn.style.cursor = 'pointer';
    } else if (level4DialogueStep === 11) {
        // Demander si le joueur veut continuer le jeu
        dialogueText.innerHTML = `
            <p style="color: #e0e0e0; font-family: 'Special Elite', monospace; font-size: 1.2rem; margin: 20px 0;">
                Veux-tu continuer le jeu ?
            </p>
        `;
        const continueBtn = document.getElementById('level4-continue-btn');
        if (continueBtn) {
            continueBtn.innerText = "CONTINUER";
        }
        nextBtn.classList.remove('hidden');
        nextBtn.disabled = false;
        nextBtn.style.opacity = '1';
        nextBtn.style.cursor = 'pointer';
    }
}

// Fonction pour passer au dialogue suivant
export function nextLevel4Dialogue() {
    // Si on est à l'étape 4 (saisie), vérifier la réponse avant de continuer
    if (level4DialogueStep === 4) {
        checkLevel4Answer();
    } else if (level4DialogueStep === 11) {
        // Rediriger vers WhatsApp
        window.location.href = 'https://wa.me/4915156684392';
    } else {
        level4DialogueStep++;
        updateLevel4Dialogue();
    }
}

// Fonction pour vérifier la réponse du joueur
function checkLevel4Answer() {
    const input = document.getElementById('level4-user-input');
    if (!input) return;
    
    const answer = input.value.toLowerCase().trim();
    
    // Passer directement à l'étape suivante sans vérifier la réponse
    level4DialogueStep = 5;
    updateLevel4Dialogue();
}

// Fonction pour vérifier les informations sur Jordan
export function submitLevel4Info() {
    const input = document.getElementById('level4-info-input');
    if (!input) return;
    
    const answer = input.value.trim();
    
    // Vérifier si la réponse contient "1,92", "1,9" ou "2" (peu importe les autres caractères)
    // Accepter différentes variations : 1,92 / 1.92 / 1,9 / 1.9 / 2
    const has192 = /1[,.]\s*9\s*2/.test(answer) || /1[,.]92/.test(answer);
    const has19 = /1[,.]\s*9/.test(answer);
    const has2 = /\b2\b/.test(answer);
    
    if (has192 || has19 || has2) {
        // Réponse correcte - afficher le message de Jordan
        level4DialogueStep = 7;
        updateLevel4Dialogue();
    } else {
        // Réponse incorrecte - déclencher le jumpscare avec message "tu n'as rien"
        triggerJumpscareWithMessage("tu n'as rien");
    }
}

// Fonction pour déclencher un jumpscare avec un message personnalisé
function triggerJumpscareWithMessage(message) {
    // Utiliser la fonction triggerJumpscare existante mais avec un message personnalisé
    const overlay = document.getElementById('overlay');
    if (overlay) {
        overlay.classList.remove('hidden');
        // Afficher le message personnalisé
        let overlayText = overlay.querySelector('p');
        if (!overlayText) {
            overlayText = document.createElement('p');
            overlay.appendChild(overlayText);
        }
        overlayText.innerText = message.toUpperCase();
        overlayText.style.fontSize = '3rem';
        overlayText.style.color = '#ff0000';
        overlayText.style.textShadow = '0 0 20px #ff0000';
        overlayText.style.fontFamily = 'Creepster, cursive';
    }
    
    // Utiliser triggerJumpscare pour le reste (audio et reset)
    triggerJumpscare();
}

// Fonction pour afficher le message quand on atteint Jenny dans le niveau 4
function showJennyLevel4Message() {
    const dialogueBox = document.getElementById('dungeon-dialogue-level4');
    const dialogueText = document.getElementById('level4-dialogue-text');
    const questionArea = document.getElementById('level4-question-area');
    const nextBtn = document.getElementById('level4-next-btn');
    
    if (dialogueBox && dialogueText) {
        dialogueBox.classList.remove('hidden');
        questionArea.classList.add('hidden');
        level4DialogueStep = 9; // Étape pour "Message pour Jenny"
        updateLevel4Dialogue();
    }
}
