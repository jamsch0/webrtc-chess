import _test, { TestFn } from "ava";
import dispatcher from "./dispatcher.js";
import Game, { SquareSelectedEvent } from "./game.js";

const test = _test as TestFn<Game>;
test.beforeEach(t => t.context = new Game());
test.afterEach(t => t.context.destroy());

test("is created with correct starting state", t => {
    t.is(t.context.state.currentTurn, "white");
});

test("move throws error when origin square is empty", t => {
    t.throws(() => t.context.move([0, 2], [0, 3]), { message: "Cannot move piece at [0,2]" });
});

test("move throws error when piece is not owned by current player", t => {
    t.is(t.context.board.get([0, 6])?.colour, "black");
    t.throws(() => t.context.move([0, 6], [0, 5]), { message: "Cannot move piece at [0,6]" });
});

test("move throws error when captured piece is owned by current player", t => {
    t.is(t.context.board.get([3, 1])?.colour, "white");
    t.throws(() => t.context.move([3, 0], [3, 1]), { message: "Cannot capture piece at [3,1]" });
});

test("move throws error when captured piece is a king", t => {
    t.context.board.move([4, 7], [4, 2]);
    t.is(t.context.board.get([4, 2])?.type, "king");
    t.throws(() => t.context.move([4, 1], [4, 2]), { message: "Cannot capture piece at [4,2]" });
});

test("move throws error when one or more intermediate square is not empty unless piece is a knight", t => {
    t.not(t.context.board.get([7, 0])?.type, "knight");
    t.throws(() => t.context.move([7, 0], [7, 3]), { message: "Move from [7,0] to [7,3] obstructed" });

    t.is(t.context.board.get([1, 0])?.type, "knight");
    t.context.move([1, 0], [2, 2]);
});

test("move updates piece position and swaps current player", t => {
    let piece = t.context.board.get([3, 1]);
    t.context.move([3, 1], [3, 3]);
    t.is(t.context.board.get([3, 3]), piece);
    t.is(t.context.board.get([3, 1]), undefined);
    t.is(t.context.state.currentTurn, "black");

    t.context.board.move([3, 7], [3, 5]);
    piece = t.context.board.get([3, 5]);
    t.context.move([3, 5], [3, 3]);
    t.is(t.context.board.get([3, 3]), piece);
    t.is(t.context.board.get([3, 5]), undefined);
    t.is(t.context.state.currentTurn, "white");
});

test("move updates in check", t => {
    t.context.move([5, 1], [5, 2]);
    t.context.move([4, 6], [4, 5]);
    t.context.move([6, 1], [6, 3]);
    t.context.move([5, 6], [5, 4]);
    t.context.move([3, 1], [3, 2]);
    t.is(t.context.state.inCheck, undefined);

    t.context.move([3, 7], [7, 3]);
    t.is(t.context.state.inCheck, "white");

    t.context.move([4, 0], [3, 1]);
    t.is(t.context.state.inCheck, undefined);
});

test.serial("move updates move count and dispatches piecemoved event", t => {
    dispatcher.addEventListener("piecemoved", event => {
        t.is(event.detail.game, t.context);
        t.is(event.detail.moveCount, 1);
        t.deepEqual(event.detail.from, [3, 1]);
        t.deepEqual(event.detail.to, [3, 3]);
    }, { once: true });

    t.context.move([3, 1], [3, 3]);
    t.is(t.context.state.moveCount, 1);
});

test.serial("squareselected event selects square", t => {
    t.is(t.context.state.selectedSquare, undefined);

    const detail: SquareSelectedEvent = { pos: [4, 1] };
    dispatcher.dispatchEvent(new CustomEvent("squareselected", { detail }));
    t.is(t.context.state.selectedSquare, detail.pos);
});

test.serial("squareselected event moves piece from previously selected square to selected square", t => {
    const piece = t.context.board.get([1, 0]);
    let detail: SquareSelectedEvent = { pos: [1, 0] };
    dispatcher.dispatchEvent(new CustomEvent("squareselected", { detail }));

    detail = { pos: [2, 2] };
    dispatcher.dispatchEvent(new CustomEvent("squareselected", { detail }));
    t.is(t.context.state.selectedSquare, undefined);
    t.is(t.context.board.get([2, 2]), piece);
});

test.serial("squareselected event unselects square when attempting invalid move", t => {
    let detail: SquareSelectedEvent = { pos: [3, 7] };
    dispatcher.dispatchEvent(new CustomEvent("squareselected", { detail }));

    detail = { pos: [1, 5] };
    dispatcher.dispatchEvent(new CustomEvent("squareselected", { detail }));
    t.is(t.context.state.selectedSquare, undefined);
});
