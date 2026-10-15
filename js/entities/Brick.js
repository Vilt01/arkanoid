import { Container, Graphics } from 'pixi.js';
import { BRICK, COLORS } from '../utils/constants.js';


export class Brick {
    /**
     * @param {number} x — левый верхний угол блока
     * @param {number} y — верхний край блока
     * @param {number} color — hex-цвет (из COLORS.BRICK_ROW)
     * @param {number} hp — количество ударов до разрушения (1 или 2)
     */
    constructor(x, y, color, hp = 1) {
        this.view = new Container();

        // Графика блока: прямоугольник с тонкой окантовкой.
        this.graphics = new Graphics();
        this.view.addChild(this.graphics);

        this.view.x = x;
        this.view.y = y;

        this.color = color;
        this.hp    = hp;
        this._draw();

        this.destroyed = false;
    }

    _draw() {
        this.graphics
            .clear()
            .rect(0, 0, BRICK.WIDTH, BRICK.HEIGHT)
            .fill(this.color)
            .stroke({ width: 1, color: 0x000000, alpha: 0.5 });

        if (this.hp > 1) {
            this.graphics
                .rect(2, 2, BRICK.WIDTH - 4, 3)
                .fill({ color: 0xffffff, alpha: 0.4 });
        }
    }

    /** Прямоугольник для коллизий. Плоский AABB. */
    get bounds() {
        return {
            x: this.view.x,
            y: this.view.y,
            width: BRICK.WIDTH,
            height: BRICK.HEIGHT,
        };
    }

    /**
     * Удар по блоку. Уменьшает hp. Если hp дошёл до нуля — помечает мёртвым.
     * @returns {boolean} — true, если блок только что разрушен
     */
    hit() {
        this.hp -= 1;

        if (this.hp <= 0) {
            this.destroyed = true;
            return true;
        }

        this._draw();
        return false;
    }
}