const startButton = document.getElementById("start");
const status = document.getElementById("status");

startButton.addEventListener("click", async () => {

    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    });

    if (!tab || !tab.id) {
        status.textContent = "No active tab.";
        return;
    }

    if (!tab.url.startsWith("https://chat.google.com/")) {
        status.textContent = "Open Google Chat first.";
        return;
    }

    try {

        // Tell the service worker to connect to Node.
        await chrome.runtime.sendMessage({
            type: "START_BRIDGE"
        });


        // Tell the Google Chat content script to start monitoring.
        const response = await chrome.tabs.sendMessage(
            tab.id,
            {
                type: "START_BRIDGE"
            }
        );


        status.textContent =
            response?.message || "Bridge activated!";

    } catch (error) {

        console.error(error);

        status.textContent =
            "Could not start ChatBridge.";
    }
});