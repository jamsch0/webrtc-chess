import Board, { Coord, indexToCoord } from "./board.js";
import dispatcher from "./dispatcher.js";
import Piece, { Colour } from "./piece.js";

export interface PieceMovedEvent {
    readonly game: Game;
    readonly from: Coord;
    readonly to: Coord;
    readonly moveCount: number;
}

export interface SquareSelectedEvent {
    readonly pos: Coord;
}

declare global {
    interface DispatcherEventMap {
        "piecemoved": PieceMovedEvent;
        "squareselected": SquareSelectedEvent;
    }
}

interface GameState {
    readonly player: Colour;
    currentTurn: Colour;
    moveCount: number;
    inCheck?: Colour;
    selectedSquare?: Coord;
}

/**
 * A game of chess.
 *
 * The board is initialised ready for play with pieces placed in their starting
 * positions. White moves first.
 *
 * See {@link Board} for detail on how board positions are indexed.
 */
export default class Game {
    #board: Board = new Board();
    get board(): Readonly<Board> {
        return this.#board;
    }

    #state: GameState;
    get state(): Readonly<GameState> {
        return this.#state;
    }

    #eventListening = new AbortController();

    constructor(player: Colour) {
        this.#state = { player, currentTurn: "white", moveCount: 0 };

        dispatcher.addEventListener(
            "squareselected",
            event => this.#onSquareSelected(event),
            { signal: this.#eventListening.signal },
        );
    }

    destroy(): void {
        this.#eventListening.abort();
    }

    move(from: Coord, to: Coord): void {
        const piece = this.#board.get(from);
        if (piece?.colour !== this.#state.currentTurn) {
            throw new Error(`Cannot move piece at [${from}]`);
        }

        const targetPiece = this.#board.get(to);
        if (targetPiece?.colour === this.#state.currentTurn || targetPiece?.type === "king") {
            throw new Error(`Cannot capture piece at [${to}]`);
        }

        if (!this.#isValidPieceMovement(from, to, piece, targetPiece !== undefined)) {
            throw new Error(`Cannot move ${piece.type} from [${from}] to [${to}]`);
        }

        if (piece.type !== "knight" && !this.#board.hasClearLineOfSight(from, to)) {
            throw new Error(`Move from [${from}] to [${to}] obstructed`);
        }

        this.#board.remove(to);
        this.#board.move(from, to);

        if (this.#isKingInCheck(this.#state.currentTurn)) {
            this.#board.move(to, from);
            if (targetPiece !== undefined) {
                this.#board.place(targetPiece, to);
            }

            throw new Error("Cannot end turn with king in check");
        }

        this.#state.currentTurn = this.#state.currentTurn === "white" ? "black" : "white";
        this.#state.moveCount += 1;
        this.#state.inCheck = this.#isKingInCheck(this.#state.currentTurn) ? this.#state.currentTurn : undefined;

        const detail: PieceMovedEvent = { game: this, from, to, moveCount: this.#state.moveCount };
        dispatcher.dispatchEvent(new CustomEvent("piecemoved", { detail }));
    }

    #isValidPieceMovement(from: Coord, to: Coord, piece: Piece, isCapturingPiece: boolean): boolean {
        const fileDiff = to[0] - from[0];
        const rankDiff = to[1] - from[1];

        if (fileDiff === 0 && rankDiff === 0) {
            return false;
        }

        switch (piece.type) {
            case "king":
                return Math.abs(fileDiff) <= 1 && Math.abs(rankDiff) <= 1;

            case "queen":
                return fileDiff === 0 || rankDiff === 0 || Math.abs(fileDiff) === Math.abs(rankDiff);

            case "bishop":
                return Math.abs(fileDiff) === Math.abs(rankDiff);

            case "knight":
                return (Math.abs(fileDiff) === 1 && Math.abs(rankDiff) === 2)
                    || (Math.abs(fileDiff) === 2 && Math.abs(rankDiff) === 1);

            case "rook":
                return fileDiff === 0 || rankDiff === 0;

            case "pawn":
                const direction = piece.colour === "white" ? 1 : -1;
                return (rankDiff === direction || (!piece.hasMoved && rankDiff === 2 * direction))
                    && (isCapturingPiece ? Math.abs(fileDiff) === 1 : fileDiff === 0);

            default:
                // unreachable
                return false;
        }
    }

    #canPieceCaptureTarget(from: Coord, to: Coord, piece: Piece, targetPiece: Piece): boolean {
        return piece.colour !== targetPiece.colour
            && this.#isValidPieceMovement(from, to, piece, true)
            && (piece.type === "knight" || this.#board.hasClearLineOfSight(from, to));
    }

    #isKingInCheck(colour: Colour): boolean {
        const kingPos = this.#board.findPos(colour, "king")!;
        const king = this.#board.get(kingPos)!;

        for (const [index, piece] of this.#board.squares.entries()) {
            const piecePos = indexToCoord(index);
            if (piece !== undefined && this.#canPieceCaptureTarget(piecePos, kingPos, piece, king)) {
                return true;
            }
        }

        return false;
    }

    #onSquareSelected(event: CustomEvent<SquareSelectedEvent>): void {
        if (this.#state.currentTurn !== this.#state.player) {
            return;
        }

        const from = this.#state.selectedSquare;
        if (from === undefined) {
            this.#state.selectedSquare = event.detail.pos;
            return;
        }

        try {
            const to = event.detail.pos;
            this.move(from, to);
        } catch (error) {
            console.error(error);
        } finally {
            this.#state.selectedSquare = undefined;
        }
    }

    toJSON(): string {
        return JSON.stringify({ state: this.#state, board: this.#board.squares });
    }
}
