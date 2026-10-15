import { Container, Graphics } from 'pixi.js';
import { BRICK } from '../utils/constants.js';

export class Brick {
    constructor(x, y, color, hp = 1) {
        this.view = new Container();

        this.graphics = new Graphics();
        this.view.addChild(this.graphics);

        this.view.x = x;
        this.view.y = y;

        this.color = color;
        this.hp    = hp;
        this.destroyed = false;

        // Флаг вспышки — на время её действия блок рисуется белым.
        this._flashing = false;

        this._draw();
    }

    _draw() {
        this.graphics.clear();

        // Если блок «вспыхивает» после удара — рисуем белым.
        const fillColor = this._flashing ? 0xffffff : this.color;

        this.graphics
            .rect(0, 0, BRICK.WIDTH, BRICK.HEIGHT)
            .fill(fillColor)
            .stroke({ width: 1, color: 0x000000, alpha: 0.5 });

        // Подсветка верхней кромки для бронированных блоков.
        if (this.hp > 1 && !this._flashing) {
            this.graphics
                .rect(2, 2, BRICK.WIDTH - 4, 3)
                .fill({ color: 0xffffff, alpha: 0.4 });
        }
    }

    get bounds() {
        return {
            x: this.view.x,
            y: this.view.y,
            width: BRICK.WIDTH,
            height: BRICK.HEIGHT,
        };
    }

    hit() {
        this.hp -= 1;

        if (this.hp <= 0) {
            this.destroyed = true;
            return true;
        }

        this._draw();
        return false;
    }

    setFlashing(value) {
        if (this._flashing === value) return;
        this._flashing = value;
        this._draw();
    }
}