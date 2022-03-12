export type Colour = "white" | "black";
export type PieceType = "king" | "queen" | "bishop" | "knight" | "rook" | "pawn";

export default interface Piece {
    readonly colour: Colour;
    readonly type: PieceType;
    hasMoved: boolean;
}
