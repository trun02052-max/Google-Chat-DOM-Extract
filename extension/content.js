console.log("[ChatBridge] Extension loaded.");

let bridgeActive = false;

let knownMessages = new Set();

let scanInterval = null;


function getGroupIds() {

    return [
        ...new Set(
            [...document.querySelectorAll(
                "[data-group-synthetic-id]"
            )]
                .map(el =>
                    el.getAttribute(
                        "data-group-synthetic-id"
                    )
                )
                .filter(Boolean)
        )
    ];
}


function getMessages() {

    return [
        ...document.querySelectorAll(
            '[jsname="bgckF"]'
        )
    ]
        .filter(el => el.textContent.trim())
        .map(el => ({
            id: el.id,
            text: el.textContent.trim()
        }));
}


function getParticipantNames() {

    const names = [
        ...document.querySelectorAll(
            "span.njhDLd.O5OMdc"
        )
    ]
        .map(el => el.textContent.trim())
        .filter(Boolean);

    const counts = {};

    for (const name of names) {
        counts[name] = (counts[name] || 0) + 1;
    }

    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({
            name,
            count
        }));
}


function getConversationId() {

    const groups = getGroupIds();

    return groups.find(
        id =>
            id.startsWith("dm/") ||
            id.startsWith("space/")
    ) || null;
}


function getChatSnapshot() {

    return {
        url: location.href,
        groups: getGroupIds(),
        participants: getParticipantNames(),
        messages: getMessages()
    };
}


function scanForNewMessages() {

    if (!bridgeActive) {
        return;
    }

    const messages = getMessages();

    const conversationId = getConversationId();

    if (!conversationId) {
        return;
    }


    for (const message of messages) {

        if (knownMessages.has(message.id)) {
            continue;
        }

        knownMessages.add(message.id);

        console.log(
            "[ChatBridge] New message:",
            message
        );


        if (
            message.text
                .toLowerCase()
                .includes("#bot")
        ) {

            console.log(
                "[ChatBridge] #Bot detected!"
            );


            chrome.runtime.sendMessage({

                type: "CHAT_MESSAGE",

                conversationId:
                    conversationId,

                messageId:
                    message.id,

                text:
                    message.text
            });
        }
        if (
            message.text
                .toLowerCase()
                .includes("#geek1")
        ) {

            console.log(
                "[ChatBridge] #geek1 detected!"
            );


            chrome.runtime.sendMessage({

                type: "CHAT_MESSAGE",

                conversationId:
                    conversationId,

                messageId:
                    message.id,

                text:
                    message.text
            });
        }
        if (
            message.text
                .toLowerCase()
                .includes("!spam")
        ) {

            console.log(
                "[ChatBridge] #geek1 detected!"
            );


            chrome.runtime.sendMessage({

                type: "CHAT_MESSAGE",

                conversationId:
                    conversationId,

                messageId:
                    message.id,

                text:
                    message.text
            });
        }
    }
}


function startBridge() {

    if (bridgeActive) {
        console.log(
            "[ChatBridge] Already active."
        );
        return;
    }

    bridgeActive = true;

    console.log(
        "[ChatBridge] Bridge activated."
    );


    // Existing messages are not new messages.
    for (const message of getMessages()) {
        knownMessages.add(message.id);
    }


    scanInterval = setInterval(
        scanForNewMessages,
        1000
    );
}


function sendChatMessage(text) {

    const composer = document.querySelector(
        '[contenteditable="true"]'
    );

    if (!composer) {
        console.error(
            "[ChatBridge] Composer not found."
        );
        return;
    }

    console.log(
        "[ChatBridge] Sending:",
        text
    );

    composer.focus();

    composer.textContent = text;

    composer.dispatchEvent(
        new InputEvent("input", {
            bubbles: true,
            inputType: "insertText",
            data: text
        })
    );

    composer.dispatchEvent(
        new KeyboardEvent("keydown", {
            key: "Enter",
            code: "Enter",
            keyCode: 13,
            which: 13,
            bubbles: true,
            cancelable: true
        })
    );
}


chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {

        if (message.type === "START_BRIDGE") {

            startBridge();

            sendResponse({
                success: true,
                message: "Bridge activated!"
            });

            return true;
        }


        if (message.type === "SEND_CHAT_MESSAGE") {

            sendChatMessage(message.text);

            return;
        }
    }
);