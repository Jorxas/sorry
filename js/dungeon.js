import { scenes } from './domElements.js';

// Variables du donjon
let canvas, ctx;
let dungeonInitialized = false;
let currentLevel = 1; // 1 = donjon, 2 = labyrinthe initial, 3 = labyrinthe avec porte
let jennySoundPlayed = false; // Pour savoir si le son a été joué au moins une fois
let jennySoundHeard = false; // Pour savoir si le joueur a répondu
let canMove = false; // Pour bloquer le mouvement jusqu'à la fin du dialogue
let traumaMessageShown = false; // Pour savoir si le message traumatisme a été affiché

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

// Nouveau labyrinthe avec porte en haut (0 = sol, 1 = mur, 2 = porte)
const labyrinthMapWithDoor = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,1,1,1,1,1,1,1,1,1,1,1,1,1,1], // Porte en haut au milieu
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
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
export function handleMobileTouch(key, isPressed) {
    keys[key] = isPressed;
    // Empêcher le comportement par défaut
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
    } else if (currentLevel === 2) {
        return labyrinthMap;
    } else {
        return labyrinthMapWithDoor; // Niveau 3 avec porte
    }
}

// Fonction pour vérifier l'orientation
function checkOrientation() {
    const rotateMessage = document.getElementById('rotate-message');
    if (rotateMessage) {
        const isMobile = window.innerWidth <= 768;
        const isPortrait = window.innerHeight > window.innerWidth;
        if (isMobile && isPortrait) {
            rotateMessage.classList.remove('hidden');
        } else {
            rotateMessage.classList.add('hidden');
        }
    }
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
        // Sur mobile en mode paysage, prendre toute la taille de l'écran
        if (window.innerHeight < window.innerWidth) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        } else {
            // En mode portrait, utiliser les dimensions inversées
            canvas.width = window.innerHeight;
            canvas.height = window.innerWidth;
        }
    } else {
        // Sur desktop, taille fixe
        canvas.width = 480;
        canvas.height = 320;
    }
    ctx.imageSmoothingEnabled = false;
    
    // Réinitialiser au niveau 1
    currentLevel = 1;
    player.x = 32;
    player.y = 32;
    jennySoundPlayed = false;
    jennySoundHeard = false;
    canMove = false; // Bloquer le mouvement jusqu'à la fin du dialogue
    
    // Position de Jenny à la fin du labyrinthe
    // Positionner Jenny au centre en bas du labyrinthe (deux chemins y mènent)
    // Colonne 14-15 est accessible depuis deux chemins (gauche et droite)
    jenny.x = 14 * tileSize + 2; // Centre horizontal avec petit offset
    jenny.y = 18 * tileSize + 2; // Presque en bas (ligne 18) avec petit offset
    
    // Jouer le son de Jenny une fois au démarrage
    setTimeout(() => {
        playJennySound();
    }, 1000); // Attendre 1 seconde avant de jouer le son
    
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
                const isPortrait = window.innerHeight > window.innerWidth;
                if (!isPortrait) {
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight;
                }
            } else {
                canvas.width = 480;
                canvas.height = 320;
            }
            checkOrientation();
        }
    });
    
    // Vérifier l'orientation au chargement
    checkOrientation();
    
    dungeonInitialized = true;
    
    if (imagesLoaded === totalImages) {
        loop();
    }
}

// Fonction pour changer de niveau
function changeLevel() {
    currentLevel = 2;
    // Position de départ dans le labyrinthe (en haut à gauche)
    player.x = 16;
    player.y = 16;
    
    // Arrêter le son de Jenny si il joue encore
    if (jennySoundAudio) {
        jennySoundAudio.pause();
    }
    
    // Jouer le son de pleur en boucle dans le donjon 2
    if (!cryAudio) {
        cryAudio = document.getElementById('cry-audio');
    }
    if (cryAudio) {
        cryAudio.volume = 0.3;
        cryAudio.loop = true;
        const playPromise = cryAudio.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => {
                console.log("Impossible de jouer le son de pleur", e);
            });
        }
    }
}

// Fonction de mise à jour
function update() {
    // Ne pas permettre le mouvement si le dialogue n'est pas terminé (niveau 1)
    if (currentLevel === 1 && !jennySoundHeard) {
        return;
    }
    
    // Ne pas permettre le mouvement si le message traumatisme est affich� (mais permettre au niveau 3)
    // Au niveau 3, le joueur doit pouvoir se d�placer vers la porte
    if (currentLevel !== 3) {
        const traumaMsg = document.getElementById('trauma-message');
        const jordanDialogue = document.getElementById('jordan-dialogue-trauma');
        if (traumaMessageShown && ((traumaMsg && !traumaMsg.classList.contains('hidden')) ||
            (jordanDialogue && !jordanDialogue.classList.contains('hidden')))) {
            return;
        }
    }
    
    const map = getCurrentMap();
    
    let newX = player.x;
    let newY = player.y;
    
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
        
        // Vérifier si on entre dans la porte (niveau 1)
        if (currentLevel === 1 && (centerTile === 2 || tile1 === 2 || tile2 === 2 || tile3 === 2 || tile4 === 2)) {
            changeLevel();
            return;
        }
        
        // Vérifier les collisions avec les murs
        // Le centre doit être libre, et au moins 3 des 4 coins doivent être libres
        const freeCorners = [tile1, tile2, tile3, tile4].filter(t => t !== 1 && t !== 2).length;
        const canPass = (centerTile !== 1 && centerTile !== 2) && freeCorners >= 3;
        
        if (canPass) {
            player.x = newX;
            player.y = newY;
        }
    }
    
    // Vérifier si on atteint Jenny (niveau 2)
    if (currentLevel === 2) {
        // Vérifier la collision avec Jenny en utilisant les rectangles
        const playerCenterX = player.x + player.size / 2;
        const playerCenterY = player.y + player.size / 2;
        const jennyCenterX = jenny.x + jenny.size / 2;
        const jennyCenterY = jenny.y + jenny.size / 2;
        
        const distance = Math.sqrt(
            Math.pow(playerCenterX - jennyCenterX, 2) + Math.pow(playerCenterY - jennyCenterY, 2)
        );
        
        // Distance de collision : plus permissive pour faciliter la détection
        // On utilise la somme des tailles pour être sûr de détecter la collision
        const collisionDistance = (player.size + jenny.size) / 2 + 4; // +4 pixels de marge
        
        if (distance <= collisionDistance && !traumaMessageShown) {
            // Atteint le carré rose - afficher le message traumatisme
            console.log("Collision avec Jenny détectée ! Distance:", distance, "Seuil:", collisionDistance);
            showTraumaMessage();
        }
    }
    
    // Vérifier si on entre dans la porte du niveau 3 (en haut)
    if (currentLevel === 3) {
        const tileX = Math.floor(player.x / tileSize);
        const tileY = Math.floor(player.y / tileSize);
        const map = getCurrentMap();
        if (tileY >= 0 && tileY < map.length && tileX >= 0 && tileX < map[0].length) {
            // Vérifier si on est dans la zone de la porte (en haut, colonnes 13-15)
            if (tileY === 0 && tileX >= 13 && tileX <= 15) {
                // Entré dans la porte - passer à la scène du cœur
                stopDungeon();
                scenes.dungeon.classList.add('hidden');
                scenes.heart.classList.remove('hidden');
            }
        }
    }
    
    // Vérifier si on entre dans la porte du niveau 3
    if (currentLevel === 3) {
        const tileX = Math.floor(player.x / tileSize);
        const tileY = Math.floor(player.y / tileSize);
        const map = getCurrentMap();
        if (tileY >= 0 && tileY < map.length && tileX >= 0 && tileX < map[0].length) {
            if (map[tileY][tileX] === 2) {
                // Entré dans la porte - passer à la scène du cœur
                stopDungeon();
                scenes.dungeon.classList.add('hidden');
                scenes.heart.classList.remove('hidden');
            }
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
                // Mur - toujours utiliser les couleurs pour le niveau 2 pour garantir la visibilité
                if (currentLevel === 2 || currentLevel === 3) {
                    // Murs très visibles dans le labyrinthe (rouge foncé avec contour)
                    ctx.fillStyle = '#5a1a1a';
                    ctx.fillRect(tileX, tileY, tileSize, tileSize);
                    ctx.strokeStyle = '#8b0000';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(tileX, tileY, tileSize, tileSize);
                    // Ajouter un motif pour plus de visibilité
                    ctx.fillStyle = '#3a0a0a';
                    ctx.fillRect(tileX + 2, tileY + 2, tileSize - 4, tileSize - 4);
                    // Ajouter des détails pour plus de contraste
                    ctx.fillStyle = '#8b0000';
                    ctx.fillRect(tileX + 4, tileY + 4, 2, 2);
                    ctx.fillRect(tileX + 10, tileY + 4, 2, 2);
                    ctx.fillRect(tileX + 4, tileY + 10, 2, 2);
                    ctx.fillRect(tileX + 10, tileY + 10, 2, 2);
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
            } else if (map[y][x] === 2) {
                // Porte
                ctx.fillStyle = '#8b4513'; // Marron pour la porte
                ctx.fillRect(tileX, tileY, tileSize, tileSize);
                ctx.strokeStyle = '#654321';
                ctx.strokeRect(tileX, tileY, tileSize, tileSize);
                // Poignée
                ctx.fillStyle = '#ffd700';
                ctx.fillRect(tileX + 12, tileY + 6, 2, 4);
            } else {
                // Sol - utiliser le tileset avec des couleurs rouges
                if (tileSprite.complete && tileSprite.naturalWidth > 0) {
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
    
    // Dessiner Jenny si on est dans le labyrinthe initial (niveau 2)
    if (currentLevel === 2) {
        drawJenny();
    }
    
    // Dessiner la porte si on est dans le niveau 3
    if (currentLevel === 3) {
        const doorX = 13 * tileSize;
        const doorY = 0;
        ctx.fillStyle = '#8b4513';
        ctx.fillRect(doorX, doorY, tileSize * 3, tileSize);
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        ctx.strokeRect(doorX, doorY, tileSize * 3, tileSize);
        // Poignées
        ctx.fillStyle = '#ffd700';
        ctx.fillRect(doorX + 10, doorY + 4, 2, 4);
        ctx.fillRect(doorX + tileSize * 3 - 12, doorY + 4, 2, 4);
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
                // Repositionner le joueur en bas du labyrinthe (au centre)
                player.x = 14 * tileSize; // Colonne 14 (libre)
                player.y = 17 * tileSize; // Ligne 17 (libre, pr�s du centre)
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
