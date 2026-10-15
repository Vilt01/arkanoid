import { GAME, BRICK, COLORS } from '../utils/constants.js';
import { Brick } from '../entities/Brick.js';


export class LevelBuilder {
    /**
     * @returns {Brick[]} 
     */
    static build() {
        const bricks = [];

        const totalWidth = BRICK.COLS * BRICK.WIDTH + (BRICK.COLS - 1) * BRICK.PADDING;
        const offsetX = (GAME.WIDTH - totalWidth) / 2;

        for (let row = 0; row < BRICK.ROWS; row++) {
            for (let col = 0; col < BRICK.COLS; col++) {
                const x = offsetX + col * (BRICK.WIDTH + BRICK.PADDING);
                const y = BRICK.OFFSET_TOP + row * (BRICK.HEIGHT + BRICK.PADDING);

                const color = COLORS.BRICK_ROW[row % COLORS.BRICK_ROW.length];

                const hp = row < 2 ? 2 : 1;

                bricks.push(new Brick(x, y, color, hp));
            }
        }

        return bricks;
    }
}