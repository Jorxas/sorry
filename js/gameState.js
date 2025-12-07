// Game State - Objet mutable pour permettre les modifications
export const gameState = {
    torchesLit: 0,
    step: 0,
    heartClicks: 0,
    playerName: ""
};

export function resetGameState() {
    gameState.torchesLit = 0;
    gameState.step = 0;
    gameState.heartClicks = 0;
    gameState.playerName = "";
}
