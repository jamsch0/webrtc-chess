import test from "ava";
import Game from "./game.js";
import { Colour, PieceType } from "./piece.js";

test("is created with correct starting state", t => {
    const game = new Game();
    t.is(game.state.currentTurn, Colour.WHITE);
});

test("move throws error when origin square is empty", t => {
    const game = new Game();
    t.throws(() => game.move([0, 2], [0, 3]), { message: "Cannot move piece at [0,2]" });
});

test("move throws error when piece is not owned by current player", t => {
    const game = new Game();
    t.is(game.board.get([0, 6])?.colour, Colour.BLACK);
    t.throws(() => game.move([0, 6], [0, 5]), { message: "Cannot move piece at [0,6]" });
});

test("move throws error when captured piece is owned by current player", t => {
    const game = new Game();
    t.is(game.board.get([3, 1])?.colour, Colour.WHITE);
    t.throws(() => game.move([3, 0], [3, 1]), { message: "Cannot capture piece at [3,1]" });
});

test("move throws error when captured piece is a king", t => {
    const game = new Game();
    game.board.move([4, 7], [4, 2]);
    t.is(game.board.get([4, 2])?.type, PieceType.KING);
    t.throws(() => game.move([4, 1], [4, 2]), { message: "Cannot capture piece at [4,2]" });
});

test("move throws error when one or more intermediate square is not empty unless piece is a knight", t => {
    const game = new Game();

    t.not(game.board.get([7, 0])?.type, PieceType.KNIGHT);
    t.throws(() => game.move([7, 0], [7, 3]), { message: "Move from [7,0] to [7,3] obstructed" });

    t.is(game.board.get([1, 0])?.type, PieceType.KNIGHT);
    game.move([1, 0], [2, 2]);
});

test("move updates piece position and swaps current player", t => {
    const game = new Game();

    let piece = game.board.get([3, 1]);
    game.move([3, 1], [3, 3]);
    t.is(game.board.get([3, 3]), piece);
    t.is(game.board.get([3, 1]), undefined);
    t.is(game.state.currentTurn, Colour.BLACK);

    game.board.move([3, 7], [3, 5]);
    piece = game.board.get([3, 5]);
    game.move([3, 5], [3, 3]);
    t.is(game.board.get([3, 3]), piece);
    t.is(game.board.get([3, 5]), undefined);
    t.is(game.state.currentTurn, Colour.WHITE);
});
