import { Application, Container } from 'pixi.js';
import { GAME, COLORS, SCORE_PER_BRICK, STATE, STARTING_LIVES } from './utils/constants.js';
import { InputSystem } from './systems/InputSystem.js';
import { CollisionSystem } from './systems/CollisionSystem.js';
import { Paddle } from './entities/Paddle.js';
import { Ball } from './entities/Ball.js';
import { LevelBuilder } from './systems/LevelBuilder.js';

export class ArkanoidGame {
    constructor(containerId) {
        this.containerId = containerId;

        this.app    = null;
        this.world  = null;
        this.hud    = null;

        this.input  = new InputSystem();
        this.paddle = null;
        this.ball   = null;
        this.bricks = [];
        this.score  = 0;

        this.state  = STATE.MENU;
        this.lives  = STARTING_LIVES;

        this._overlay      = null;
        this._overlayTitle = null;
        this._overlayText  = null;
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

        this.paddle = new Paddle();
        this.ball   = new Ball();
        this.world.addChild(this.paddle.view, this.ball.view);

        this.bricks = LevelBuilder.build();
        for (const brick of this.bricks) {
            this.world.addChild(brick.view);
        }

        this._overlay      = document.getElementById('overlay');
        this._overlayTitle = document.getElementById('overlay-title');
        this._overlayText  = document.getElementById('overlay-text');

        this.setState(STATE.MENU);

        this.app.ticker.add(this.update, this);
    }

    update(ticker) {
        const dt = ticker.deltaTime;

        // Не PLAYING — игра заморожена, только читаем клавиши.
        if (this.state !== STATE.PLAYING) {
            this._handleNonPlayingState();
            this.input.endFrame();
            return;
        }

        // Esc — пауза.
        if (this.input.wasPressed('escape')) {
            this.setState(STATE.PAUSED);
            this.input.endFrame();
            return;
        }

        // Движение
        this.paddle.update(this.input, dt);
        this.ball.update(dt);

        // Стены
        const wallResult = CollisionSystem.ballVsWalls(this.ball);
        if (wallResult === 'bottom') {
            this._loseLife();
            this.input.endFrame();
            return;
        }

        // Ракетка
        CollisionSystem.ballVsPaddle(this.ball, this.paddle);

        // Блоки
        const brickHit = CollisionSystem.ballVsBricks(this.ball, this.bricks);
        if (brickHit && brickHit.destroyed) {
            this.world.removeChild(brickHit.brick.view);
            this.score += SCORE_PER_BRICK;
        }

        // Победа
        if (CollisionSystem.allBricksDestroyed(this.bricks)) {
            this.setState(STATE.VICTORY);
        }

        this.input.endFrame();
    }

    _handleNonPlayingState() {
        const space = this.input.wasPressed(' ');
        const esc   = this.input.wasPressed('escape');

        if (this.state === STATE.MENU && space) {
            this._startNewGame();
        } else if (this.state === STATE.PAUSED && (esc || space)) {
            this.setState(STATE.PLAYING);
        } else if ((this.state === STATE.GAME_OVER || this.state === STATE.VICTORY) && space) {
            this._startNewGame();
        }
    }

    _loseLife() {
        this.lives -= 1;

        if (this.lives <= 0) {
            this.setState(STATE.GAME_OVER);
            return;
        }

        this.paddle.reset();
        this.ball.reset();
    }

    _startNewGame() {
        this.score = 0;
        this.lives = STARTING_LIVES;
        this.paddle.reset();
        this.ball.reset();

        // Убираем старые блоки со сцены и строим новые.
        for (const brick of this.bricks) {
            if (brick.view.parent) brick.view.parent.removeChild(brick.view);
        }
        this.bricks = LevelBuilder.build();
        for (const brick of this.bricks) {
            this.world.addChild(brick.view);
        }

        this.setState(STATE.PLAYING);
    }

    setState(newState) {
        this.state = newState;

        switch (newState) {
            case STATE.MENU:
                this._showOverlay('ARKANOID', 'Press SPACE to start');
                break;
            case STATE.PLAYING:
                this._hideOverlay();
                break;
            case STATE.PAUSED:
                this._showOverlay('PAUSED', 'Press ESC to resume');
                break;
            case STATE.GAME_OVER:
                this._showOverlay('GAME OVER', `Score: ${this.score}\nPress SPACE to restart`);
                break;
            case STATE.VICTORY:
                this._showOverlay('VICTORY!', `Score: ${this.score}\nPress SPACE to restart`);
                break;
        }
    }

    _showOverlay(title, text) {
        this._overlayTitle.textContent = title;
        this._overlayText.textContent  = text;
        this._overlay.classList.add('visible');
    }

    _hideOverlay() {
        this._overlay.classList.remove('visible');
    }

    destroy() {
        if (!this.app) return;
        this.app.ticker.remove(this.update, this);
        this.input.destroy();
        this.app.destroy(true, { children: true, texture: true });
        this.app = null;
    }
}