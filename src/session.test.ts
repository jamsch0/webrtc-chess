import test from "ava";
import { Colour } from "./piece.js";
import Session, { MessageType, MoveMessage } from "./session.js";

class MockDataChannel {
    #listener: EventListener | undefined;

    addEventListener(type: string, listener: EventListener): void {
        if (type === "message") {
            this.#listener = listener;
        }
    }

    send(data: any): void {
        const event = new MessageEvent("message", { data });
        this.#listener?.call(this, event);
    }
}

function createDataChannel(): RTCDataChannel {
    return new MockDataChannel() as any;
}

test("move message", t => {
    const channel = createDataChannel();
    const session = new Session(channel, Colour.WHITE);

    const message: MoveMessage = {
        type: MessageType.MOVE,
        from: [0, 1],
        to: [0, 2],
    };

    const piece = session.game.board.get(message.from);

    channel.send(JSON.stringify(message));

    t.is(session.game.board.get(message.to), piece);
    t.is(session.game.board.get(message.from), undefined);
});
