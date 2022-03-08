export type Colour = "white" | "black";

export const Colour: { [k: string]: Colour } = {
    WHITE: "white",
    BLACK: "black",
};

export type PieceType = "king" | "queen" | "bishop" | "knight" | "rook" | "pawn";

export const PieceType: { [k: string]: PieceType } = {
    KING: "king",
    QUEEN: "queen",
    BISHOP: "bishop",
    KNIGHT: "knight",
    ROOK: "rook",
    PAWN: "pawn",
};

export interface Piece {
    readonly colour: Colour;
    readonly type: PieceType;
    hasMoved: boolean;
}
