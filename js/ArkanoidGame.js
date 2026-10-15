import { Application, Container } from 'pixi.js';
import { GAME, COLORS, SCORE_PER_BRICK, STATE, STARTING_LIVES } from './utils/constants.js';
import { InputSystem } from './systems/InputSystem.js';
import { CollisionSystem } from './systems/CollisionSystem.js';
import { Hud } from './systems/Hud.js';
import { SoundSystem } from './systems/SoundSystem.js';
import { Paddle } from './entities/Paddle.js';
import { Ball } from './entities/Ball.js';
import { LevelBuilder } from './systems/LevelBuilder.js';

const DESTROY_DURATION = 0.15;
const SHAKE_DURATION   = 0.25;
const SHAKE_MAGNITUDE  = 8;

export class ArkanoidGame {
    constructor(containerId) {
        this.containerId = containerId;

        this.app    = null;
        this.world  = null;
        this.hud    = null;

        this.input  = new InputSystem();
        this.sound  = new SoundSystem();
        this.paddle = null;
        this.ball   = null;
        this.bricks = [];
        this.score  = 0;

        this.state  = STATE.MENU;
        this.lives  = STARTING_LIVES;
        this.level  = 1;

        this.hudView = null;

        this.dyingBricks = [];
        this.shakeTime   = 0;

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

        this.hudView = new Hud();
        this.hud.addChild(this.hudView.view);
        this.hudView.setScore(this.score);
        this.hudView.setLives(this.lives);
        this.hudView.setLevel(this.level);

        this._overlay      = document.getElementById('overlay');
        this._overlayTitle = document.getElementById('overlay-title');
        this._overlayText  = document.getElementById('overlay-text');

        this.setState(STATE.MENU);

        this.app.ticker.add(this.update, this);
    }

    update(ticker) {
        const dt    = ticker.deltaTime;
        const dtSec = ticker.deltaMS / 1000;

        this._updateEffects(dtSec);

        if (this.state !== STATE.PLAYING) {
            this._handleNonPlayingState();
            this.input.endFrame();
            return;
        }

        if (this.input.wasPressed('escape')) {
            this.setState(STATE.PAUSED);
            this.input.endFrame();
            return;
        }

        this.paddle.update(this.input, dt);
        this.ball.update(dt);

        const wallResult = CollisionSystem.ballVsWalls(this.ball);
        if (wallResult === 'bottom') {
            this._loseLife();
            this.input.endFrame();
            return;
        }

        const paddleHit = CollisionSystem.ballVsPaddle(this.ball, this.paddle);
        if (paddleHit) this.sound.paddleHit();

        const brickHit = CollisionSystem.ballVsBricks(this.ball, this.bricks);
        if (brickHit && brickHit.destroyed) {
            this._startBrickDestroy(brickHit.brick);
            this.score += SCORE_PER_BRICK;
            this.hudView.setScore(this.score);
            this.sound.brickBreak();
        } else if (brickHit) {
            this._startBrickBump(brickHit.brick);
            this.sound.brickBump();
        }

        if (CollisionSystem.allBricksDestroyed(this.bricks)) {
            this.setState(STATE.VICTORY);
        }

        this.input.endFrame();
    }

    _updateEffects(dtSec) {
        for (let i = this.dyingBricks.length - 1; i >= 0; i--) {
            const d = this.dyingBricks[i];
            d.elapsed += dtSec;
            const t = Math.min(d.elapsed / DESTROY_DURATION, 1);
            d.view.scale.set(1 + t * 0.6);
            d.view.alpha = 1 - t;

            if (t >= 1) {
                if (d.view.parent) d.view.parent.removeChild(d.view);
                this.dyingBricks.splice(i, 1);
            }
        }

        if (this.shakeTime > 0) {
            this.shakeTime -= dtSec;
            if (this.shakeTime <= 0) {
                this.shakeTime = 0;
                this.world.x = 0;
                this.world.y = 0;
            } else {
                const k = this.shakeTime / SHAKE_DURATION;
                const m = SHAKE_MAGNITUDE * k;
                this.world.x = (Math.random() - 0.5) * 2 * m;
                this.world.y = (Math.random() - 0.5) * 2 * m;
            }
        }
    }

    _startBrickDestroy(brick) {
        this.dyingBricks.push({ view: brick.view, elapsed: 0 });
    }

    _startBrickBump(brick) {
        const startScale = 1;
        const bumpScale  = 1.15;
        const duration   = 0.1;
        let elapsed = 0;

        const view = brick.view;
        view.scale.set(bumpScale);

        const tick = (t) => {
            elapsed += t.deltaMS / 1000;
            const k = Math.min(elapsed / duration, 1);
            view.scale.set(bumpScale - (bumpScale - startScale) * k);
            if (k >= 1) {
                view.scale.set(startScale);
                this.app.ticker.remove(tick);
            }
        };
        this.app.ticker.add(tick);
    }

    _startShake() {
        this.shakeTime = SHAKE_DURATION;
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
        this.hudView.setLives(this.lives);

        this._startShake();
        this.sound.lifeLost();

        if (this.lives <= 0) {
            this.setState(STATE.GAME_OVER);
            return;
        }

        this.paddle.reset();
        this.ball.reset();
    }

    _startNewGame() {
        this.sound.unlock();

        this.dyingBricks.length = 0;
        this.shakeTime = 0;
        this.world.x = 0;
        this.world.y = 0;

        this.score = 0;
        this.lives = STARTING_LIVES;
        this.paddle.reset();
        this.ball.reset();

        for (const brick of this.bricks) {
            if (brick.view.parent) brick.view.parent.removeChild(brick.view);
        }
        this.bricks = LevelBuilder.build();
        for (const brick of this.bricks) {
            this.world.addChild(brick.view);
        }

        this.hudView.setScore(this.score);
        this.hudView.setLives(this.lives);
        this.hudView.setLevel(this.level);

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
                this.sound.gameOver();
                break;
            case STATE.VICTORY:
                this._showOverlay('VICTORY!', `Score: ${this.score}\nPress SPACE to restart`);
                this.sound.victory();
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