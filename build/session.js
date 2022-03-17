import dispatcher from "./dispatcher.js";
import Game from "./game.js";
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
        this.#channel.addEventListener("open", () => console.info("Session established"));
        this.#channel.addEventListener("close", () => console.info("Session terminated"));
        this.#channel.addEventListener("message", event => this.#onMessage(event));
        dispatcher.addEventListener("piecemoved", event => {
            const { from, to, moveCount } = event.detail;
            this.#sendMessage({ type: "move", from, to, moveCount });
        });
    }
    #onMessage(event) {
        const message = JSON.parse(event.data);
        console.log(`${this.#player}: received message`, new Date().toISOString(), message);
        switch (message.type) {
            case "move":
                if (message.moveCount > this.#game.state.moveCount) {
                    this.#game.move(message.from, message.to);
                }
                break;
            default:
                console.error("Invalid message type", message);
                break;
        }
    }
    #sendMessage(message) {
        console.log(`${this.#player}: sending message`, new Date().toISOString(), message);
        this.#channel.send(JSON.stringify(message));
    }
}
