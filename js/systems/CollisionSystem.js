import { GAME, BALL, PADDLE, SCORE_PER_BRICK } from '../utils/constants.js';

export class CollisionSystem {
    static overlaps(a, b) {
        return (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
        );
    }

    /**
     * @returns {boolean} — было ли столкновение
     */
    static ballVsPaddle(ball, paddle) {
        const ballBounds   = ball.bounds;
        const paddleBounds = paddle.bounds;

        if (!CollisionSystem.overlaps(ballBounds, paddleBounds)) return false;

        if (ball.vy <= 0) return false;

        ball.view.y = paddleBounds.y - BALL.RADIUS;

        // Позиция удара относительно центра ракетки: [-1, +1].
        const paddleCenter = paddleBounds.x + PADDLE.WIDTH / 2;
        const hitPosition  = (ball.view.x - paddleCenter) / (PADDLE.WIDTH / 2);
        const clamped      = Math.max(-1, Math.min(1, hitPosition));

        // Угол отскока: ±MAX_BOUNCE_ANGLE от вертикали.
        const angle = clamped * BALL.MAX_BOUNCE_ANGLE;
        const speed = Math.hypot(ball.vx, ball.vy);

        ball.vx = Math.sin(angle) * speed;
        ball.vy = -Math.cos(angle) * speed;

        return true;
    }

    /**
     * @returns {object|null} — { brick, destroyed } или null
     */
    static ballVsBricks(ball, bricks) {
        const ballBounds = ball.bounds;

        for (const brick of bricks) {
            if (brick.destroyed) continue;

            const brickBounds = brick.bounds;
            if (!CollisionSystem.overlaps(ballBounds, brickBounds)) continue;

            const overlapLeft   = (ballBounds.x + ballBounds.width) - brickBounds.x;
            const overlapRight  = (brickBounds.x + brickBounds.width) - ballBounds.x;
            const overlapTop    = (ballBounds.y + ballBounds.height) - brickBounds.y;
            const overlapBottom = (brickBounds.y + brickBounds.height) - ballBounds.y;

            const minOverlapX = Math.min(overlapLeft, overlapRight);
            const minOverlapY = Math.min(overlapTop, overlapBottom);

            if (minOverlapX < minOverlapY) {
                ball.vx = -ball.vx;
                if (overlapLeft < overlapRight) {
                    ball.view.x = brickBounds.x - BALL.RADIUS;
                } else {
                    ball.view.x = brickBounds.x + brickBounds.width + BALL.RADIUS;
                }
            } else {
                ball.vy = -ball.vy;
                if (overlapTop < overlapBottom) {
                    ball.view.y = brickBounds.y - BALL.RADIUS;
                } else {
                    ball.view.y = brickBounds.y + brickBounds.height + BALL.RADIUS;
                }
            }

            const destroyed = brick.hit();

            // Ускорение мяча после удара с ограничением сверху.
            // MAX_SPEED предотвращает туннелирование сквозь ракетку.
            const speed = Math.hypot(ball.vx, ball.vy);
            const newSpeed = Math.min(speed + BALL.SPEED_INCREASE, BALL.MAX_SPEED);
            const scale = newSpeed / speed;
            ball.vx *= scale;
            ball.vy *= scale;

            return { brick, destroyed };
        }

        return null;
    }

    /**
     * @returns {'wall'|'bottom'|null}
     */
    static ballVsWalls(ball) {
        let result = null;

        if (ball.view.x - BALL.RADIUS <= 0) {
            ball.view.x = BALL.RADIUS;
            ball.vx = Math.abs(ball.vx);
            result = 'wall';
        } else if (ball.view.x + BALL.RADIUS >= GAME.WIDTH) {
            ball.view.x = GAME.WIDTH - BALL.RADIUS;
            ball.vx = -Math.abs(ball.vx);
            result = 'wall';
        }

        if (ball.view.y - BALL.RADIUS <= 0) {
            ball.view.y = BALL.RADIUS;
            ball.vy = Math.abs(ball.vy);
            result = 'wall';
        }

        if (ball.view.y - BALL.RADIUS > GAME.HEIGHT) {
            result = 'bottom';
        }

        return result;
    }

    static allBricksDestroyed(bricks) {
        return bricks.every((b) => b.destroyed);
    }
}