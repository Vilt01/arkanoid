import { ArkanoidGame } from './ArkanoidGame.js';

window.addEventListener('DOMContentLoaded', async () => {
    const game = new ArkanoidGame('game-container');
    await game.init();
    
    window.game = game;
});