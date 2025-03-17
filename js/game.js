import {DICTIONARY} from "./dictionary.js";

const CARD_COUNT = 8;
const ASSETS_BASE_PATH = "./assets/";
const POSSIBLE_LETTERS = ["a","b","cl","c","d","e","er","f","g","h","in","i","j","k","l","m","n","o","p","q","qu","r","s","th","t","u","v","w","x","y","z"];

const SELECTED_CARD_CLASS = "selected-card";
const VISIBLE_CARD_CLASS = "visible-card";
const HIDDEN_CARD_CLASS = "hidden-card";

let selected_cards = [];

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

const seededRand = mulberry32(get_seed())

function get_letter() {
    let random_index = Math.floor(seededRand() * POSSIBLE_LETTERS.length);
    return POSSIBLE_LETTERS[random_index];
}

function make_visible_card(index, letter) {
    let visible_card = document.createElement("div");
    visible_card.classList.add(VISIBLE_CARD_CLASS);
    let visible_card_image = document.createElement("img");
    visible_card_image.src = ASSETS_BASE_PATH + letter + ".png"
    visible_card.dataset.index = index;
    visible_card.dataset.letter = letter;
    visible_card_image.draggable = false;
    visible_card.appendChild(visible_card_image)
    if (index !== -1) {
        visible_card.addEventListener("click", (e) => {
            let selected = e.target.classList.contains(SELECTED_CARD_CLASS);
            if (selected) {
                let index = selected_cards.findIndex((x) => x.index === Number(e.target.parentElement.dataset["index"]));
                selected_cards.splice(index, 1);
            } else {
                selected_cards.push({index: index, letter: e.target.parentElement.dataset["letter"]});
            }
            e.target.classList.toggle(SELECTED_CARD_CLASS);
        });
    }
    return visible_card;
}

function make_hidden_card(index, letter) {
    let hidden_card = document.createElement("div");
    hidden_card.classList.add(HIDDEN_CARD_CLASS);
    let hidden_card_image = document.createElement("img");
    hidden_card.dataset.index = index;
    hidden_card.dataset.letter = letter;
    hidden_card_image.draggable = false;
    if (index === -1) {
        hidden_card_image.src = ASSETS_BASE_PATH + "placeholder.png";
    } else {
        hidden_card_image.src = ASSETS_BASE_PATH + "quiddler_card_back.png";
    }
    hidden_card.appendChild(hidden_card_image)
    return hidden_card;
}

function populate_cards() {
    let cards_grid = document.querySelector("#cards-grid");
    for (let i = 0; i < CARD_COUNT; i++) {
        let quiddler_card = document.createElement("div");
        quiddler_card.classList.add("quiddler-card");

        let hidden_card = make_hidden_card(i, get_letter());
        quiddler_card.appendChild(hidden_card);

        let visible_card_letter = get_letter();
        let visible_card = make_visible_card(i, visible_card_letter);
        quiddler_card.appendChild(visible_card);

        cards_grid.appendChild(quiddler_card);
    }
}

function deselect_all_cards() {
    for (const element of document.querySelectorAll("." + SELECTED_CARD_CLASS)) {
        element.classList.remove(SELECTED_CARD_CLASS);
    }
    selected_cards = [];
}

function delete_cards(indexes) {
    let visible_cards = Array.from(document.querySelectorAll("." + VISIBLE_CARD_CLASS));
    let hidden_cards = Array.from(document.querySelectorAll("." + HIDDEN_CARD_CLASS));
    for (const element of visible_cards) {
        let visible_card_index = Number(element.dataset["index"]);
        if (indexes.includes(visible_card_index)) {
            let parent = element.parentElement;
            element.remove();
            let hidden_card = hidden_cards[hidden_cards.findIndex((x) => Number(x.dataset["index"]) === visible_card_index)];
            if (hidden_card && Number(hidden_card.dataset["index"]) !== -1) {
                let new_hidden_card = make_hidden_card(-1, "placeholder");
                parent.appendChild(new_hidden_card);
                hidden_card.remove();
                let new_visible_card = make_visible_card(Number(hidden_card.dataset["index"]), hidden_card.dataset["letter"]);
                parent.appendChild(new_visible_card);
            } else {
                let new_visible_card = make_visible_card(-1, "none");
                parent.appendChild(new_visible_card);
            }
        }
    }
}

function submit_cards() {
    let word = "";
    let card_indexes = [];
    for (const element of selected_cards) {
        if (element !== null) {
            word += element.letter;
            card_indexes.push(element.index);
        }
    }
    if (DICTIONARY.includes(word)) {
        delete_cards(card_indexes);
    }
    deselect_all_cards();
}

populate_cards();

document.querySelector("#submit-button").addEventListener("click", submit_cards);
