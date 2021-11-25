import { Colour, PieceType } from "./piece.js";

/** @typedef {import("./piece.js").Piece} Piece */

const BOARD_SIZE = 8;

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
    #squares = [];

    /** @type {readonly (Readonly<Piece> | undefined)[]} */
    get squares() {
        return this.#squares;
    }

    constructor() {
        this.reset();
    }

    /**
     * Resets the board with pieces placed back in their initial positions.
     */
    reset() {
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

        for (let i = 0; i < BOARD_SIZE; i++) {
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

        for (let i = 0; i < BOARD_SIZE; i++) {
            this.#squares[(6 * BOARD_SIZE) + i] = { colour: Colour.BLACK, type: PieceType.PAWN, hasMoved: false };
        }
    }
}
