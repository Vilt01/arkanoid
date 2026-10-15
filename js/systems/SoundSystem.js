
export class SoundSystem {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    _ensureContext() {
        if (!this.ctx) {
            const Ctor = window.AudioContext || window.webkitAudioContext;
            if (!Ctor) {
                this.enabled = false;
                return null;
            }
            this.ctx = new Ctor();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        return this.ctx;
    }

    unlock() {
        this._ensureContext();
    }

    /**
     * Базовый тон.
     * @param {object} opts
     * @param {number} opts.freq — начальная частота
     * @param {number} opts.duration — длительность, секунд
     * @param {string} opts.type — 'square' | 'sawtooth' | 'triangle' | 'sine'
     * @param {number} opts.volume — громкость (0..1)
     * @param {number|null} opts.sweepTo — конечная частота для глиссандо
     */
    _beep({ freq = 440, duration = 0.08, type = 'square', volume = 0.06, sweepTo = null }) {
        if (!this.enabled) return;
        const ctx = this._ensureContext();
        if (!ctx) return;

        const t0 = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, t0);
        if (sweepTo !== null) {
            osc.frequency.exponentialRampToValueAtTime(sweepTo, t0 + duration);
        }

        // Плавное затухание — иначе будут щелчки на концах.
        gain.gain.setValueAtTime(volume, t0);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

        osc.connect(gain).connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + duration);
    }

    /** Удар мяча по ракетке — короткий высокий тон. */
    paddleHit() {
        this._beep({ freq: 660, duration: 0.06, volume: 0.05 });
    }

    /** Разрушение блока — двойной щелчок. */
    brickBreak() {
        this._beep({ freq: 880, duration: 0.05, volume: 0.045 });
        setTimeout(() => this._beep({ freq: 1320, duration: 0.04, volume: 0.04 }), 30);
    }

    /** Удар по блоку с hp: 2 (не разрушен) — низкий короткий тон. */
    brickBump() {
        this._beep({ freq: 440, duration: 0.05, volume: 0.04 });
    }

    /** Потеря жизни — низкое глиссандо вниз. */
    lifeLost() {
        this._beep({ freq: 440, duration: 0.3, type: 'sawtooth', volume: 0.07, sweepTo: 110 });
    }

    /** Победа — восходящее арпеджио. */
    victory() {
        const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
        notes.forEach((f, i) => {
            setTimeout(() => this._beep({ freq: f, duration: 0.14, volume: 0.06 }), i * 110);
        });
    }

    /** Поражение — нисходящее арпеджио. */
    gameOver() {
        const notes = [440, 349, 262]; // A4 F4 C4
        notes.forEach((f, i) => {
            setTimeout(() => this._beep({ freq: f, duration: 0.22, type: 'sawtooth', volume: 0.06 }), i * 160);
        });
    }
}