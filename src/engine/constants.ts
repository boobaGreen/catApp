// Physics Constants

// Approximate pixels per cm for a standard tablet (iPad ~ 264ppi, but web logical pixels are usually 96dpi * scale)
// Let's assume logical pixels. 1cm ~ 38px (96dpi / 2.54)
// We'll bump it slightly to 40 for simpler math
export const PCM = 40;

export const GAME_CONFIG = {
    SPEED_STALK: 8 * PCM, // 8 cm/s (was 15)
    SPEED_RUN: 35 * PCM,   // 35 cm/s (was 50)
    SIZE_MOUSE: 4 * PCM,   // 4-5 cm
    SIZE_INSECT: 1.5 * PCM,
    STOP_GO_INTERVAL_MIN: 500, // ms
    STOP_GO_INTERVAL_MAX: 2000,
    KILL_RADIUS_MULTIPLIER: 1.5, // Hitbox size
};
