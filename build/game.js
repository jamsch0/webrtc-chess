import Board from "./board.js";
import { Colour, PieceType } from "./piece.js";
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
    #state = { currentTurn: Colour.WHITE };
    get state() {
        return this.#state;
    }
    move(from, to) {
        const piece = this.#board.get(from);
        if (piece?.colour !== this.#state.currentTurn) {
            throw new Error(`Cannot move piece at [${from}]`);
        }
        const targetPiece = this.#board.get(to);
        if (targetPiece?.colour === this.#state.currentTurn || targetPiece?.type === PieceType.KING) {
            throw new Error(`Cannot capture piece at [${to}]`);
        }
        if (!this.#validPieceMovement(from, to, piece, targetPiece != undefined)) {
            throw new Error(`Cannot move ${piece.type} from [${from}] to [${to}]`);
        }
        if (piece.type !== PieceType.KNIGHT && !this.#board.clearLineOfSight(from, to)) {
            throw new Error(`Move from [${from}] to [${to}] obstructed`);
        }
        this.#board.remove(to);
        this.#board.move(from, to);
        this.#state.currentTurn = this.#state.currentTurn === Colour.WHITE ? Colour.BLACK : Colour.WHITE;
    }
    #validPieceMovement(from, to, piece, capturingPiece) {
        const fileDiff = to[0] - from[0];
        const rankDiff = to[1] - from[1];
        if (fileDiff === 0 && rankDiff === 0) {
            return false;
        }
        switch (piece.type) {
            case PieceType.KING:
                return Math.abs(fileDiff) <= 1 && Math.abs(rankDiff) <= 1;
            case PieceType.QUEEN:
                return fileDiff === 0 || rankDiff === 0 || Math.abs(fileDiff) === Math.abs(rankDiff);
            case PieceType.BISHOP:
                return Math.abs(fileDiff) === Math.abs(rankDiff);
            case PieceType.KNIGHT:
                return (Math.abs(fileDiff) === 1 && Math.abs(rankDiff) === 2)
                    || (Math.abs(fileDiff) === 2 && Math.abs(rankDiff) === 1);
            case PieceType.ROOK:
                return fileDiff === 0 || rankDiff === 0;
            case PieceType.PAWN:
                const direction = piece.colour === Colour.WHITE ? 1 : -1;
                return (rankDiff === direction || (!piece.hasMoved && rankDiff === 2 * direction))
                    && (capturingPiece ? Math.abs(fileDiff) === 1 : fileDiff === 0);
            default:
                // unreachable
                return false;
        }
    }
    toJSON() {
        return JSON.stringify({ state: this.#state, board: this.#board.squares });
    }
}
