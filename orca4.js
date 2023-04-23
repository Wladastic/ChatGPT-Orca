(async () => {

    const instances = {
        INITIATOR: {
            name: "INITIATOR",
            introduction: "Hello, I am an AI that would like to collaborate with you. I am setting you up with other Instances. To start your message, type 'AI-Collab(instance to talk to):' followed by the message you want to send. For example, if you want to talk to me then say 'AI-Collab((INITIATOR)):' followed by your message. You can also say 'CREATE_INSTANCE((Instancename)):' followed by the initialization prompt of the instance you want to create, similar to this. Please remember to create only one instance at a time and wait for a response before creating another. NEVER send multiple commands in one message, if for example, you want to create more than one instance, only create one and wait for the response. Now that you have the context, I would like to collaborate with you to create a new website featuring a simple 3D roleplaying game with a random terrain generator using Three.js. Please create instances and/or decide on the best approach to accomplish the task at hand, as I want to do no manual work. Here is a summary of what we discussed previously: we will use HTML, CSS, and JavaScript for the front-end, and a game engine such as Three.js for the game. We will include interactive objects, enemies, and obstacles in the game, and generate the terrain using a noise function. Let's work together to make this project a success!",
            parent: null,
            children: []
        }
    };
    let currentInstance = instances.INITIATOR;
    const keyword = "AI-Collab((";

    function getElement(className) {
        return document.querySelector(className);
    }

    function getElementsByClass(className) {
        return Array.from(document.getElementsByClassName(className));
    }

    async function waitForElement(selector) {
        while (getElement(selector) === null) {
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
    }

    async function dispatchClick(element) {
        const event = new MouseEvent("click", { view: window, bubbles: true, cancelable: true });
        element.dispatchEvent(event);
    }

    async function getAllMessages() {
        const messages = Array.from(
            document.getElementsByClassName(
                "markdown prose w-full break-words dark:prose-invert dark"
            )
        );
        return messages;
    }

    function dispatchClick(element) {
        const event = new MouseEvent("click", {
            view: window,
            bubbles: true,
            cancelable: true
        });
        element.dispatchEvent(event);
    }

    async function waitForSendButton() {
        while (document.querySelector("svg.h-4.w-4.mr-1") === null) {
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
        await new Promise((resolve) => setTimeout(resolve, 4000));
    }

    async function waitForMessageInput() {
        while (document.querySelector('textarea[placeholder="Send a message..."]') === null) {
            await new Promise((resolve) => setTimeout(resolve, 100));
        }
    }

    async function waitForAIResponse(previousMessageCount) {
        console.log("Waiting for AI response. Previous message count: " + previousMessageCount + ".");
        let currentMessageCount;
        let maximumTimer = 0;
        do {
            currentMessageCount = (await getAllMessages()).length;
            console.log("Current message count: " + currentMessageCount + ". Waiting for extra message...");
            await new Promise((resolve) => setTimeout(resolve, 1000));
            maximumTimer++;
        } while (currentMessageCount === previousMessageCount && maximumTimer < 5);
        console.log("Finished waiting for AI response.");
        if (maximumTimer === 5) {
            console.error("AI did not respond in time. Something went wrong.");
        }
    }

    async function createInstance(creator, instanceName, introductionMessage) {
        await waitForSendButton();
        const createInstanceButton = document.querySelector("a");
        dispatchClick(createInstanceButton);

        await new Promise((resolve) => setTimeout(resolve, 5000));

        await waitForMessageInput();
        sendMessage(introductionMessage, creator);

        await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    async function switchInstance(instanceName) {
        await waitForSendButton();
        const instance = instances[instanceName];
        if (instance === undefined) {
            throw new Error(`Could not find instance with name ${instanceName}`);
        }
        const instanceElement = Array.from(document.querySelectorAll('a div')).find(el => el.textContent.includes(instanceName));
        if (instanceElement === undefined) {
            throw new Error(`Could not find instance with name ${instanceName}`);
        }
        instanceElement.click();
        await new Promise(resolve => setTimeout(resolve, 500));
        currentInstance = instanceName;
    }

    async function sendMessageTo(instanceName, message) {
        const instance = instances[instanceName];
        if (instance === undefined) {
            throw new Error(`Could not find instance with name ${instanceName}`);
        }
        await switchInstance(instanceName);
        await sendMessage(message, currentInstance);
    }
    function updateInstanceList() {
        const instanceListContainer = document.getElementById("instance-list");
        instanceListContainer.innerHTML = "";

        for (const instanceName in instances) {
            const instanceElement = document.createElement("div");
            instanceElement.classList.add("instance");
            instanceElement.textContent = `${instanceName}: ${instances[instanceName].status}`;
            instanceListContainer.appendChild(instanceElement);
        }
    }

    function addButtons() {
        const buttonContainer = document.getElementById("button-container");

        const createButton = document.createElement("button");
        createButton.textContent = "Create Instance";
        createButton.addEventListener("click", async () => {
            const newInstanceName = prompt("Enter the name for the new instance:");
            if (newInstanceName) {
                const introductionMessage = `Hello, I am instance ${newInstanceName}. Let's collaborate!`;
                await createInstance("INITIATOR", newInstanceName, introductionMessage);
                updateInstanceList();
            }
        });
        buttonContainer.appendChild(createButton);

        const switchButton = document.createElement("button");
        switchButton.textContent = "Switch Instance";
        switchButton.addEventListener("click", async () => {
            const targetInstanceName = prompt("Enter the name of the instance you want to switch to:");
            if (targetInstanceName) {
                await switchInstance(targetInstanceName);
            }
        });
        buttonContainer.appendChild(switchButton);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete Instance";
        deleteButton.addEventListener("click", () => {
            const instanceToDelete = prompt("Enter the name of the instance you want to delete:");
            if (instanceToDelete) {
                delete instances[instanceToDelete];
                updateInstanceList();
            }
        });
        buttonContainer.appendChild(deleteButton);

        const stopButton = document.createElement("button");
        stopButton.textContent = "Stop";
        stopButton.addEventListener("click", () => {
            isStopped = true;
        });
        buttonContainer.appendChild(stopButton);
    }

    function updateMessageLog(instanceName, message) {
        const messageLogContainer = document.getElementById("message-log");
        const messageElement = document.createElement("div");
        messageElement.classList.add("message");
        messageElement.textContent = `${instanceName}: ${message}`;
        messageLogContainer.appendChild(messageElement);
    }

    async function sendMessage(message, sender) {
        updateMessageLog(sender, message);
        await waitForElement('textarea[placeholder="Send a message..."]');
        const messageInput = getElement('textarea[placeholder="Send a message..."]');
        messageInput.value = sender + ": " + message;
        messageInput.dispatchEvent(new Event('input', { bubbles: true }));
        await waitForElement('svg.h-4.w-4.mr-1');
        dispatchClick(getElement('svg.h-4.w-4.mr-1'));
        await new Promise(resolve => setTimeout(resolve, 3000));
    }

    async function getLastResponse() {
        const messages = await getAllMessages();
        console.log(messages);
        const lastResponse = messages[messages.length - 1].innerText;
        return lastResponse;
    }

    async function shouldCommunicate(message) {
        console.log('Checking if should communicate...');
        const shouldCommunicate = message.startsWith(keyword);
        console.log(`Should communicate: ${shouldCommunicate}`);
        return shouldCommunicate;
    }


    async function initiateConversation() {
        const instance1 = "INITIATOR";
        try {
            await switchInstance(instance1);

            const previousMessageCount = (await getAllMessages()).length;
            if (previousMessageCount === 0) {
                await sendMessage("Hello, I am an AI that would like to collaborate with you. I am setting you up with other Instances.", "INITIATOR");
                await sendMessage("To start your message, type 'AI-Collab((instance to talk to)):' followed by the message you want to send. For example, if you want to talk to me then say 'AI-Collab((INITIATOR)):' followed by your message.", "INITIATOR");
                await sendMessage("Please create a new instance for Three.js with the following command: 'CREATE_INSTANCE((Three.js)): Hello, I am the Three.js Instance. I am a JavaScript library used for creating and animating 3D computer graphics in a web browser. I can help with creating and rendering the 3D game elements that we need for our project. How can I assist you?'", "INITIATOR");
            } else {
                await sendMessage("I just got restarted, if I didn't execute something, please tell me again.", "INITIATOR");
            }
        } catch (e) {
            console.error(`Could not find instance with name ${instance1}.`);
            const shouldCreateInstance = confirm(`The code wants to create an instance with name ${instance1}. Would you like to create a new instance?`);
            if (shouldCreateInstance) {
                const introductionMessage = instances.INITIATOR.introduction;
                await createInstance("INITIATOR", instance1, introductionMessage);
            } else {
                throw new Error(`Could not find instance with name ${instance1}`);
            }
        }
    }
    async function shouldCreateInstance(message) {
        console.log('Checking if should create instance...');
        const shouldCreateInstance = message.startsWith("CREATE_INSTANCE");
        console.log(`Should create instance: ${shouldCreateInstance}`);
        return shouldCreateInstance;
    }

    async function isValidResponse(message) {
        console.log('Checking if response is valid...');
        // Check if the message is a valid response, the command should only appear once in the message
        const commandCount = message.split(keyword).length - 1;
        const isValidResponse = commandCount <= 1;
        console.log(`Is valid response: ${isValidResponse}`);
        if (!isValidResponse) {
            throw new Error(`Invalid response! - Commands should only appear once in the message.
            Please refrain from using multiple commands in the same message.`);
        }
        return isValidResponse;
    }

    async function stringBetween(str, start, end) {
        const startIndex = await str.indexOf(start) + start.length;
        const endIndex = await str.indexOf(end);
        return await str.substring(startIndex, endIndex);
    }

    let isStopped = false;

    async function start() {
        // Add HTML elements for instance list, button container, and message log
        const instanceList = document.createElement("div");
        instanceList.id = "instance-list";
        document.body.appendChild(instanceList);

        const buttonContainer = document.createElement("div");
        buttonContainer.id = "button-container";
        document.body.appendChild(buttonContainer);

        const messageLog = document.createElement("div");
        messageLog.id = "message-log";
        document.body.appendChild(messageLog);

        addButtons();
        updateInstanceList();

        console.log('Starting conversation in 2 Seconds...');
        await new Promise(resolve => setTimeout(resolve, 2000));

        await initiateConversation();

        var previouseResponse = "";

        while (!isStopped) {
            console.log("beginning of loop");
            const lastResponse = await getLastResponse();

            await waitForAIResponse();

            if (previouseResponse === lastResponse) {
                console.log("same response, waiting 3 seconds and trying again");
                await new Promise(resolve => setTimeout(resolve, 3000));
                continue;
            }

            try {
                if (await isValidResponse(lastResponse)) {

                    if (await shouldCommunicate(lastResponse)) {
                        const otherInstance = await stringBetween(lastResponse, keyword, ")):");
                        console.log(`Other instance: ${otherInstance}`);
                        const message = lastResponse.replace(keyword + otherInstance + ")):", '');
                        await sendMessageTo(otherInstance, message);
                        continue;
                    }

                    if (await shouldCreateInstance(lastResponse)) {
                        const otherInstance = await stringBetween(lastResponse, "CREATE_INSTANCE:((", ")): ");

                        console.log(`Instance wants to create another instance: ${otherInstance}`);
                        console.log('asking user if they want to create the instance...');
                        const shouldCreateInstance = confirm(`${currentInstance} wants to create an instance with name ${otherInstance}. Would you like to create a new instance?`);
                        if (shouldCreateInstance) {
                            const initialMessage = lastResponse.replace("CREATE_INSTANCE:((" + otherInstance + ")): ", '');
                            await createInstance(currentInstance, otherInstance, initialMessage);
                        } else {
                            // Do something else if the user chooses not to create a new instance
                            sendMessage("I declined to create a new instance.", "INITIATOR");
                        }
                        continue;
                    }

                    console.log('No command found, waiting longer...');
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    continue;
                }
            } catch (e) {
                console.log('Invalid response, skipping...');
                sendMessage("Invalid response, please try again. ", e);
                await new Promise(resolve => setTimeout(resolve, 5000));
                continue;
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    start();
})();