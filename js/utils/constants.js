export const GAME = {
    WIDTH: 800,
    HEIGHT: 600,
};

export const PADDLE = {
WIDTH: 110,
HEIGHT: 16,
SPEED: 8,
Y_OFFSET: 40, // отступ от нижнего края
};

export const BALL = {
    RADIUS: 8,
    SPEED: 6,
    SPEED_INCREASE: 0.04,
    MAX_BOUNCE_ANGLE: Math.PI / 3,
};

export const BRICK = {
    COLS: 10,
    ROWS: 6,
    WIDTH: 70,
    HEIGHT: 24,
    PADDING: 4,
    OFFSET_TOP: 60,
};

export const COLORS = {
    BG:           0x0a0e1a,
    PADDLE:       0x00ffcc,
    PADDLE_EDGE:  0xffffff,
    BALL:         0xff3366,
    HUD_TEXT:     0xf0f0f0,
    BRICK_ROW: [
        0xff0044, // верхний ряд — красный
        0xff7700,
        0xffdd00,
        0x33ff66,
        0x33aaff,
        0xaa44ff, // нижний ряд — фиолетовый
    ],
};

export const SCORE_PER_BRICK = 10;
export const STARTING_LIVES = 3;
export const STATE = {
    MENU:      'MENU',
    PLAYING:   'PLAYING',
    PAUSED:    'PAUSED',
    GAME_OVER: 'GAME_OVER',
    VICTORY:   'VICTORY',
};