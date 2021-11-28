import test from "ava";
import Board from "./board.js";
import { Colour, PieceType } from "./piece.js";

/** @typedef {import("./board.js").Piece} Piece */

test("is created with correct number of squares", t => {
    const board = new Board();
    t.is(board.squares.length, 64);
});

test("is created with correct pieces", t => {
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

test("clearLineOfSight returns false for squares not on the same rank, file, or diagonal", t => {
    const board = new Board();
    t.false(board.clearLineOfSight([2, 3], [5, 5]));
});

test("clearLineOfSight returns true for adjacent squares", t => {
    const board = new Board();
    t.true(board.clearLineOfSight([3, 0], [4, 0]));
    t.true(board.clearLineOfSight([6, 1], [5, 0]));
    t.true(board.clearLineOfSight([0, 6], [0, 7]));
});

test("clearLineOfSight returns true when all intermediate squares are empty", t => {
    const board = new Board();
    t.true(board.clearLineOfSight([6, 1], [1, 6]));
});

test("clearLineOfSight returns false when one or more intermediate square is not empty", t => {
    const board = new Board();
    t.false(board.clearLineOfSight([4, 1], [4, 7]));
    t.false(board.clearLineOfSight([3, 7], [6, 7]));
});
