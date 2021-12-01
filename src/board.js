import { Colour, PieceType } from "./piece.js";
import { range, repeat, zip } from "./iter.js";

/** @typedef {import("./piece.js").Piece} Piece */

const BOARD_SIZE = 8;

/** @typedef {0 | 1 | 2 | 3 | 4 | 5 | 6 | 7} CoordElem */
/** @typedef {readonly [CoordElem, CoordElem]} Coord */

/**
 * A chess board.
 *
 * Files (columns) are indexed left-to-right, and ranks (rows) front-to-back
 * (or bottom-to-top when viewed from above), from White's perspective.
 *
 * The board is initialised ready for play with pieces placed in their initial
 * positions.
 *
 * White starts on the first two ranks, and Black on the last two.
 */
export default class Board {
    /** @type {(Piece | undefined)[]} */
    #squares;

    /** @type {readonly (Readonly<Piece> | undefined)[]} */
    get squares() {
        return this.#squares;
    }

    constructor() {
        this.#squares = new Array(BOARD_SIZE ** 2);

        // White
        this.#squares[0] = { colour: Colour.WHITE, type: PieceType.ROOK, hasMoved: false };
        this.#squares[1] = { colour: Colour.WHITE, type: PieceType.KNIGHT, hasMoved: false };
        this.#squares[2] = { colour: Colour.WHITE, type: PieceType.BISHOP, hasMoved: false };
        this.#squares[3] = { colour: Colour.WHITE, type: PieceType.QUEEN, hasMoved: false };
        this.#squares[4] = { colour: Colour.WHITE, type: PieceType.KING, hasMoved: false };
        this.#squares[5] = { colour: Colour.WHITE, type: PieceType.BISHOP, hasMoved: false };
        this.#squares[6] = { colour: Colour.WHITE, type: PieceType.KNIGHT, hasMoved: false };
        this.#squares[7] = { colour: Colour.WHITE, type: PieceType.ROOK, hasMoved: false };

        for (const i of range(0, BOARD_SIZE)) {
            this.#squares[BOARD_SIZE + i] = { colour: Colour.WHITE, type: PieceType.PAWN, hasMoved: false };
        }

        // Black
        this.#squares[(7 * BOARD_SIZE) + 0] = { colour: Colour.BLACK, type: PieceType.ROOK, hasMoved: false };
        this.#squares[(7 * BOARD_SIZE) + 1] = { colour: Colour.BLACK, type: PieceType.KNIGHT, hasMoved: false };
        this.#squares[(7 * BOARD_SIZE) + 2] = { colour: Colour.BLACK, type: PieceType.BISHOP, hasMoved: false };
        this.#squares[(7 * BOARD_SIZE) + 3] = { colour: Colour.BLACK, type: PieceType.QUEEN, hasMoved: false };
        this.#squares[(7 * BOARD_SIZE) + 4] = { colour: Colour.BLACK, type: PieceType.KING, hasMoved: false };
        this.#squares[(7 * BOARD_SIZE) + 5] = { colour: Colour.BLACK, type: PieceType.BISHOP, hasMoved: false };
        this.#squares[(7 * BOARD_SIZE) + 6] = { colour: Colour.BLACK, type: PieceType.KNIGHT, hasMoved: false };
        this.#squares[(7 * BOARD_SIZE) + 7] = { colour: Colour.BLACK, type: PieceType.ROOK, hasMoved: false };

        for (const i of range(0, BOARD_SIZE)) {
            this.#squares[(6 * BOARD_SIZE) + i] = { colour: Colour.BLACK, type: PieceType.PAWN, hasMoved: false };
        }
    }

    /**
     * @param {Coord} pos
     * @returns {Piece | undefined}
     */
    get(pos) {
        return this.#squares[(pos[1] * BOARD_SIZE) + pos[0]];
    }

    /**
     * Checks if every square in a straight line between from and to (exclusive) is empty.
     * @param {Coord} from
     * @param {Coord} to
     * @returns {boolean}
     */
    clearLineOfSight(from, to) {
        const fileDiff = to[0] - from[0];
        const rankDiff = to[1] - from[1];

        if (fileDiff === 0 && rankDiff === 0) {
            return true;
        }
        if (fileDiff !== 0 && rankDiff !== 0 && Math.abs(fileDiff) !== Math.abs(rankDiff)) {
            // Not horizontal, vertical, nor diagonal
            return false;
        }

        const fileIter = fileDiff !== 0 ? range(from[0] + Math.sign(fileDiff), to[0]) : repeat(from[0]);
        const rankIter = rankDiff !== 0 ? range(from[1] + Math.sign(rankDiff), to[1]) : repeat(from[1]);

        for (const [file, rank] of zip(fileIter, rankIter)) {
            const pos = /** @type {Coord} */ ([file, rank]);
            if (this.get(pos) != undefined) {
                return false;
            }
        }

        return true;
    }

    /**
     * @param {Piece} piece
     * @param {Coord} pos
     */
    place(piece, pos) {
        const i = (pos[1] * BOARD_SIZE) + pos[0];
        if (this.#squares[i] != undefined) {
            throw new Error(`Existing piece at [${pos}]`);
        }

        this.#squares[i] = piece;
    }

    /**
     * @param {Coord} pos
     */
    remove(pos) {
        this.#squares[(pos[1] * BOARD_SIZE) + pos[0]] = undefined;
    }

    /**
     * @param {Coord} from
     * @param {Coord} to
     */
    move(from, to) {
        const piece = this.get(from);
        if (piece == undefined) {
            throw new Error(`No piece at [${from}]`);
        }

        this.remove(from);
        this.place(piece, to);
        piece.hasMoved = true;
    }
}
