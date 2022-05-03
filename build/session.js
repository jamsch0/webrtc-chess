import { coordsEqual } from "./board.js";
import dispatcher from "./dispatcher.js";
import Game from "./game.js";
const GAME_STATE_STORAGE_KEY = "gamestate";
export default class Session {
    #channel;
    #game;
    get game() {
        return this.#game;
    }
    constructor(channel, player) {
        this.#channel = channel;
        this.#game = new Game(player);
        this.#channel.addEventListener("open", () => this.#onChannelOpen());
        this.#channel.addEventListener("close", () => console.info("Session terminated"));
        this.#channel.addEventListener("message", event => this.#onMessage(event));
        dispatcher.addEventListener("piecemoved", event => {
            const { from, to, moveCount } = event.detail;
            this.#sendMessage({ type: "move", from, to, moveCount });
        });
        dispatcher.addEventListener("pawnpromoted", event => {
            const { pos, type: to } = event.detail;
            this.#sendMessage({ type: "promote", pos, to });
        });
    }
    async #onChannelOpen() {
        console.info("Session initiated");
        const digest = await this.#loadGameState();
        this.#sendMessage({ type: "state", digest });
    }
    async #onMessage(event) {
        const message = JSON.parse(event.data);
        console.log(`${this.#game.state.player}: received message`, new Date().toISOString(), message);
        switch (message.type) {
            case "move":
                if (message.moveCount > this.#game.state.moveCount) {
                    this.#game.move(message.from, message.to);
                }
                break;
            case "promote":
                if (coordsEqual(this.#game.state.promoting, message.pos)) {
                    this.#game.promote(message.to);
                }
                break;
            case "state":
                const digest = await this.#game.digest();
                if (digest !== message.digest) {
                    console.log("Resetting game state due to mismatch");
                    this.#resetGameState();
                }
                console.log("Session established");
                const detail = { session: this };
                dispatcher.dispatchEvent(new CustomEvent("sessionestablished", { detail }));
                return;
            default:
                console.error("Invalid message type", message);
                return;
        }
        this.#saveGameState();
    }
    #sendMessage(message) {
        console.log(`${this.#game.state.player}: sending message`, new Date().toISOString(), message);
        this.#channel.send(JSON.stringify(message));
    }
    async #loadGameState() {
        const state = localStorage.getItem(GAME_STATE_STORAGE_KEY);
        if (state !== null) {
            this.#game.load(state);
        }
        const digest = await this.#game.digest();
        if (state !== null) {
            console.log("Loaded game", digest);
        }
        return digest;
    }
    #saveGameState() {
        const state = this.#game.toJSON();
        localStorage.setItem(GAME_STATE_STORAGE_KEY, state);
    }
    #resetGameState() {
        localStorage.removeItem(GAME_STATE_STORAGE_KEY);
        this.#game = new Game(this.#game.state.player);
    }
}
