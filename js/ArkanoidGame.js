import { Application, Container } from 'pixi.js';
import { GAME, COLORS, SCORE_PER_BRICK } from './utils/constants.js';
import { InputSystem } from './systems/InputSystem.js';
import { CollisionSystem } from './systems/CollisionSystem.js';
import { Paddle } from './entities/Paddle.js';
import { Ball } from './entities/Ball.js';
import { LevelBuilder } from './systems/LevelBuilder.js';

export class ArkanoidGame {
    constructor(containerId) {
        this.containerId = containerId;

        this.app    = null;  // Pixi Application — рендерер + ticker
        this.world  = null;  // игровой мир: паддл, мяч, блоки
        this.hud    = null;  // UI-слой поверх мира: очки, жизни, оверлеи

        this.input  = new InputSystem();
        this.paddle = null;
        this.ball   = null;
        this.bricks = [];
        this.score  = 0;
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

        // Два слоя: world снизу, hud сверху.
        this.world = new Container();
        this.hud   = new Container();
        this.app.stage.addChild(this.world, this.hud);

        // Сущности
        this.paddle = new Paddle();
        this.ball   = new Ball();
        this.world.addChild(this.paddle.view, this.ball.view);

        // Блоки
        this.bricks = LevelBuilder.build();
        for (const brick of this.bricks) {
            this.world.addChild(brick.view);
        }

        this.app.ticker.add(this.update, this);
    }

    update(ticker) {
        const dt = ticker.deltaTime;

        // 1. Движение
        this.paddle.update(this.input, dt);
        this.ball.update(dt);

        // 2. Стены
        const wallResult = CollisionSystem.ballVsWalls(this.ball);
        if (wallResult === 'bottom') {
            // Пока — просто рестарт мяча. На шаге 9 — потеря жизни.
            this.ball.reset();
        }

        // 3. Ракетка
        CollisionSystem.ballVsPaddle(this.ball, this.paddle);

        // 4. Блоки
        const brickHit = CollisionSystem.ballVsBricks(this.ball, this.bricks);
        if (brickHit && brickHit.destroyed) {
            this.world.removeChild(brickHit.brick.view);
            this.score += SCORE_PER_BRICK;
            console.log('Score:', this.score);
        }

        // 5. Победа
        if (CollisionSystem.allBricksDestroyed(this.bricks)) {
            console.log('VICTORY! Final score:', this.score);
        }

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