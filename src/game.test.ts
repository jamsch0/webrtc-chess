import _test, { TestFn } from "ava";
import dispatcher from "./dispatcher.js";
import Game, { SquareSelectedEvent } from "./game.js";

const test = _test as TestFn<Game>;
test.beforeEach(t => t.context = new Game("white"));
test.afterEach(t => t.context.destroy());

test("is created with correct starting state", t => {
    t.deepEqual(t.context.state, {
        player: "white",
        currentTurn: "white",
        moveCount: 0,
    });
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

test("move throws error when king ends turn in check", t => {
    t.context.board.move([4, 0], [4, 4]);
    t.throws(() => t.context.move([4, 4], [4, 5]), { message: "Cannot end turn with king in check" });

    t.context.board.move([4, 4], [4, 5]);
    t.throws(() => t.context.move([4, 5], [3, 5]), { message: "Cannot end turn with king in check" });

    t.notThrows(() => t.context.move([4, 5], [4, 4]));
});

test("move throws error when promotion is in progress", t => {
    t.context.board.move([0, 6], [0, 4]);
    t.context.board.move([0, 7], [0, 5]);
    t.context.board.move([0, 1], [0, 6]);
    t.context.move([0, 6], [0, 7]);
    t.not(t.context.state.promoting, undefined);

    t.throws(() => t.context.move([4, 6], [4, 5]), { message: "Cannot move while promotion is in progress" });
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

test("move does not swap current player when promotion is triggered", t => {
    t.context.board.move([0, 6], [0, 4]);
    t.context.board.move([0, 7], [0, 5]);
    t.context.board.move([0, 1], [0, 6]);
    t.is(t.context.state.currentTurn, "white");
    t.is(t.context.state.promoting, undefined);

    t.context.move([0, 6], [0, 7]);
    t.is(t.context.state.currentTurn, "white");
    t.deepEqual(t.context.state.promoting, [0, 7]);
});

test("move updates in check when piece directly checks opponent king", t => {
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

test("move updates in check when piece causes discovered check of opponent king", t => {
    t.context.board.move([0, 0], [4, 2]);
    t.context.board.move([2, 0], [4, 3]);
    t.context.board.move([4, 7], [4, 4]);
    t.is(t.context.state.inCheck, undefined);

    t.context.move([4, 3], [5, 2]);
    t.is(t.context.state.inCheck, "black");

    t.context.move([4, 4], [3, 5]);
    t.is(t.context.state.inCheck, undefined);
});

test.serial("move updates move count and dispatches piecemoved event", t => {
    t.plan(5);

    dispatcher.addEventListener("piecemoved", event => {
        t.is(event.detail.game, t.context);
        t.is(event.detail.moveCount, 1);
        t.deepEqual(event.detail.from, [3, 1]);
        t.deepEqual(event.detail.to, [3, 3]);
    }, { once: true });

    t.context.move([3, 1], [3, 3]);
    t.is(t.context.state.moveCount, 1);
});

test("move castles kingside", t => {
    t.context.board.remove([5, 0]);
    t.context.board.remove([6, 0]);

    const king = t.context.board.get([4, 0]);
    const rook = t.context.board.get([7, 0]);

    t.context.move([4, 0], [6, 0]);
    t.is(t.context.board.get([6, 0]), king);
    t.is(t.context.board.get([5, 0]), rook);
});

test("move castles queenside", t => {
    t.context.board.remove([1, 0]);
    t.context.board.remove([2, 0]);
    t.context.board.remove([3, 0]);

    const king = t.context.board.get([4, 0]);
    const rook = t.context.board.get([0, 0]);

    t.context.move([4, 0], [1, 0]);
    t.is(t.context.board.get([1, 0]), king);
    t.is(t.context.board.get([2, 0]), rook);
});

test("move does not castle when king has moved", t => {
    t.context.board.remove([5, 0]);
    t.context.board.remove([6, 0]);

    const king = t.context.board.get([4, 0])!;
    king.hasMoved = true;

    t.throws(() => t.context.move([4, 0], [6, 0]), { message: "Cannot move king from [4,0] to [6,0]" });
});

test("move does not castle when rook has moved", t => {
    t.context.board.remove([1, 0]);
    t.context.board.remove([2, 0]);
    t.context.board.remove([3, 0]);

    const rook = t.context.board.get([0, 0])!;
    rook.hasMoved = true;

    t.throws(() => t.context.move([4, 0], [1, 0]), { message: "Cannot move king from [4,0] to [1,0]" });
});

test("move does not castle when one or more square between king and rook is not empty", t => {
    t.context.board.remove([1, 0]);
    t.context.board.remove([3, 0]);

    t.throws(() => t.context.move([4, 0], [1, 0]), { message: "Cannot move king from [4,0] to [1,0]" });
});

test("move does not castle when one or more square between king and rook is under attack", t => {
    t.context.board.remove([1, 7]);
    t.context.board.remove([2, 7]);
    t.context.board.remove([3, 7]);
    t.context.board.move([4, 1], [4, 2]);
    t.context.board.move([1, 6], [1, 5]);
    t.context.move([5, 0], [0, 5]);

    t.throws(() => t.context.move([4, 7], [1, 7]), { message: "Cannot castle with [2,7] under attack" });
});

test("move does not castle when king is in check", t => {
    t.context.board.remove([5, 7]);
    t.context.board.remove([6, 7]);
    t.context.board.move([2, 1], [2, 2]);
    t.context.board.move([3, 6], [3, 5]);
    t.context.move([3, 0], [0, 3]);

    t.throws(() => t.context.move([4, 7], [6, 7]), { message: "Cannot castle with king in check" });
});

test("promote throws error when promotion is not in progress", t => {
    t.throws(() => t.context.promote("queen"), { message: "Promotion is not in progress" });
});

test("promote throws error when type is king", t => {
    t.context.board.move([0, 6], [0, 4]);
    t.context.board.move([0, 7], [0, 5]);
    t.context.board.move([0, 1], [0, 6]);
    t.context.move([0, 6], [0, 7]);

    t.throws(() => t.context.promote("king"), { message: "Cannot promote to a king" });
});

test("promote throws error when type is pawn", t => {
    t.context.board.move([0, 6], [0, 4]);
    t.context.board.move([0, 7], [0, 5]);
    t.context.board.move([0, 1], [0, 6]);
    t.context.move([0, 6], [0, 7]);

    t.throws(() => t.context.promote("pawn"), { message: "Cannot promote to a pawn" });
});

test.serial("promote updates piece type and current player and dispatches pawnpromoted event", t => {
    t.plan(7);

    dispatcher.addEventListener("pawnpromoted", event => {
        t.is(event.detail.game, t.context);
        t.deepEqual(event.detail.pos, [0, 7]);
        t.is(event.detail.type, "bishop");
    }, { once: true });

    t.context.board.move([0, 6], [0, 4]);
    t.context.board.move([0, 7], [0, 5]);
    t.context.board.move([0, 1], [0, 6]);
    t.context.move([0, 6], [0, 7]);
    t.is(t.context.state.currentTurn, "white");

    const piece = t.context.board.get([0, 7]);
    t.context.promote("bishop");
    t.is(t.context.state.currentTurn, "black");
    t.is(t.context.state.promoting, undefined);
    t.deepEqual(t.context.board.get([0, 7]), { ...piece, type: "bishop" });
});

test("promote updates in check when piece directly checks opponent king", t => {
    t.context.board.remove([3, 7]);
    t.context.board.remove([1, 6]);
    t.context.board.move([0, 1], [1, 6]);
    t.context.move([1, 6], [2, 7]);
    t.is(t.context.state.inCheck, undefined);

    t.context.promote("rook");
    t.is(t.context.state.inCheck, "black");
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

test.serial("squareselected event is ignored when it is not player's turn", t => {
    t.context.move([4, 1], [4, 2]);
    t.not(t.context.state.currentTurn, t.context.state.player);

    const detail: SquareSelectedEvent = { pos: [2, 7] };
    dispatcher.dispatchEvent(new CustomEvent("squareselected", { detail }));
    t.is(t.context.state.selectedSquare, undefined);
});
