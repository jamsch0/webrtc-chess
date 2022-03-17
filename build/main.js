import Session from "./session.js";
import Display from "./display.js";
const connection = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.stunprotocol.org" }] });
const display = new Display();
globalThis.hostGame = async () => {
    const channel = connection.createDataChannel("messages");
    const session = new Session(channel, "white");
    globalThis.session = session;
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
globalThis.joinGame = async (offer) => {
    connection.addEventListener("datachannel", event => {
        const session = new Session(event.channel, "black");
        globalThis.session = session;
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
globalThis.acceptPeer = async (answer) => {
    await connection.setRemoteDescription(JSON.parse(atob(answer)));
};
