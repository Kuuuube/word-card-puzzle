import {DICTIONARY} from "./dictionary.js";
import {get_word_score} from "./score-calculator.js"
import {get_cards, is_puzzle_still_solvable} from "./puzzle-generator.js";
import {get_human_seed, get_random_seed, MILLISECONDS_PER_DAY} from "./math.js";

const VISIBLE_CARD_COUNT = 8;
const ASSETS_BASE_PATH = "./assets/";

const SELECTED_CARD_CLASS = "selected-card";
const VISIBLE_CARD_CLASS = "visible-card";
const HIDDEN_CARD_CLASS = "hidden-card";
const PLACEHOLDER_CARD_CLASS = "placeholder-card";

let selected_cards = [];
let selected_swap_index = -1;

function make_visible_card(index, letter) {
    let visible_card = document.createElement("div");
    visible_card.classList.add(VISIBLE_CARD_CLASS);
    let visible_card_image = document.createElement("img");
    visible_card_image.src = ASSETS_BASE_PATH + letter + ".png"
    visible_card.dataset.index = index;
    visible_card.dataset.letter = letter;
    visible_card_image.draggable = false;
    visible_card_image.width = 162;
    visible_card_image.height = 252;
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
                check_solvability();
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
            update_selected_letters_display();
        });
    }
    return visible_card;
}

function update_selected_letters_display() {
    document.querySelector("#selected-letters").textContent = selected_cards.map((x) => x.letter).join("");
}

function make_placeholder_card() {
    let placeholder_card = document.createElement("div");
    placeholder_card.classList.add(PLACEHOLDER_CARD_CLASS);
    let placeholder_card_image = document.createElement("img");
    placeholder_card.dataset.index = -1;
    placeholder_card_image.draggable = false;
    placeholder_card_image.width = 162;
    placeholder_card_image.height = 252;
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
    hidden_card_image.width = 162;
    hidden_card_image.height = 252;
    hidden_card_image.src = ASSETS_BASE_PATH + "card_back.png";
    hidden_card.appendChild(hidden_card_image)
    return hidden_card;
}

function populate_cards() {
    let cards_grid = document.querySelector("#cards-grid");
    let cards = get_cards(VISIBLE_CARD_COUNT * 2);

    for (let i = 0; i < VISIBLE_CARD_COUNT; i++) {
        let card_group = document.createElement("div");
        card_group.classList.add("card-group");

        let visible_card_letter = cards[i];
        let hidden_card_letter = cards[i + VISIBLE_CARD_COUNT];

        let hidden_card = make_hidden_card(i, hidden_card_letter);
        card_group.appendChild(hidden_card);

        let visible_card = make_visible_card(i, visible_card_letter);
        card_group.appendChild(visible_card);

        cards_grid.appendChild(card_group);
    }

    let score_without_bonus = get_word_score(cards, false);
    let score_without_bonus_element = document.querySelector("#score-without-bonus");
    score_without_bonus_element.innerHTML = score_without_bonus.toString();
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

function check_solvability() {
    let visible_card_letters = Array.from(document.querySelectorAll("." + VISIBLE_CARD_CLASS)).map((x) => x.dataset["letter"]).filter((x) => x !== "none");
    let hidden_card_letters = Array.from(document.querySelectorAll("." + HIDDEN_CARD_CLASS)).map((x) => x.dataset["letter"]).filter((x) => x !== "none");
    let solvable = is_puzzle_still_solvable(visible_card_letters);
    if ((!solvable && visible_card_letters.length > 0) || visible_card_letters.length === 1) {
        document.querySelector("#words").classList.add("puzzle-unsolvable-color");
    } else {
        document.querySelector("#words").classList.remove("puzzle-unsolvable-color");
    }
    if (visible_card_letters.length === 0 && hidden_card_letters.length === 0) {
        document.querySelector("#words").classList.add("puzzle-solved-color");
    }
}

function submit_cards() {
    let word_letters = [];
    let card_indexes = [];
    if (selected_cards.length <= 1) {
        deselect_all_cards();
        update_selected_letters_display();
        return;
    }

    for (const element of selected_cards) {
        if (element !== null) {
            word_letters.push(element.letter);
            card_indexes.push(element.index);
        }
    }
    let word = word_letters.join("");
    if (DICTIONARY.includes(word)) {
        delete_cards(card_indexes);

        let score = get_word_score(word_letters, true);
        let score_element = document.querySelector("#score-number");
        score_element.innerHTML = (Number(score_element.innerHTML) + score).toString();

        let words_list_element = document.querySelector("#words-list");
        if (words_list_element.textContent.length > 0) {
            words_list_element.textContent += ", ";
        }
        words_list_element.textContent += word;

        check_solvability();
    }
    deselect_all_cards();
    update_selected_letters_display();
}

function copy_url() {
    let seed = get_human_seed();
    navigator.clipboard.writeText(window.location.origin + window.location.pathname + "?seed=" + seed);
}

function new_random_puzzle() {
    let seed = get_random_seed().toString();
    const url_params = new URLSearchParams(window.location.search);
    url_params.set("seed", seed);
    window.location.href = window.location.origin + window.location.pathname + "?" + url_params.toString();
}

function jump_to_daily_puzzle() {
    window.location.href = window.location.origin + window.location.pathname;
}

function restart_puzzle() {
    window.location.reload();
}

function set_date() {
    let utc_milliseconds = get_human_seed();
    // Require exact UTC day between 2024/10/3 and 2080/6/1
    if (utc_milliseconds < 1728000000000 || utc_milliseconds > 3484512000000 || utc_milliseconds % MILLISECONDS_PER_DAY !== 0) {
        return;
    }
    let date = new Date(0);
    date.setUTCMilliseconds(utc_milliseconds);
    
    // getMonth is zero indexed
    document.querySelector("#daily-date").textContent = "(" + date.getUTCFullYear().toString().padStart(4, "0") + "/" + (date.getUTCMonth() + 1).toString().padStart(2, "0") + "/" + date.getUTCDate().toString().padStart(2, "0") + ")";
}

populate_cards();

document.querySelector("#submit-button").addEventListener("click", submit_cards);
document.querySelector("#restart-puzzle").addEventListener("click", restart_puzzle);
document.querySelector("#copy-puzzle-link").addEventListener("click", copy_url);
document.querySelector("#new-random-puzzle").addEventListener("click", new_random_puzzle);
document.querySelector("#daily-puzzle").addEventListener("click", jump_to_daily_puzzle);

set_date();
