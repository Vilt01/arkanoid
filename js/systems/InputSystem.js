export class InputSystem {
    constructor() {
        this.keys = new Set();
        this._pressedThisFrame = new Set();

        this._onKeyDown = (e) => {
            const key = e.key.toLowerCase();

            if (!this.keys.has(key)) {
                this._pressedThisFrame.add(key);
            }
            this.keys.add(key);

            if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown', ' '].includes(key)) {
                e.preventDefault();
            }
        };

        this._onKeyUp = (e) => {
            this.keys.delete(e.key.toLowerCase());
        };

        window.addEventListener('keydown', this._onKeyDown);
        window.addEventListener('keyup', this._onKeyUp);
    }

    isDown(...keys) {
        return keys.some((k) => this.keys.has(k));
    }

    wasPressed(key) {
        return this._pressedThisFrame.has(key);
    }

    endFrame() {
        this._pressedThisFrame.clear();
    }

    destroy() {
        window.removeEventListener('keydown', this._onKeyDown);
        window.removeEventListener('keyup', this._onKeyUp);
        this.keys.clear();
        this._pressedThisFrame.clear();
    }
}