import Game from "./game.js";
const CONNECTION_CONFIG = {
    iceServers: [
        { urls: "stun:stun.stunprotocol.org" },
    ],
};
export default class Session {
    #channel;
    #game = new Game();
    get game() {
        return this.#game;
    }
    #player;
    get player() {
        return this.#player;
    }
    constructor(channel, player) {
        this.#channel = channel;
        this.#player = player;
        this.#addChannelEventListeners();
    }
    #addChannelEventListeners() {
        this.#channel.addEventListener("open", () => console.info("Session established"));
        this.#channel.addEventListener("close", () => console.info("Session terminated"));
        this.#channel.addEventListener("message", event => this.#onMessage(event));
    }
    #onMessage(event) {
        const message = JSON.parse(event.data);
        switch (message.type) {
            case MessageType.MOVE:
                const move = message;
                this.#game.move(move.from, move.to);
                break;
            default:
                console.error("Invalid message type", message);
                break;
        }
    }
    #sendMessage(message) {
        this.#channel.send(JSON.stringify(message));
    }
}
export const MessageType = {
    MOVE: "move",
};
