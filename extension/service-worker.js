let socket = null;

const SERVER_URL = "ws://127.0.0.1:8765";

let keepAliveInterval = null;


function connectToServer() {

    if (
        socket &&
        (
            socket.readyState === WebSocket.OPEN ||
            socket.readyState === WebSocket.CONNECTING
        )
    ) {
        console.log("[ChatBridge SW] Already connected.");
        return;
    }

    console.log("[ChatBridge SW] Connecting to Node...");

    socket = new WebSocket(SERVER_URL);


    socket.addEventListener("open", () => {

        console.log("[ChatBridge SW] Connected to Node.");

        socket.send(JSON.stringify({
            type: "extension_connected"
        }));

        startKeepAlive();
    });


    socket.addEventListener("message", async (event) => {

        console.log(
            "[ChatBridge SW] Message from Node:",
            event.data
        );

        let message;

        try {
            message = JSON.parse(event.data);
        } catch {
            console.error(
                "[ChatBridge SW] Invalid JSON from Node."
            );
            return;
        }


        if (message.type === "chat_response") {

            const tabId = message.tabId;

            if (!tabId) {
                console.error(
                    "[ChatBridge SW] No tabId in response."
                );
                return;
            }

            chrome.tabs.sendMessage(tabId, {
                type: "SEND_CHAT_MESSAGE",
                text: message.text
            });
        }
    });


    socket.addEventListener("close", () => {

        console.log(
            "[ChatBridge SW] Connection closed."
        );

        socket = null;
    });


    socket.addEventListener("error", (error) => {

        console.error(
            "[ChatBridge SW] WebSocket error:",
            error
        );
    });
}


function startKeepAlive() {

    if (keepAliveInterval) {
        return;
    }

    keepAliveInterval = setInterval(() => {

        if (
            socket &&
            socket.readyState === WebSocket.OPEN
        ) {
            socket.send(JSON.stringify({
                type: "keepalive"
            }));
        }

    }, 20000);
}


chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {

        if (message.type === "START_BRIDGE") {

            connectToServer();

            sendResponse({
                success: true,
                message: "Bridge starting..."
            });

            return true;
        }


        if (message.type === "CHAT_MESSAGE") {

            if (
                !socket ||
                socket.readyState !== WebSocket.OPEN
            ) {
                console.error(
                    "[ChatBridge SW] Not connected to Node."
                );

                return;
            }


            socket.send(JSON.stringify({

                type: "chat_message",

                tabId: sender.tab?.id,

                conversationId:
                    message.conversationId,

                messageId:
                    message.messageId,

                text:
                    message.text
            }));
        }
    }
);