import { BOARD_SIZE, indexToCoord } from "./board.js";
import dispatcher from "./dispatcher.js";
import { range } from "./iter.js";
export default class Display {
    #squares = [];
    constructor() {
        this.#initBoard();
        dispatcher.addEventListener("piecemoved", event => {
            this.render(event.detail.game.board);
            queueMicrotask(() => this.#showPawnPromotionPrompt(event.detail.game));
        });
        dispatcher.addEventListener("pawnpromoted", event => this.render(event.detail.game.board));
    }
    #initBoard() {
        const board = document.getElementById("game-board");
        if (board === null) {
            return;
        }
        board.innerHTML = "";
        board.style.setProperty("grid-template-columns", "auto ".repeat(BOARD_SIZE));
        board.addEventListener("click", event => this.#onClick(event));
        this.#squares = new Array(BOARD_SIZE ** 2);
        for (const index of range(0, this.#squares.length)) {
            const pos = indexToCoord(index);
            const square = document.createElement("div");
            const colour = (pos[0] + pos[1]) % 2 === 0 ? "black" : "white";
            square.classList.add("square", colour);
            const position = document.createElement("span");
            position.classList.add("square-position");
            position.innerText = `[${pos[0]}, ${pos[1]}]`;
            square.appendChild(position);
            const content = document.createElement("div");
            content.classList.add("square-content");
            this.#squares[index] = content;
            square.appendChild(content);
            board.prepend(square);
        }
    }
    render(board) {
        for (const index of range(0, this.#squares.length)) {
            const piece = board.get(indexToCoord(index));
            this.#squares[index].innerText = piece ? `${piece.type}\n${piece.colour}` : "";
        }
    }
    #onClick(event) {
        const target = event.currentTarget;
        const squareWidth = target.clientWidth / BOARD_SIZE;
        const squareHeight = target.clientHeight / BOARD_SIZE;
        const relativeX = event.clientX - target.offsetLeft;
        const relativeY = event.clientY - target.offsetTop;
        const x = Math.floor(relativeX / squareWidth);
        const y = Math.floor((target.clientHeight - relativeY) / squareHeight);
        const detail = { pos: [x, y] };
        dispatcher.dispatchEvent(new CustomEvent("squareselected", { detail }));
    }
    #showPawnPromotionPrompt(game) {
        if (game.state.promotingPawn === undefined || game.state.currentTurn !== game.state.player) {
            return;
        }
        let type = null;
        do {
            type = window.prompt("Enter type you wish to promote pawn to:", "pawn");
        } while (type === null || !["queen", "bishop", "knight", "rook", "pawn"].includes(type.toLowerCase()));
        game.promotePawn(type);
    }
}
