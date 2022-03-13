import Board, { BOARD_SIZE, Coord } from "./board.js";
import dispatcher from "./dispatcher.js";
import { PieceMovedEvent, SquareSelectedEvent } from "./game.js";
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

        board.addEventListener("click", event => this.#onClick(event));

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

    #onClick(event: MouseEvent): void {
        const target = event.currentTarget as HTMLElement;

        const squareWidth = target.clientWidth / BOARD_SIZE;
        const squareHeight = target.clientHeight / BOARD_SIZE;

        const relativeX = event.clientX - target.offsetLeft;
        const relativeY = event.clientY - target.offsetTop;

        const x = Math.floor(relativeX / squareWidth);
        const y = Math.floor((target.clientHeight - relativeY) / squareHeight);

        const detail: SquareSelectedEvent = { pos: [x, y] as Coord };
        dispatcher.dispatchEvent(new CustomEvent("squareselected", { detail }));
    }
}
