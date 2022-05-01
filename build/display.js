import { BOARD_SIZE, indexToCoord } from "./board.js";
import dispatcher from "./dispatcher.js";
import { range } from "./iter.js";
export default class Display {
    #squares = [];
    constructor() {
        dispatcher.addEventListener("piecemoved", event => {
            this.render(event.detail.game.board);
            setTimeout(() => {
                this.#showCheckAlert(event.detail.game);
                this.#showPromotionPrompt(event.detail.game);
            });
        });
        dispatcher.addEventListener("pawnpromoted", event => {
            this.render(event.detail.game.board);
            setTimeout(() => this.#showCheckAlert(event.detail.game));
        });
    }
    init(game) {
        const board = document.getElementById("game-board");
        if (board === null) {
            return;
        }
        board.innerHTML = "";
        board.style.setProperty("grid-template-columns", "auto ".repeat(BOARD_SIZE));
        if (game.state.player === "black") {
            board.classList.add("rotate");
        }
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
            const piece = document.createElement("div");
            piece.classList.add("piece");
            this.#squares[index] = piece;
            square.appendChild(piece);
            board.prepend(square);
        }
        this.render(game.board);
    }
    render(board) {
        for (const index of range(0, this.#squares.length)) {
            const elem = this.#squares[index];
            elem.className = "piece";
            const piece = board.get(indexToCoord(index));
            if (piece !== undefined) {
                elem.classList.add(`${piece.type}-${piece.colour}`);
            }
        }
    }
    #onClick(event) {
        const target = event.currentTarget;
        const squareWidth = target.clientWidth / BOARD_SIZE;
        const squareHeight = target.clientHeight / BOARD_SIZE;
        const relativeX = event.clientX - target.offsetLeft;
        const relativeY = event.clientY - target.offsetTop;
        let x;
        let y;
        if (target.classList.contains("rotate")) {
            x = Math.floor((target.clientWidth - relativeX) / squareWidth);
            y = Math.floor(relativeY / squareHeight);
        }
        else {
            x = Math.floor(relativeX / squareWidth);
            y = Math.floor((target.clientHeight - relativeY) / squareHeight);
        }
        const detail = { pos: [x, y] };
        dispatcher.dispatchEvent(new CustomEvent("squareselected", { detail }));
    }
    #showCheckAlert(game) {
        if (game.state.inCheck === game.state.player) {
            window.alert("Check!");
        }
    }
    #showPromotionPrompt(game) {
        if (game.state.promoting === undefined || game.state.currentTurn !== game.state.player) {
            return;
        }
        let type;
        do {
            type = window.prompt("Enter type you wish to promote to:", "queen")?.toLowerCase();
        } while (type === undefined || !["queen", "bishop", "knight", "rook"].includes(type));
        game.promote(type);
    }
}
