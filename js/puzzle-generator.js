import {DICTIONARY} from "./dictionary.js";
import {seeded_rand, shuffle_array} from "./math.js";

const DICTIONARY_LENGTH = DICTIONARY.length;
const POSSIBLE_DOUBLE_LETTERS = ["er", "cl", "in", "th", "qu"];

function coinflip() {
    return 0 == Math.floor(seeded_rand() * 2);
}

function parse_word(word) {
    let letters = [];
    if (word.length > 2) {
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
    }
    for (let i = 0; i < word.length; i++) {
        letters.push(word[i]);
    }
    return letters;
}

export function get_cards(card_count) {
    let cards = [];
    let words_and_letters = [];
    while (cards.length < card_count) {
        let word = DICTIONARY[Math.floor(seeded_rand() * DICTIONARY_LENGTH)];
        let word_letters = parse_word(word);
        if (word_letters.length > Math.floor(card_count / 2) || word_letters.length + cards.length > card_count) {
            continue;
        }
        words_and_letters.push({word: word, letters: word_letters});

        // in-place shuffle
        shuffle_array(word_letters);
        cards = cards.concat(word_letters);
    }
    return {cards: cards, words_and_letters: words_and_letters};
}

export function is_puzzle_still_solvable(visible_cards) {
    for (const word of DICTIONARY) {
        // clone word
        let working_word = word.repeat(1);
        for (const card of visible_cards) {
            if (card === "none" || word === card) {
                continue;
            }
            working_word = working_word.replace(card, "");
        }
        if (working_word.length === 0) {
            return true;
        }
    }
    return false;
}
