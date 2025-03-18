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
    let parsed_words = [];
    while (cards.length < card_count) {
        let word = DICTIONARY[Math.floor(seeded_rand() * DICTIONARY_LENGTH)];
        let word_letters = parse_word(word);
        if (word_letters.length > Math.floor(card_count / 2) || word_letters.length + cards.length > card_count) {
            continue;
        }
        parsed_words.push(word_letters);
        // in-place shuffle
        shuffle_array(word_letters)
        cards = cards.concat(word_letters);
    }
    if (!check_solvability(parsed_words, cards)) {
        return get_cards(card_count);
    }
    return cards;
}

function check_solvability(words, cards) {
    //clone arrays
    let working_cards = Array.from(cards);
    let working_words = Array.from(words);

    const words_length = working_words.length;
    const cards_length = working_cards.length;
    for (let i = 0; i < words_length; i++) {
        for (let j = 0; j < cards_length; j++) {
            if (working_cards[j] === "-") {
                continue;
            }
            if (working_words[i].includes(working_cards[j])) {
                working_words[i][working_words[i].findIndex((x) => x === working_cards[j])] = "-";
                working_cards[j] = "-";
            }
        }
    }

    if (working_words.flat().join("").replaceAll("-", "").length > 0) {
        return false;
    }
    return true;
}
