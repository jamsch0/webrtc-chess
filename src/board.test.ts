import test from "ava";
import Board from "./board.js";
import Piece from "./piece.js";

test("is created with correct number of squares", t => {
    const board = new Board();
    t.is(board.squares.length, 64);
});

test("is created with correct pieces", t => {
    const board = new Board();

    const pieces = board.squares.filter(piece => piece !== undefined) as Piece[];
    const whitePieces = pieces.filter(piece => piece.colour === "white");
    const blackPieces = pieces.filter(piece => piece.colour === "black");

    t.true(pieces.every(piece => !piece.hasMoved));

    t.is(whitePieces.filter(piece => piece.type === "king").length, 1);
    t.is(blackPieces.filter(piece => piece.type === "king").length, 1);

    t.is(whitePieces.filter(piece => piece.type === "queen").length, 1);
    t.is(blackPieces.filter(piece => piece.type === "queen").length, 1);

    t.is(whitePieces.filter(piece => piece.type === "bishop").length, 2);
    t.is(blackPieces.filter(piece => piece.type === "bishop").length, 2);

    t.is(whitePieces.filter(piece => piece.type === "knight").length, 2);
    t.is(blackPieces.filter(piece => piece.type === "knight").length, 2);

    t.is(whitePieces.filter(piece => piece.type === "rook").length, 2);
    t.is(blackPieces.filter(piece => piece.type === "rook").length, 2);

    t.is(whitePieces.filter(piece => piece.type === "pawn").length, 8);
    t.is(blackPieces.filter(piece => piece.type === "pawn").length, 8);
});

test("hasClearLineOfSight returns true when origin and target square are the same", t => {
    const board = new Board();
    t.true(board.hasClearLineOfSight([5, 5], [5, 5]));
});

test("hasClearLineOfSight returns false for squares not on the same rank, file, or diagonal", t => {
    const board = new Board();
    t.false(board.hasClearLineOfSight([2, 3], [5, 5]));
});

test("hasClearLineOfSight returns true for adjacent squares", t => {
    const board = new Board();
    t.true(board.hasClearLineOfSight([3, 0], [4, 0]));
    t.true(board.hasClearLineOfSight([6, 1], [5, 0]));
    t.true(board.hasClearLineOfSight([0, 6], [0, 7]));
});

test("hasClearLineOfSight returns true when all intermediate squares are empty", t => {
    const board = new Board();
    t.true(board.hasClearLineOfSight([6, 1], [1, 6]));
});

test("hasClearLineOfSight returns false when one or more intermediate square is not empty", t => {
    const board = new Board();
    t.false(board.hasClearLineOfSight([4, 1], [4, 7]));
    t.false(board.hasClearLineOfSight([3, 7], [6, 7]));
});

test("place adds piece to square", t => {
    const board = new Board();
    const piece: Piece = { colour: "white", type: "pawn", hasMoved: false };
    board.place(piece, [6, 4]);
    t.is(board.get([6, 4]), piece);
});

test("place throws error when square is already occupied", t => {
    const board = new Board();
    const piece: Piece = { colour: "white", type: "pawn", hasMoved: false };
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
