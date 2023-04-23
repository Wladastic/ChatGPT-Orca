// Utility functions
function getMessages() {
    return document.getElementsByClassName("markdown prose w-full break-words dark:prose-invert dark");
}

function getMessageInput() {
    return document.querySelector('textarea[placeholder="Send a message..."]');
}

function getSendButton() {
    return document.querySelector('svg.h-4.w-4.mr-1');
}

function createNewInstance() {
    document.querySelector('a').click();
}

async function waitForAIResponse() {
    return new Promise((resolve) => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === "attributes" && mutation.attributeName === "disabled") {
                    resolve();
                    observer.disconnect();
                }
            });
        });

        observer.observe(getSendButton(), { attributes: true });
    });
}

// Chatbot Controller Class
class ChatbotController {
    constructor() {
        this.instances = [];
    }

    createNewInstance() {
        createNewInstance();
        this.instances.push(new ChatbotInstance(this.instances.length));
    }

    async sendMessage(instanceId, message) {
        if (this.instances[instanceId]) {
            await this.instances[instanceId].sendMessage(message);
        } else {
            console.error("Instance not found");
        }
    }
}

// Chatbot Instance Class
class ChatbotInstance {
    constructor(id) {
        this.id = id;
    }

    async sendMessage(message) {
        if (typeof message !== "string" || message.trim() === "") {
            console.error("Invalid message");
            return;
        }

        if (message.includes("\n")) {
            console.error("Multiple commands in a single message are not allowed");
            return;
        }

        getMessageInput().value = message;
        getSendButton().click();
        await waitForAIResponse();
        console.log(`Instance ${this.id} Response:`, getMessages()[getMessages().length - 1].innerText);
    }
}

// UI functions
function createUI() {
    const appContainer = document.createElement("div");
    appContainer.id = "chatbot-controller-ui";
    appContainer.style.position = "fixed";
    appContainer.style.top = "10px";
    appContainer.style.right = "10px";
    appContainer.style.backgroundColor = "white";
    appContainer.style.padding = "10px";
    appContainer.style.zIndex = "99999";
    appContainer.style.border = "1px solid black";
    appContainer.style.color = "black";
    appContainer.innerHTML = `
      <button id="close-ui" style="position: absolute; top: 0; right: 0; padding: 5px; font-weight: bold;">X</button>
      <h3 style="color: black;">Chatbot Controller</h3>
      <label for="instance-id" style="color: black;">Instance ID:</label>
      <input type="number" id="instance-id" min="0" style="width: 50px;"><br>
      <label for="message" style="color: black;">Message:</label>
      <input type="text" id="message" style="width: 250px;"><br>
      <button id="send-message">Send Message</button><br>
      <button id="create-instance">Create Instance</button>
    `;
    document.body.appendChild(appContainer);
}

function setupEventListeners(controller) {
    document.getElementById("send-message").addEventListener("click", async () => {
        const instanceId = parseInt(document.getElementById("instance-id").value);
        const message = document.getElementById("message").value;
        await controller.sendMessage(instanceId, message);
    });

    document.getElementById("create-instance").addEventListener("click", () => {
        controller.createNewInstance();
    });

    document.getElementById("close-ui").addEventListener("click", () => {
        document.getElementById("chatbot-controller-ui").remove();
    });
}

// Initialization
function init() {
    const chatbotController = new ChatbotController();
    createUI();
    setupEventListeners(chatbotController);
}

init();
