import { Application, Container } from 'pixi.js';
import { GAME, COLORS } from './utils/constants.js';
import { InputSystem } from './systems/InputSystem.js';

export class ArkanoidGame {
    constructor(containerId) {
        this.containerId = containerId;

        this.app   = null;  // Pixi Application — рендерер + ticker
        this.world = null;  // игровой мир: паддл, мяч, блоки
        this.hud   = null;  // UI-слой поверх мира: очки, жизни, оверлеи

        this.input = new InputSystem();
    }

    async init() {
        this.app = new Application();

        await this.app.init({
            width: GAME.WIDTH,
            height: GAME.HEIGHT,
            background: COLORS.BG,
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
        });

        const container = document.getElementById(this.containerId);
        if (!container) {
            throw new Error(`Container #${this.containerId} not found`);
        }
        container.appendChild(this.app.canvas);

        this.world = new Container();
        this.hud   = new Container();
        this.app.stage.addChild(this.world, this.hud);

        this.app.ticker.add(this.update, this);
    }

    update(_ticker) {
        
        this.input.endFrame();
    }

    destroy() {
        if (!this.app) return;
        this.app.ticker.remove(this.update, this);
        this.input.destroy();
        this.app.destroy(true, { children: true, texture: true });
        this.app = null;
    }
}