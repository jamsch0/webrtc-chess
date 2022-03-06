import Game from "./game.js";

/** @typedef {import("./board.js").Coord} Coord */
/** @typedef {import("./piece.js").Colour} Colour */

/** @type {RTCConfiguration} */
const CONNECTION_CONFIG = {
    iceServers: [
        { urls: "stun:stun.stunprotocol.org" },
    ],
};

export default class Session {
    /** @type {RTCDataChannel} */
    #channel;

    /** @type {Game}  */
    #game = new Game();

    /** @type {Readonly<Game>} */
    get game() {
        return this.#game;
    }

    /** @type {Colour} */
    #player;

    /** @type {Colour} */
    get player() {
        return this.#player;
    }

    /**
     * @param {RTCDataChannel} channel
     * @param {Colour} player
     */
    constructor(channel, player) {
        this.#channel = channel;
        this.#player = player;

        this.#addChannelEventListeners();
    }

    /** @returns {void} */
    #addChannelEventListeners() {
        this.#channel.addEventListener("open", () => console.info("Session established"))
        this.#channel.addEventListener("close", () => console.info("Session terminated"));
        this.#channel.addEventListener("message", event => this.#onMessage(event));
    }

    /**
     * @param {MessageEvent} event
     * @returns {void}
     */
    #onMessage(event) {
        /** @type {Message} */
        const message = JSON.parse(event.data);

        switch (message.type) {
            case MessageType.MOVE:
                const move = /** @type {MoveMessage} */ (message);
                this.#game.move(move.from, move.to);
                break;

            default:
                console.error("Invalid message type", message);
                break;
        }
    }

    /**
     * @param {Message} message
     * @returns {void}
     */
    #sendMessage(message) {
        this.#channel.send(JSON.stringify(message));
    }
}

/** @typedef {"move"} MessageType */

export const MessageType = {
    /** @readonly @type {MessageType} */
    MOVE: "move",
};

/**
 * @typedef {Object} Message
 * @property {MessageType} type
 */

/**
 * @typedef {Object} MoveMessage
 * @property {"move"} type
 * @property {Coord} from
 * @property {Coord} to
 */
