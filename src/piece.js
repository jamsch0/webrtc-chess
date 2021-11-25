/** @typedef {"white" | "black"} Colour */

export const Colour = {
    /** @readonly @type {Colour} */
    WHITE: "white",

    /** @readonly @type {Colour} */
    BLACK: "black",
};

/** @typedef {"king" | "queen" | "bishop" | "knight" | "rook" | "pawn"} PieceType */

export const PieceType = {
    /** @readonly @type {PieceType} */
    KING: "king",

    /** @readonly @type {PieceType} */
    QUEEN: "queen",

    /** @readonly @type {PieceType} */
    BISHOP: "bishop",

    /** @readonly @type {PieceType} */
    KNIGHT: "knight",

    /** @readonly @type {PieceType} */
    ROOK: "rook",

    /** @readonly @type {PieceType} */
    PAWN: "pawn",
};

/**
 * @typedef {Object} Piece
 * @property {Colour} colour
 * @property {PieceType} type
 * @property {boolean} hasMoved
 */
