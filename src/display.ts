import Board, { BOARD_SIZE, Coord, indexToCoord } from "./board.js";
import dispatcher from "./dispatcher.js";
import Game, { SquareSelectedEvent } from "./game.js";
import { range } from "./iter.js";
import { PieceType } from "./piece.js";

export default class Display {
    #squares: HTMLElement[] = [];

    constructor() {
        dispatcher.addEventListener("sessionestablished", event => this.render(event.detail.session.game.board));

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

    init(game: Readonly<Game>): void {
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

    render(board: Readonly<Board>): void {
        for (const index of range(0, this.#squares.length)) {
            const elem = this.#squares[index];
            elem.className = "piece";

            const piece = board.get(indexToCoord(index));
            if (piece !== undefined) {
                elem.classList.add(`${piece.type}-${piece.colour}`);
            }
        }
    }

    #onClick(event: MouseEvent): void {
        const target = event.currentTarget as HTMLElement;

        const squareWidth = target.clientWidth / BOARD_SIZE;
        const squareHeight = target.clientHeight / BOARD_SIZE;

        const relativeX = event.clientX - target.offsetLeft;
        const relativeY = event.clientY - target.offsetTop;

        let x: number;
        let y: number;
        if (target.classList.contains("rotate")) {
            x = Math.floor((target.clientWidth - relativeX) / squareWidth);
            y = Math.floor(relativeY / squareHeight);
        } else {
            x = Math.floor(relativeX / squareWidth);
            y = Math.floor((target.clientHeight - relativeY) / squareHeight);
        }

        const detail: SquareSelectedEvent = { pos: [x, y] as Coord };
        dispatcher.dispatchEvent(new CustomEvent("squareselected", { detail }));
    }

    #showCheckAlert(game: Game): void {
        if (game.state.inCheck === game.state.player) {
            window.alert("Check!");
        }
    }

    #showPromotionPrompt(game: Game): void {
        if (game.state.promoting === undefined || game.state.currentTurn !== game.state.player) {
            return;
        }

        let type: string | undefined;
        do {
            type = window.prompt("Enter type you wish to promote to:", "queen")?.toLowerCase();
        } while (type === undefined || !["queen", "bishop", "knight", "rook"].includes(type));

        game.promote(type as PieceType);
    }
}
