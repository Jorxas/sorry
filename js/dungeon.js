import { scenes } from './domElements.js';

// Variables du donjon
let canvas, ctx;
let dungeonInitialized = false;
let currentLevel = 1; // 1 = donjon, 2 = labyrinthe
let jennySoundPlayed = false; // Pour savoir si le son a été joué au moins une fois
let jennySoundHeard = false; // Pour savoir si le joueur a répondu

// Charger l'image du tileset
const tileSprite = new Image();
tileSprite.src = "img/titleset.png";

// Variables de chargement
let imagesLoaded = 0;
const totalImages = 1;

// Joueur - avatar simple (carré coloré style Game Boy)
const player = {
    x: 32,
    y: 32,
    size: 16,
    speed: 2,
    color: '#4a90e2'
};

// Jenny - carré rose à la fin du labyrinthe
const jenny = {
    x: 0,
    y: 0,
    size: 16,
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

// Labyrinthe (0 = sol, 1 = mur)
const labyrinthMap = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,1],
    [1,0,1,0,1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,1,1,1,0,1],
    [1,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1,1,1,0,1],
    [1,0,0,0,1,0,1,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,1],
    [1,1,1,0,1,0,1,0,1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1,1,0,1,1,1,1],
    [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,0,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
    [1,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1],
    [1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,1,1,1,1,0,1,0,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,1,1,1,1,0,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// Ajouter une porte dans le donjon (à droite, au milieu)
dungeonMap[10][28] = 2; // Porte à la position (28, 10)

const tileSize = 16;

// Contrôles
const keys = {};

// Fonction pour gérer les touches mobiles
export function handleMobileTouch(key, isPressed) {
    keys[key] = isPressed;
    // Empêcher le comportement par défaut
    return false;
}

// Son de Jenny
let jennySoundAudio = null;

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
            
            // Cacher le dialogue après 3 secondes supplémentaires
            setTimeout(() => {
                dialogue.classList.add('hidden');
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
    return currentLevel === 1 ? dungeonMap : labyrinthMap;
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
        // Sur mobile, prendre toute la taille de l'écran
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
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
    
    // Position de Jenny à la fin du labyrinthe
    jenny.x = 28 * tileSize;
    jenny.y = 18 * tileSize;
    
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
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            } else {
                canvas.width = 480;
                canvas.height = 320;
            }
        }
    });
    
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
}

// Fonction de mise à jour
function update() {
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
    
    // Collision avec les murs
    const tileX = Math.floor(newX / tileSize);
    const tileY = Math.floor(newY / tileSize);
    const tileX2 = Math.floor((newX + player.size - 1) / tileSize);
    const tileY2 = Math.floor((newY + player.size - 1) / tileSize);
    
    if (tileY >= 0 && tileY < map.length && tileX >= 0 && tileX < map[0].length) {
        const tile1 = map[tileY][tileX];
        const tile2 = map[tileY][tileX2];
        const tile3 = map[tileY2][tileX];
        const tile4 = map[tileY2][tileX2];
        
        // Vérifier si on entre dans la porte (niveau 1)
        if (currentLevel === 1 && (tile1 === 2 || tile2 === 2 || tile3 === 2 || tile4 === 2)) {
            changeLevel();
            return;
        }
        
        // Vérifier les collisions avec les murs
        if (tile1 !== 1 && tile2 !== 1 && tile3 !== 1 && tile4 !== 1 && tile1 !== 2 && tile2 !== 2 && tile3 !== 2 && tile4 !== 2) {
            player.x = newX;
            player.y = newY;
        }
    }
    
    // Vérifier si on atteint Jenny (niveau 2)
    if (currentLevel === 2) {
        const distance = Math.sqrt(
            Math.pow(player.x - jenny.x, 2) + Math.pow(player.y - jenny.y, 2)
        );
        if (distance < player.size) {
            // Jenny trouvée ! Passer à la scène du cœur
            stopDungeon();
            scenes.dungeon.classList.add('hidden');
            scenes.heart.classList.remove('hidden');
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
    // Yeux
    ctx.fillStyle = '#000';
    ctx.fillRect(jenny.x + 3, jenny.y + 3, 2, 2);
    ctx.fillRect(jenny.x + 11, jenny.y + 3, 2, 2);
}

// Fonction de dessin
function draw() {
    if (!ctx || !canvas) return;
    
    const map = getCurrentMap();
    
    ctx.fillStyle = '#9bbc0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dessiner la carte
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            const tileX = x * tileSize;
            const tileY = y * tileSize;
            
            if (map[y][x] === 1) {
                // Mur
                if (tileSprite.complete && tileSprite.naturalWidth > 0) {
                    ctx.drawImage(tileSprite, 0, 0, tileSize, tileSize, tileX, tileY, tileSize, tileSize);
                } else {
                    ctx.fillStyle = '#306230';
                    ctx.fillRect(tileX, tileY, tileSize, tileSize);
                    ctx.strokeStyle = '#0f380f';
                    ctx.strokeRect(tileX, tileY, tileSize, tileSize);
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
                // Sol
                if (tileSprite.complete && tileSprite.naturalWidth > 0) {
                    ctx.drawImage(tileSprite, tileSize, 0, tileSize, tileSize, tileX, tileY, tileSize, tileSize);
                } else {
                    ctx.fillStyle = '#8bac0f';
                    ctx.fillRect(tileX, tileY, tileSize, tileSize);
                }
            }
        }
    }
    
    // Dessiner Jenny si on est dans le labyrinthe
    if (currentLevel === 2) {
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

// Fonction pour arrêter le donjon
export function stopDungeon() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    if (jennySoundAudio) {
        jennySoundAudio.pause();
    }
}
