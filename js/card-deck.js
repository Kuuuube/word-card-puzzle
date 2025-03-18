const CARD_DECK_CARDS = [
    { letter: "a", count: 10 },
    { letter: "b", count: 2 },
    { letter: "c", count: 2 },
    { letter: "d", count: 4 },
    { letter: "e", count: 12 },
    { letter: "f", count: 2 },
    { letter: "g", count: 4 },
    { letter: "h", count: 2 },
    { letter: "i", count: 8 },
    { letter: "j", count: 2 },
    { letter: "k", count: 2 },
    { letter: "l", count: 4 },
    { letter: "m", count: 2 },
    { letter: "n", count: 6 },
    { letter: "o", count: 8 },
    { letter: "p", count: 2 },
    { letter: "q", count: 2 },
    { letter: "r", count: 6 },
    { letter: "s", count: 4 },
    { letter: "t", count: 6 },
    { letter: "u", count: 6 },
    { letter: "v", count: 2 },
    { letter: "w", count: 2 },
    { letter: "x", count: 2 },
    { letter: "y", count: 4 },
    { letter: "z", count: 2 },
    { letter: "er", count: 2 },
    { letter: "cl", count: 2 },
    { letter: "in", count: 2 },
    { letter: "th", count: 2 },
    { letter: "qu", count: 2 }
];

export function get_letters_deck() {
    let letters = [];
    for (const card_type of CARD_DECK_CARDS) {
        let new_card_array = new Array(card_type.count).fill(card_type.letter);
        letters = letters.concat(new_card_array);
    }
    return letters;
}