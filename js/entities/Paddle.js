import { Container, Graphics } from 'pixi.js';
import { GAME, PADDLE, COLORS } from '../utils/constants.js';


export class Paddle {
    constructor() {
        // Container — аналог GameObject/Transform в Unity.
        // Внутри могут лежать графика, спрайты, эффекты.
        this.view = new Container();

        // Graphics — векторная отрисовка Pixi. Здесь — скруглённый прямоугольник.
        const g = new Graphics()
            .roundRect(0, 0, PADDLE.WIDTH, PADDLE.HEIGHT, 4)
            .fill(COLORS.PADDLE)
            .stroke({ width: 2, color: COLORS.PADDLE_EDGE, alpha: 0.7 });

        this.view.addChild(g);

        // Стартовая позиция: снизу по центру поля.
        this.view.x = (GAME.WIDTH - PADDLE.WIDTH) / 2;
        this.view.y = GAME.HEIGHT - PADDLE.Y_OFFSET;

        // Скорость по X. Понадобится позже для «кручения» мяча.
        this.vx = 0;
    }

    
    get bounds() {
        return {
            x: this.view.x,
            y: this.view.y,
            width: PADDLE.WIDTH,
            height: PADDLE.HEIGHT,
        };
    }

    /**
     * @param {InputSystem} input — откуда читаем клавиши
     * @param {number} dt — множитель кадра (1.0 при 60 FPS)
     */
    update(input, dt) {
        let dir = 0;
        if (input.isDown('arrowleft', 'a'))  dir -= 1;
        if (input.isDown('arrowright', 'd')) dir += 1;

        this.vx = dir * PADDLE.SPEED;

        if (dir !== 0) {
            this.view.x += this.vx * dt;

            // Клампим в границах поля — ракетка не выезжает за края.
            const maxX = GAME.WIDTH - PADDLE.WIDTH;
            if (this.view.x < 0)    this.view.x = 0;
            if (this.view.x > maxX) this.view.x = maxX;
        }
    }

    /** Возвращает ракетку в стартовое положение. Для рестарта уровня. */
    reset() {
        this.view.x = (GAME.WIDTH - PADDLE.WIDTH) / 2;
        this.vx = 0;
    }
}