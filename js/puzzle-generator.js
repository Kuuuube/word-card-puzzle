import {DICTIONARY} from "./dictionary.js";
import {seeded_rand, shuffle_array} from "./math.js";

const DICTIONARY_LENGTH = DICTIONARY.length;
const POSSIBLE_DOUBLE_LETTERS = ["er", "cl", "in", "th", "qu"];

function coinflip() {
    return 0 == Math.floor(seeded_rand() * 2);
}

function parse_word(word) {
    let letters = [];
    for (const double_letter of POSSIBLE_DOUBLE_LETTERS) {
        while (word.includes(double_letter)) {
            let coinflip_result = coinflip();
            if (coinflip_result) {
                letters.push(double_letter);
                word = word.replace(double_letter, "");
            } else {
                letters = letters.concat(double_letter.split(""));
                word = word.replace(double_letter, "");
            }
        }
    }
    for (let i = 0; i < word.length; i++) {
        letters.push(word[i]);
    }
    return letters;
}

export function get_cards(card_count) {
    let cards = [];
    while (cards.length < card_count) {
        let word = DICTIONARY[Math.floor(seeded_rand() * DICTIONARY_LENGTH)];
        let word_letters = parse_word(word);
        if (word_letters.length + cards.length > card_count) {
            continue;
        }
        // in-place shuffle
        shuffle_array(word_letters)
        cards = cards.concat(word_letters);
    }
    return cards;
}
