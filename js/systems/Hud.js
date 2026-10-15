import { Container, Text, TextStyle } from 'pixi.js';
import { GAME, COLORS } from '../utils/constants.js';

/**
 * HUD: очки, жизни, уровень. Живёт в отдельном слое (this.hud),
 */
export class Hud {
    constructor() {
        this.view = new Container();

        const style = new TextStyle({
            fontFamily: 'Press Start 2P, monospace',
            fontSize: 14,
            fill: COLORS.HUD_TEXT,
        });

        // Очки — слева сверху.
        this.scoreText = new Text({ text: 'SCORE 0', style });
        this.scoreText.x = 20;
        this.scoreText.y = 16;

        // Жизни — справа сверху.
        this.livesText = new Text({ text: 'LIVES 3', style });
        this.livesText.anchor.set(1, 0);
        this.livesText.x = GAME.WIDTH - 20;
        this.livesText.y = 16;

        // Уровень — по центру сверху.
        this.levelText = new Text({ text: 'LEVEL 1', style });
        this.levelText.anchor.set(0.5, 0);
        this.levelText.x = GAME.WIDTH / 2;
        this.levelText.y = 16;

        this.view.addChild(this.scoreText, this.livesText, this.levelText);
    }

    setScore(value) {
        this.scoreText.text = `SCORE ${value}`;
    }

    setLives(value) {
        this.livesText.text = `LIVES ${value}`;
    }

    setLevel(value) {
        this.levelText.text = `LEVEL ${value}`;
    }
}