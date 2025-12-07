// Physics Constants

// Approximate pixels per cm for a standard tablet (iPad ~ 264ppi, but web logical pixels are usually 96dpi * scale)
// Let's assume logical pixels. 1cm ~ 38px (96dpi / 2.54)
// We'll bump it slightly to 40 for simpler math
export const PCM = 40;

export const GAME_CONFIG = {
    SPEED_STALK: 15 * PCM, // 15 cm/s
    SPEED_RUN: 50 * PCM,   // 50 cm/s
    SIZE_MOUSE: 4 * PCM,   // 4-5 cm
    SIZE_INSECT: 1.5 * PCM,
    STOP_GO_INTERVAL_MIN: 500, // ms
    STOP_GO_INTERVAL_MAX: 2000,
    KILL_RADIUS_MULTIPLIER: 1.5, // Hitbox size
};
