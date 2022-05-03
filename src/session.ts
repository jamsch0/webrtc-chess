import { Coord, coordsEqual } from "./board.js";
import dispatcher from "./dispatcher.js";
import Game from "./game.js";
import { Colour, PieceType } from "./piece.js";

const GAME_STATE_STORAGE_KEY: string = "gamestate";

export interface SessionEstablishedEvent {
    readonly session: Session;
}

declare global {
    interface DispatcherEventMap {
        "sessionestablished": SessionEstablishedEvent;
    }
}

export default class Session {
    #channel: RTCDataChannel;

    #game: Game;
    get game(): Readonly<Game> {
        return this.#game;
    }

    constructor(channel: RTCDataChannel, player: Colour) {
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

    async #onChannelOpen(): Promise<void> {
        console.info("Session initiated");

        const digest = await this.#loadGameState();
        this.#sendMessage({ type: "state", digest });
    }

    async #onMessage(event: MessageEvent): Promise<void> {
        const message: Message = JSON.parse(event.data);
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
                const detail: SessionEstablishedEvent = { session: this };
                dispatcher.dispatchEvent(new CustomEvent("sessionestablished", { detail }));
                return;

            default:
                console.error("Invalid message type", message);
                return;
        }

        this.#saveGameState();
    }

    #sendMessage(message: Message): void {
        console.log(`${this.#game.state.player}: sending message`, new Date().toISOString(), message);
        this.#channel.send(JSON.stringify(message));
    }

    async #loadGameState(): Promise<string> {
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

    #saveGameState(): void {
        const state = this.#game.toJSON();
        localStorage.setItem(GAME_STATE_STORAGE_KEY, state);
    }

    #resetGameState(): void {
        localStorage.removeItem(GAME_STATE_STORAGE_KEY);
        this.#game = new Game(this.#game.state.player);
    }
}

export type Message =
    | { type: "move", from: Coord, to: Coord, moveCount: number }
    | { type: "promote", pos: Coord, to: PieceType }
    | { type: "state", digest: string };
