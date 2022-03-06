import Board, { BOARD_SIZE } from "./board.js";
import { range } from "./iter.js";

/** @typedef {import("./board.js").Coord} Coord */

export default class Display {
    /** @type {HTMLElement[]} */
    #squares = [];

    constructor() {
        this.#initBoard();
    }

    /** @returns {void} */
    #initBoard() {
        const board = document.getElementById("game-board");
        if (board === null) {
            return;
        }

        board.innerHTML = "";
        board.style.setProperty("grid-template-columns", "auto ".repeat(BOARD_SIZE));

        this.#squares = new Array(BOARD_SIZE ** 2);
        for (const index of range(0, this.#squares.length)) {
            const x = index % BOARD_SIZE;
            const y = Math.floor(index / BOARD_SIZE);

            const square = document.createElement("div");
            const colour = (x + y) % 2 === 0 ? "black" : "white";
            square.classList.add("square", colour);

            const position = document.createElement("span");
            position.classList.add("square-position");
            position.innerText = `[${x}, ${y}]`;
            square.appendChild(position);

            const content = document.createElement("div");
            content.classList.add("square-content");
            this.#squares[index] = content;
            square.appendChild(content);

            board.prepend(square);
        }
    }

    /**
     * @param {Readonly<Board>} board
     * @returns {void}
     */
    render(board) {
        for (const index of range(0, this.#squares.length)) {
            const x = index % BOARD_SIZE;
            const y = Math.floor(index / BOARD_SIZE);
            const piece = board.get(/** @type {Coord} */ ([x, y]));

            this.#squares[index].innerText = piece ? `${piece.type}\n${piece.colour}` : "";
        }
    }

    /**
     * @memberof Display
     *
     * @param {number} x
     * @param {number} y
     *
     * @returns {HTMLElement}
     *
     * @throws
     */
    getBoardElement(x, y) {
        if (x >= BOARD_SIZE || y >= BOARD_SIZE) {
            throw new Error(`Position (${x},${y}) out of range`);
        }

        return this.#squares[x + (BOARD_SIZE * y)];
    }
}
