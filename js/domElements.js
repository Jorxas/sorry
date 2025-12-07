// Elements DOM
// S'assurer que le DOM est chargé avant d'accéder aux éléments
function getElementById(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.error(`Élément ${id} non trouvé dans le DOM`);
    }
    return element;
}

export const scenes = {
    intro: getElementById('scene-intro'),
    torches: getElementById('scene-torches'),
    dialogue: getElementById('dialogue-box'),
    dungeon: getElementById('scene-dungeon'),
    heart: getElementById('scene-heart'),
    letter: getElementById('final-letter')
};
export const overlay = getElementById('jumpscare-overlay');
export const container = getElementById('game-container');
export const centerTorch = getElementById('t-center');

