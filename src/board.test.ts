import test from "ava";
import Board from "./board.js";
import { Colour, Piece, PieceType } from "./piece.js";

test("is created with correct number of squares", t => {
    const board = new Board();
    t.is(board.squares.length, 64);
});

test("is created with correct pieces", t => {
    const board = new Board();

    const pieces = board.squares.filter(piece => piece !== undefined) as Piece[];
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

test("clearLineOfSight returns true when origin and target square are the same", t => {
    const board = new Board();
    t.true(board.clearLineOfSight([5, 5], [5, 5]));
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

test("place adds piece to square", t => {
    const board = new Board();
    const piece = { colour: Colour.WHITE, type: PieceType.PAWN, hasMoved: false };
    board.place(piece, [6, 4]);
    t.is(board.get([6, 4]), piece);
});

test("place throws error when square is already occupied", t => {
    const board = new Board();
    const piece = { colour: Colour.WHITE, type: PieceType.PAWN, hasMoved: false };
    t.throws(() => board.place(piece, [0, 1]), { message: "Existing piece at [0,1]" });
});

test("remove clears piece from square", t => {
    const board = new Board();
    board.remove([0, 1]);
    t.is(board.get([0, 1]), undefined);
});

test("move clears piece from origin square and adds it to destination square", t => {
    const board = new Board();
    const piece = board.get([5, 6]);
    board.move([5, 6], [5, 4]);

    t.true(piece?.hasMoved);
    t.is(board.get([5, 4]), piece);
    t.is(board.get([5, 6]), undefined);
});

test("move throws error when origin square is empty", t => {
    const board = new Board();
    t.throws(() => board.move([3, 4], [5, 2]), { message: "No piece at [3,4]" });
});

test("move throws error when desination square is occupied", t => {
    const board = new Board();
    t.throws(() => board.move([2, 7], [3, 6]), { message: "Existing piece at [3,6]" });
});
