import test from "ava";
import { Colour } from "./piece.js";
import Session, { MessageType } from "./session.js";

/** @typedef {import("./session.js").MoveMessage} MoveMessage */

class MockDataChannel {
    /** @type {EventListener | undefined} */
    #listener;

    /**
     * @param {string} type
     * @param {EventListener} listener
     * @returns {void}
     */
    addEventListener(type, listener) {
        if (type === "message") {
            this.#listener = listener;
        }
    }

    /**
     * @param {any} data
     * @returns {void}
     */
    send(data) {
        const event = new MessageEvent("message", { data });
        this.#listener?.call(this, event);
    }
}

/** @returns {RTCDataChannel} */
function createDataChannel() {
    return /** @type {any} */ (new MockDataChannel());
}

test("move message", t => {
    const channel = createDataChannel();
    const session = new Session(channel, Colour.WHITE);

    /** @type {MoveMessage} */
    const message = {
        type: MessageType.MOVE,
        from: [0, 1],
        to: [0, 2],
    };

    const piece = session.game.board.get(message.from);

    channel.send(JSON.stringify(message));

    t.is(session.game.board.get(message.to), piece);
    t.is(session.game.board.get(message.from), undefined);
});
