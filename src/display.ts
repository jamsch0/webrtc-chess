import Board, { BOARD_SIZE, Coord } from "./board.js";
import dispatcher from "./dispatcher.js";
import { PieceMovedEvent } from "./game.js";
import { range } from "./iter.js";

export default class Display {
    #squares: HTMLElement[] = [];

    constructor() {
        this.#initBoard();
        dispatcher.addEventListener<PieceMovedEvent>("piecemoved", event => this.render(event.detail.game.board));
    }

    #initBoard(): void {
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

    render(board: Readonly<Board>): void {
        for (const index of range(0, this.#squares.length)) {
            const x = index % BOARD_SIZE;
            const y = Math.floor(index / BOARD_SIZE);
            const piece = board.get([x, y] as Coord);

            this.#squares[index].innerText = piece ? `${piece.type}\n${piece.colour}` : "";
        }
    }

    getBoardElement(x: number, y: number): HTMLElement {
        if (x >= BOARD_SIZE || y >= BOARD_SIZE) {
            throw new Error(`Position (${x},${y}) out of range`);
        }

        return this.#squares[x + (BOARD_SIZE * y)];
    }
}
