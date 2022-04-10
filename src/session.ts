import { Coord, coordsEqual } from "./board.js";
import dispatcher from "./dispatcher.js";
import Game from "./game.js";
import { Colour, PieceType } from "./piece.js";

export default class Session {
    #channel: RTCDataChannel;

    #game: Game;
    get game(): Readonly<Game> {
        return this.#game;
    }

    constructor(channel: RTCDataChannel, player: Colour) {
        this.#channel = channel;
        this.#game = new Game(player);

        this.#channel.addEventListener("open", () => console.info("Session established"))
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

    #onMessage(event: MessageEvent): void {
        const message: Message = JSON.parse(event.data);
        console.log(`${this.#game.state.player}: received message`, new Date().toISOString(), message);

        switch (message.type) {
            case "move":
                if (message.moveCount > this.#game.state.moveCount) {
                    this.#game.move(message.from, message.to);
                }
                break;

            case "promote":
                if (coordsEqual(this.#game.state.promotingPawn, message.pos)) {
                    this.#game.promotePawn(message.to);
                }
                break;

            default:
                console.error("Invalid message type", message);
                break;
        }
    }

    #sendMessage(message: Message): void {
        console.log(`${this.#game.state.player}: sending message`, new Date().toISOString(), message);
        this.#channel.send(JSON.stringify(message));
    }
}

export type Message =
    | { type: "move", from: Coord, to: Coord, moveCount: number }
    | { type: "promote", pos: Coord, to: PieceType };
