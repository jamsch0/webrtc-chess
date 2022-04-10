import { range, repeat, zip } from "./iter.js";
export const BOARD_SIZE = 8;
export function coordsEqual(a, b) {
    if (a === b) {
        return true;
    }
    else if (a === undefined || b === undefined) {
        return false;
    }
    else {
        return a[0] === b[0] && a[1] === b[1];
    }
}
export function coordToIndex(pos) {
    return (pos[1] * BOARD_SIZE) + pos[0];
}
export function indexToCoord(index) {
    return [index % BOARD_SIZE, Math.floor(index / BOARD_SIZE)];
}
/**
 * A chess board.
 *
 * Files (columns) are indexed left-to-right, and ranks (rows) front-to-back
 * (or bottom-to-top when viewed from above), from White's perspective.
 *
 * The board is initialised ready for play with pieces placed in their starting
 * positions.
 *
 * White starts on the first two ranks, and Black on the last two.
 */
export default class Board {
    #squares;
    get squares() {
        return this.#squares;
    }
    constructor() {
        this.#squares = new Array(BOARD_SIZE ** 2);
        // White
        this.#squares[0] = { colour: "white", type: "rook", hasMoved: false };
        this.#squares[1] = { colour: "white", type: "knight", hasMoved: false };
        this.#squares[2] = { colour: "white", type: "bishop", hasMoved: false };
        this.#squares[3] = { colour: "white", type: "queen", hasMoved: false };
        this.#squares[4] = { colour: "white", type: "king", hasMoved: false };
        this.#squares[5] = { colour: "white", type: "bishop", hasMoved: false };
        this.#squares[6] = { colour: "white", type: "knight", hasMoved: false };
        this.#squares[7] = { colour: "white", type: "rook", hasMoved: false };
        for (const i of range(0, BOARD_SIZE)) {
            this.#squares[BOARD_SIZE + i] = { colour: "white", type: "pawn", hasMoved: false };
        }
        // Black
        this.#squares[(7 * BOARD_SIZE) + 0] = { colour: "black", type: "rook", hasMoved: false };
        this.#squares[(7 * BOARD_SIZE) + 1] = { colour: "black", type: "knight", hasMoved: false };
        this.#squares[(7 * BOARD_SIZE) + 2] = { colour: "black", type: "bishop", hasMoved: false };
        this.#squares[(7 * BOARD_SIZE) + 3] = { colour: "black", type: "queen", hasMoved: false };
        this.#squares[(7 * BOARD_SIZE) + 4] = { colour: "black", type: "king", hasMoved: false };
        this.#squares[(7 * BOARD_SIZE) + 5] = { colour: "black", type: "bishop", hasMoved: false };
        this.#squares[(7 * BOARD_SIZE) + 6] = { colour: "black", type: "knight", hasMoved: false };
        this.#squares[(7 * BOARD_SIZE) + 7] = { colour: "black", type: "rook", hasMoved: false };
        for (const i of range(0, BOARD_SIZE)) {
            this.#squares[(6 * BOARD_SIZE) + i] = { colour: "black", type: "pawn", hasMoved: false };
        }
    }
    get(pos) {
        return this.#squares[coordToIndex(pos)];
    }
    findPos(colour, type) {
        const index = this.#squares.findIndex(piece => piece?.colour === colour && piece.type === type);
        return index > -1 ? indexToCoord(index) : undefined;
    }
    /**
     * Checks if every square in a straight line between from and to (exclusive) is empty.
     */
    hasClearLineOfSight(from, to) {
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
            const pos = [file, rank];
            if (this.get(pos) != undefined) {
                return false;
            }
        }
        return true;
    }
    place(piece, pos) {
        const i = coordToIndex(pos);
        if (this.#squares[i] != undefined) {
            throw new Error(`Existing piece at [${pos}]`);
        }
        this.#squares[i] = piece;
    }
    remove(pos) {
        this.#squares[coordToIndex(pos)] = undefined;
    }
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
