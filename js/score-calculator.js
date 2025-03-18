const LETTER_SCORES = {
    "a": 2,
    "b": 8,
    "c": 8,
    "d": 5,
    "e": 2,
    "f": 6,
    "g": 6,
    "h": 7,
    "i": 2,
    "j": 13,
    "k": 8,
    "l": 3,
    "m": 5,
    "n": 5,
    "o": 2,
    "p": 6,
    "q": 15,
    "r": 5,
    "s": 3,
    "t": 3,
    "u": 4,
    "v": 11,
    "w": 10,
    "x": 12,
    "y": 4,
    "z": 14,
    "er": 7,
    "cl": 10,
    "in": 7,
    "th": 9,
    "qu": 9,
}

function get_length_bonus(length) {
    switch (length) {
        case 5:
            return 2;
        case 6:
            return 5;
        case 7:
            return 10;
        case 8:
            return 20;
        case 9:
            return 30;
        case 10:
            return 40;
        case 11:
            return 50;
        case 12:
            return 60;
        default:
            return 0;
    }
}

export function get_word_score(letters, calculate_bonus) {
    let score = 0;
    if (calculate_bonus) {
        score += get_length_bonus(letters.join("").length);
    }
    for (const letter of letters) {
        score += LETTER_SCORES[letter];
    }
    return score;
}