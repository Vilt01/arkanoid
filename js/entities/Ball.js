import { Container, Graphics } from 'pixi.js';
import { GAME, BALL, COLORS } from '../utils/constants.js';


export class Ball {
    constructor() {
        this.view = new Container();

        const g = new Graphics()
            .circle(0, 0, BALL.RADIUS)
            .fill(COLORS.BALL);

        this.view.addChild(g);

        // Скорость по осям (px за кадр при 60 FPS).
        this.vx = 0;
        this.vy = 0;

        this.reset();
    }

    
    get bounds() {
        return {
            x: this.view.x - BALL.RADIUS,
            y: this.view.y - BALL.RADIUS,
            width: BALL.RADIUS * 2,
            height: BALL.RADIUS * 2,
        };
    }

    
    reset() {
        this.view.x = GAME.WIDTH / 2;
        this.view.y = GAME.HEIGHT - 100;

        // Угол от -45° до +45° (в радианах).
        const angle = (Math.random() - 0.5) * (Math.PI / 2);

        this.vx = Math.sin(angle) * BALL.SPEED;
        this.vy = -Math.cos(angle) * BALL.SPEED; // минус — вверх по экрану
    }

   update(dt) {
        this.view.x += this.vx * dt;
        this.view.y += this.vy * dt;
    }
}