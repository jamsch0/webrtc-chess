import test from "ava";
import Board from "./board.js";
import { Colour, PieceType } from "./piece.js";

/** @typedef {import("./board.js").Piece} Piece */

test("Board is created with correct pieces", t => {
    const board = new Board();

    const pieces = /** @type {Piece[]} */ (board.squares.filter(piece => piece != undefined));
    const whitePieces = pieces.filter(piece => piece.colour === Colour.WHITE);
    const blackPieces = pieces.filter(piece => piece.colour === Colour.BLACK);

    t.true(pieces.every(piece => !piece.hasMoved));

    t.is(whitePieces.filter(piece => piece.type === PieceType.KING).length, 1);
    t.is(blackPieces.filter(piece => piece.type === PieceType.KING).length, 1);

    t.is(whitePieces.filter(piece => piece.type === PieceType.QUEEN).length, 1);
    t.is(blackPieces.filter(piece => piece.type === PieceType.QUEEN).length, 1);

    t.is(whitePieces.filter(piece => piece.type === PieceType.BISHOP).length, 2);
    t.is(blackPieces.filter(piece => piece.type === PieceType.BISHOP).length, 2);

    t.is(whitePieces.filter(piece => piece.type === PieceType.KNIGHT).length, 2);
    t.is(blackPieces.filter(piece => piece.type === PieceType.KNIGHT).length, 2);

    t.is(whitePieces.filter(piece => piece.type === PieceType.ROOK).length, 2);
    t.is(blackPieces.filter(piece => piece.type === PieceType.ROOK).length, 2);

    t.is(whitePieces.filter(piece => piece.type === PieceType.PAWN).length, 8);
    t.is(blackPieces.filter(piece => piece.type === PieceType.PAWN).length, 8);
});
