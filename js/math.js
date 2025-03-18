function mulberry32(a) {
    return function() {
        let t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

// Basic insecure hash matching Java's String.hashCode()
function hash_code(s) {
    let h;
    for(let i = 0; i < s.length; i++) {
        h = Math.imul(31, h) + s.charCodeAt(i) | 0;
    }
    return h;
}

function get_seed() {
    const urlParams = new URLSearchParams(window.location.search);
    const url_seed = urlParams.get("seed");
    if (url_seed) {
        return hash_code(url_seed);
    }
    const MILLISECONDS_PER_DAY = 86400000;
    const epoch_day = Math.floor(Date.now() / MILLISECONDS_PER_DAY) * MILLISECONDS_PER_DAY;
    return hash_code(epoch_day.toString());
}

export const seeded_rand = mulberry32(get_seed())

// Durstenfeld shuffle, in-place
export function shuffle_array(array) {
    for (let i = array.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
