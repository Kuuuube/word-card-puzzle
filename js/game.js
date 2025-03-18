import {DICTIONARY} from "./dictionary.js";
import {seededRand} from "./math.js";
import {get_letters_deck} from "./card-deck.js"

const CARD_COUNT = 8;
const ASSETS_BASE_PATH = "./assets/";
const POSSIBLE_LETTERS = get_letters_deck();

const SELECTED_CARD_CLASS = "selected-card";
const VISIBLE_CARD_CLASS = "visible-card";
const HIDDEN_CARD_CLASS = "hidden-card";
const PLACEHOLDER_CARD_CLASS = "placeholder-card";

let selected_cards = [];
let selected_swap_index = -1;

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
    if (letter === "none") {
        visible_card.addEventListener("click", (e) => {
            if (selected_cards.length > 0 || (selected_swap_index !== -1 && selected_swap_index !== index)) {
                return;
            }
            let selected = e.target.classList.contains(SELECTED_CARD_CLASS);
            if (selected) {
                selected_swap_index = -1;
            } else {
                selected_swap_index = index;
            }
            e.target.classList.toggle(SELECTED_CARD_CLASS);
        });
    } else {
        visible_card.addEventListener("click", (e) => {
            if (selected_swap_index !== -1) {
                let parent = e.target.parentElement.parentElement;
                let hidden_card = parent.querySelector("." + HIDDEN_CARD_CLASS);
                if (hidden_card && Number(hidden_card.dataset["index"] !== -1)) {
                    let new_visible_card = make_visible_card(selected_swap_index, hidden_card.dataset["letter"]);
                    let visible_cards = document.querySelectorAll("." + VISIBLE_CARD_CLASS);
                    let selected_swap_card_index = Array.from(visible_cards).findIndex((x) => Number(x.dataset["index"]) === selected_swap_index);
                    let swap_card_parent = visible_cards[selected_swap_card_index].parentElement;
                    visible_cards[selected_swap_card_index].remove();
                    swap_card_parent.appendChild(new_visible_card);

                    let hidden_card_img = hidden_card.querySelector("img");
                    hidden_card_img.src = ASSETS_BASE_PATH + "placeholder.png";
                    hidden_card.classList.remove(HIDDEN_CARD_CLASS);
                    hidden_card.classList.add(PLACEHOLDER_CARD_CLASS);
                    delete hidden_card.dataset["letter"];
                    delete hidden_card.dataset["index"];

                    selected_swap_index = -1;
                }
                return;
            }
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

function make_placeholder_card() {
    let placeholder_card = document.createElement("div");
    placeholder_card.classList.add(PLACEHOLDER_CARD_CLASS);
    let placeholder_card_image = document.createElement("img");
    placeholder_card.dataset.index = -1;
    placeholder_card_image.draggable = false;
    placeholder_card_image.src = ASSETS_BASE_PATH + "placeholder.png";
    placeholder_card.appendChild(placeholder_card_image)
    return placeholder_card;
}

function make_hidden_card(index, letter) {
    let hidden_card = document.createElement("div");
    hidden_card.classList.add(HIDDEN_CARD_CLASS);
    let hidden_card_image = document.createElement("img");
    hidden_card.dataset.index = index;
    hidden_card.dataset.letter = letter;
    hidden_card_image.draggable = false;
    hidden_card_image.src = ASSETS_BASE_PATH + "quiddler_card_back.png";
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
            if (hidden_card) {
                let new_hidden_card = make_placeholder_card();
                parent.appendChild(new_hidden_card);
                hidden_card.remove();
                let new_visible_card = make_visible_card(Number(hidden_card.dataset["index"]), hidden_card.dataset["letter"]);
                parent.appendChild(new_visible_card);
            } else {
                let new_visible_card = make_visible_card(visible_card_index, "none");
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
