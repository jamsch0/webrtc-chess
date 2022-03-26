import Board, { indexToCoord } from "./board.js";
import dispatcher from "./dispatcher.js";
/**
 * A game of chess.
 *
 * The board is initialised ready for play with pieces placed in their starting
 * positions. White moves first.
 *
 * See {@link Board} for detail on how board positions are indexed.
 */
export default class Game {
    #board = new Board();
    get board() {
        return this.#board;
    }
    #state = { currentTurn: "white", moveCount: 0 };
    get state() {
        return this.#state;
    }
    #eventListening = new AbortController();
    constructor() {
        dispatcher.addEventListener("squareselected", event => this.#onSquareSelected(event), { signal: this.#eventListening.signal });
    }
    destroy() {
        this.#eventListening.abort();
    }
    move(from, to) {
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
        const detail = { game: this, from, to, moveCount: this.#state.moveCount };
        dispatcher.dispatchEvent(new CustomEvent("piecemoved", { detail }));
    }
    #isValidPieceMovement(from, to, piece, isCapturingPiece) {
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
    #canPieceCaptureTarget(from, to, piece, targetPiece) {
        return piece.colour !== targetPiece.colour
            && this.#isValidPieceMovement(from, to, piece, true)
            && (piece.type === "knight" || this.#board.hasClearLineOfSight(from, to));
    }
    #isKingInCheck(colour) {
        const kingPos = this.#board.findPos(colour, "king");
        const king = this.#board.get(kingPos);
        for (const [index, piece] of this.#board.squares.entries()) {
            const piecePos = indexToCoord(index);
            if (piece !== undefined && this.#canPieceCaptureTarget(piecePos, kingPos, piece, king)) {
                return true;
            }
        }
        return false;
    }
    #onSquareSelected(event) {
        const from = this.#state.selectedSquare;
        if (from === undefined) {
            this.#state.selectedSquare = event.detail.pos;
            return;
        }
        try {
            const to = event.detail.pos;
            this.move(from, to);
        }
        catch (error) {
            console.error(error);
        }
        finally {
            this.#state.selectedSquare = undefined;
        }
    }
    toJSON() {
        return JSON.stringify({ state: this.#state, board: this.#board.squares });
    }
}
