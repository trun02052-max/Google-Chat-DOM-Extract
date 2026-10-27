const WebSocket = require("ws");
const dotenv = require("dotenv")
const { GoogleGenAI } = require("@google/genai");
const PORT = 8765;

const server = new WebSocket.Server({
    port: PORT
});

dotenv.config();

// The SDK automatically grabs process.env.GEMINI_API_KEY if left empty
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generateAIResponse(query) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: query,
    });

    // Output the generated text response
    console.log("AI Response:\n", response.text);
    return response.text
  } catch (error) {
    console.error("Error generating content:", error);
    return "Error generating content. Model is likely unavailable right now"
  }
}


console.log(
    `ChatBridge server listening on ws://127.0.0.1:${PORT}`
);


server.on("connection", (socket) => {

    console.log(
        "[Node] Extension connected."
    );


    socket.on("message", (raw) => {

        let message;

        try {
            message = JSON.parse(
                raw.toString()
            );
        } catch {

            console.error(
                "[Node] Invalid JSON."
            );

            return;
        }


        console.log(
            "[Node] Received:",
            message
        );


        if (message.type === "keepalive") {
            return;
        }


        if (message.type === "extension_connected") {

            socket.send(JSON.stringify({
                type: "server_connected"
            }));

            return;
        }


        if (message.type === "chat_message") {

            console.log(
                "[Node] Chat message:",
                message.text
            );


            if (
                message.text
                    .toLowerCase()
                    .includes("#bot")
            ) {

                socket.send(JSON.stringify({

                    type: "chat_response",

                    tabId:
                        message.tabId,

                    conversationId:
                        message.conversationId,

                    text:
                        "Hello."
                }));
            }
            if(message.text.toLowerCase().includes("#geek1")) {
                    generateAIResponse(message.text.replace("#geek1", "")).then((aiText) => {
                    socket.send(JSON.stringify({
                    type: "chat_response",
                    tabId: message.tabId,
                    conversationId: message.conversationId,
                    text: aiText
                }));
            });
            
        }
        if (
                message.text
                    .toLowerCase()
                    .includes("!spam")
            ) {

                //const inputString = "!comd 40 [some text]";
                var inputString = message.text

                // Regex explanation:
                // ^!([a-zA-Z]+) -> Matches '!' at the start, then captures the command letters (Group 1)
                // \s+           -> Matches one or more spaces
                // (\d+)         -> Captures one or more digits for the number (Group 2)
                // \s+\[(.*?)\]  -> Matches spaces and extracts everything inside the square brackets (Group 3)
                const regex = /^!([\p{Emoji}a-zA-Z]+)\s+(\d+)\s+\[(.*?)\]$/u;

                const match = inputString.match(regex);

                console.log(inputString)
                console.log(match)

                if (match) {
                    const command = match[1]; // "comd"
                    const number = parseInt(match[2], 10); // 40 (as an integer)
                    const text = match[3]; // "some text"

                    console.log("Command:", command);
                    console.log("Number:", number);
                    console.log("Text:", text);

                    var spamtext = ""

                    for (let index = 0; index < number; index++) {
                        spamtext += text
                    }

                     socket.send(JSON.stringify({

                        type: "chat_response",

                        tabId:
                            message.tabId,

                        conversationId:
                            message.conversationId,

                        text:
                            spamtext
                    }));
                } else {
                    console.log("The string format does not match.");
                }

            }
        }
    });


    socket.on("close", () => {

        console.log(
            "[Node] Extension disconnected."
        );
    });
});