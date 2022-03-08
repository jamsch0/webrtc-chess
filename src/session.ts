import { Coord } from "./board.js";
import Game from "./game.js";
import { Colour } from "./piece.js";

const CONNECTION_CONFIG: RTCConfiguration = {
    iceServers: [
        { urls: "stun:stun.stunprotocol.org" },
    ],
};

export default class Session {
    #channel: RTCDataChannel;

    #game: Game = new Game();
    get game(): Readonly<Game> {
        return this.#game;
    }

    #player: Colour;
    get player() {
        return this.#player;
    }

    constructor(channel: RTCDataChannel, player: Colour) {
        this.#channel = channel;
        this.#player = player;

        this.#addChannelEventListeners();
    }

    #addChannelEventListeners(): void {
        this.#channel.addEventListener("open", () => console.info("Session established"))
        this.#channel.addEventListener("close", () => console.info("Session terminated"));
        this.#channel.addEventListener("message", event => this.#onMessage(event));
    }

    #onMessage(event: MessageEvent): void {
        const message: Message = JSON.parse(event.data);

        switch (message.type) {
            case MessageType.MOVE:
                const move = message as MoveMessage;
                this.#game.move(move.from, move.to);
                break;

            default:
                console.error("Invalid message type", message);
                break;
        }
    }

    #sendMessage(message: Message): void {
        this.#channel.send(JSON.stringify(message));
    }
}

export type MessageType = "move";

export const MessageType: { [k: string]: MessageType } = {
    MOVE: "move",
};

export interface Message {
    readonly type: MessageType;
}

export interface MoveMessage extends Message {
    readonly type: "move";
    readonly from: Coord;
    readonly to: Coord;
}
