import test from "ava";
import Session, { Message } from "./session.js";

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
    const session = new Session(channel, "white");

    const message: Message = {
        type: "move",
        from: [0, 1],
        to: [0, 2],
        moveCount: 1,
    };

    const piece = session.game.board.get(message.from);

    channel.send(JSON.stringify(message));

    t.is(session.game.board.get(message.to), piece);
    t.is(session.game.board.get(message.from), undefined);
});
