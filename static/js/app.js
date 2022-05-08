function uid() {
    return (performance.now().toString(36) + Math.random().toString(36)).replace(/\./g, "");
}

function createToastAlert(parentElement, alertBadgeText, alertTitle, alertMessage) {
    /* Create base toast div */
    let toastAlert = document.createElement("div");
    toastAlert.classList.add("toast");
    toastAlert.classList.add("show");
    toastAlert.setAttribute("role", "alert");
    let id_attr = uid();
    toastAlert.setAttribute("id", id_attr);
    toastAlert.setAttribute("aria-live", "assertive");
    toastAlert.setAttribute("data-bs-animation", "true");
    toastAlert.setAttribute("aria-atomic", "true");

    /* Create toast header element */
    let toastHeader = document.createElement("div");
    toastHeader.classList.add("toast-header");

    /* Create badge for toast header */
    let toastHeaderBadge = document.createElement("span");
    toastHeaderBadge.classList.add("badge");
    toastHeaderBadge.classList.add("bg-purple-lt");
    let badgeText = document.createTextNode(alertBadgeText);
    toastHeaderBadge.appendChild(badgeText);
    toastHeader.appendChild(toastHeaderBadge);

    /* Create text for toast header */
    let toastHeaderText = document.createElement("strong");
    toastHeaderText.classList.add("me-auto");
    let toastHeaderTextContent = document.createTextNode(alertTitle);
    toastHeaderText.appendChild(toastHeaderTextContent);
    toastHeader.appendChild(toastHeaderText);

    /* Create text for toast header */
    let toastCloseButton = document.createElement("button");
    toastCloseButton.classList.add("ms-2");
    toastCloseButton.classList.add("btn-close");
    toastCloseButton.setAttribute("type", "button");
    toastCloseButton.setAttribute("data-bs-dismiss", "toast");
    toastCloseButton.setAttribute("aria-label", "Close");
    toastHeader.appendChild(toastCloseButton);
    toastAlert.appendChild(toastHeader);

    /* Create toast body element */
    let toastBody = document.createElement("div");
    toastBody.classList.add("toast-body");
    let toastBodyContent = document.createTextNode(alertMessage);
    toastBody.appendChild(toastBodyContent);
    toastAlert.appendChild(toastBody);

    parentElement.appendChild(toastAlert);

    function hideToast(toastId) {
        const toastElement = document.getElementById(toastId);
        toastElement.classList.remove("show");
    }

    function removeToast(toastId) {
        const toastElement = document.getElementById(toastId);
        toastElement.remove();
    }

    const toastHideTimeout = setTimeout(hideToast, 3000, id_attr);
    const toastDestroyTimeout = setTimeout(removeToast, 4000, id_attr);
}

const alertContainer = document.getElementById("alertContainer");

function writeToConsole(consoleText, userInput = false) {
    const consoleOut = document.getElementById("journalctlConsoleOutput");
    let outLine = document.createElement("li");
    outLine.classList.add("console-text");
    if (userInput) {
        outLine.classList.add("user-input");
    }

    const consoleTextInner = document.createTextNode(consoleText);
    outLine.appendChild(consoleTextInner);
    consoleOut.prepend(outLine);
}

let wsClient;

function connectToWS() {
    const endpoint = document.getElementById("endpoint").value;
    if (wsClient !== undefined) {
        wsClient.close();
    }
    wsClient = new WebSocket(endpoint);

    wsClient.onmessage = function (event) {
        let msgSize;
        if (event.data.size === undefined) {
            msgSize = event.data.length;
        } else {
            msgSize = event.data.size;
        }
        let payload = JSON.parse(event.data);
        console.log("onmessage. size: " + msgSize + ", content: " + event.data);
        writeToConsole(payload.message);
    };

    wsClient.onopen = function (evt) {
        console.log("WS connection established");
        createToastAlert(alertContainer, "WS", "connection", "WS connection established");
        const conIndicator = document.getElementById("connectionIndicator");
        conIndicator.classList.remove("status-red");
        conIndicator.classList.add("status-green");
        const connectedTo = document.getElementById("idConnectedTo");
        connectedTo.innerHTML = "Connected";
        let payload = document.getElementById("journalctlUnit").value;
        writeToConsole('WS connection established');
        sendMsg();
    };

    wsClient.onclose = function (evt) {
        console.log("WS connection closed");
        const conIndicator = document.getElementById("connectionIndicator");
        conIndicator.classList.remove("status-green");
        conIndicator.classList.add("status-red");
        const connectedTo = document.getElementById("idConnectedTo");
        connectedTo.innerHTML = "Not connected";

        connectToWS();
    };

    wsClient.onerror = function (evt) {
        console.log("Error!");
    };
}

function sendMsg() {
    let payload = document.getElementById("journalctlUnit").value;
    writeToConsole(`journalctl -u ${payload} -f`, true);
    const delayInMilliseconds = 1000; //1 second
    setTimeout(function () {
        wsClient.send(JSON.stringify({
            name: payload, type: "journalctl",
        }));
    }, delayInMilliseconds);
}

function closeConn() {
    wsClient.close();
}
