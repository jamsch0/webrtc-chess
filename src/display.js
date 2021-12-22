import Board, { BOARD_SIZE } from "./board.js";
import { range } from './iter.js';

/** @typedef {import("./board.js").Coord} Coord */

export default class Display {
    /** @type {(HTMLDivElement)[]} */
    #squares = [];

    #board = document.getElementById('game-board');

    /**
     * @param {Board} board
     * @memberof Display
     */
    constructor(board) {
        this.initBoard();
        this.render(board);
    }

    initBoard() {
        if (this.#board === null) return;

        this.#board?.style.setProperty(
            'grid-template-columns',
            'auto '.repeat(BOARD_SIZE)
        );
    }

    /**
     * @param {Board} board
     * @memberof Display
     */
    render(board) {
        if (this.#board === null) return;

        this.#board.innerHTML = '';

        const squares = [];

        for (const index of range(0, BOARD_SIZE ** 2)) {
            const square = document.createElement('div');

            // Calculate positions
            const x = index % BOARD_SIZE;
            const y = Math.floor(index / BOARD_SIZE);
            const coord = /** @type {Coord} */ ([x, y]);

            const colour = (index + y) % 2 === 0 ? 'black' : 'white';
            square.classList.add('square', colour);

            const piece = board.get(coord);

            const content = document.createElement('div');
            content.classList.add('square-content');
            content.innerHTML = piece
                ? piece.type + "<br/>" + piece.colour + "<br/>" + index
                : '';

            square.appendChild(content);
            this.#board?.prepend(square);

            squares.push(square);
        }

        this.#squares = squares;
    }

    /**
     * @memberof Display
     *
     * @param {number} x
     * @param {number} y
     *
     * @returns {HTMLDivElement}
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
