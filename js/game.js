import {DICTIONARY} from "./dictionary.js";

const CARD_COUNT = 8;
const ASSETS_BASE_PATH = "./assets/";
const POSSIBLE_LETTERS = ["a","b","cl","c","d","e","er","f","g","h","in","i","j","k","l","m","n","o","p","q","qu","r","s","th","t","u","v","w","x","y","z"];

const SELECTED_CARD_CLASS = "selected-card";

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

function populate_cards() {
    let cards_grid = document.querySelector("#cards-grid");
    for (let i = 0; i < CARD_COUNT; i++) {
        let quiddler_card = document.createElement("div");
        quiddler_card.classList.add("quiddler-card");

        let hidden_card = document.createElement("div");
        hidden_card.classList.add("hidden-card");
        let hidden_card_image = document.createElement("img");
        hidden_card_image.draggable = false;
        hidden_card_image.src = ASSETS_BASE_PATH + "quiddler_card_back.png"
        hidden_card.appendChild(hidden_card_image)
        quiddler_card.appendChild(hidden_card);

        let visible_card = document.createElement("div");
        visible_card.classList.add("visible-card");
        let visible_card_image = document.createElement("img");
        let card_letter = get_letter();
        visible_card_image.src = ASSETS_BASE_PATH + card_letter + ".png"
        visible_card.dataset.index = i;
        visible_card.dataset.letter = card_letter;
        visible_card_image.draggable = false;
        visible_card.appendChild(visible_card_image)
        visible_card.addEventListener("click", (e) => {
            let selected = e.target.classList.contains(SELECTED_CARD_CLASS);
            if (selected) {
                let index = selected_cards.findIndex((x) => x.index === Number(e.target.parentElement.dataset["index"]));
                selected_cards.splice(index, 1);
            } else {
                selected_cards.push({index: i, letter: e.target.parentElement.dataset["letter"]});
            }
            e.target.classList.toggle(SELECTED_CARD_CLASS);
        });
        quiddler_card.appendChild(visible_card);

        cards_grid.appendChild(quiddler_card);
    }
}

function deselect_all_cards() {
    for (const element of document.querySelectorAll("." + SELECTED_CARD_CLASS)) {
        element.classList.remove(SELECTED_CARD_CLASS);
    }
}

function submit_cards() {
    let word = "";
    for (const element of selected_cards) {
        if (element !== null) {
            word += element.letter;
        }
    }
    if (DICTIONARY.includes(word)) {
        console.log("found");
    }
    deselect_all_cards();
}

populate_cards();

document.querySelector("#submit-button").addEventListener("click", submit_cards);
