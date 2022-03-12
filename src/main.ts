import Session from "./session.js";
import Display from "./display.js";

const connection = new RTCPeerConnection();
const display = new Display();

(globalThis as any).hostGame = async () => {
    const channel = connection.createDataChannel("messages");
    const session = new Session(channel, "white");
    (globalThis as any).session = session;
    display.render(session.game.board);

    connection.addEventListener("icecandidate", event => {
        if (!event.candidate) {
            console.log("offer:", btoa(JSON.stringify(connection.localDescription)));
        }
    });

    connection.addEventListener("connectionstatechange", () => {
        if (connection.connectionState === "connected") {
            console.log("connected");
        }
    });

    const offer = await connection.createOffer();
    await connection.setLocalDescription(offer);
};

(globalThis as any).joinGame = async (offer: string) => {
    connection.addEventListener("datachannel", event => {
        const session = new Session(event.channel, "black");
        (globalThis as any).session = session;
        display.render(session.game.board);
    }, { once: true });

    connection.addEventListener("icecandidate", event => {
        if (!event.candidate) {
            console.log("answer:", btoa(JSON.stringify(connection.localDescription)));
        }
    });

    connection.addEventListener("connectionstatechange", () => {
        if (connection.connectionState === "connected") {
            console.log("connected");
        }
    });

    await connection.setRemoteDescription(JSON.parse(atob(offer)));
    const answer = await connection.createAnswer();
    await connection.setLocalDescription(answer);
};

(globalThis as any).acceptPeer = async (answer: string) => {
    await connection.setRemoteDescription(JSON.parse(atob(answer)));
};
