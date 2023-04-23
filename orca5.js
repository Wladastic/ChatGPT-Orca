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
    const activeInstances = [instances.INITIATOR];

    const keyword = "AI-Collab((";

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

    async function sendMessage(message, sender) {
        await waitForMessageInput();
        const messageInput = document.querySelector('textarea[placeholder="Send a message..."]');
        messageInput.value = sender + ": " + message;

        // Trigger the 'input' event
        const inputEvent = new Event('input', { bubbles: true });
        messageInput.dispatchEvent(inputEvent);

        await waitForSendButton();

        const sendButton = document.querySelector('svg.h-4.w-4.mr-1');
        dispatchClick(sendButton);
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
                await sendMessage(instances.INITIATOR.introduction, "INITIATOR");
            } else {
                await sendMessage("I just got restarted, if I didn't execute something, please tell me again.", "INITIATOR");
            }
        } catch (e) {
            console.error(`Could not find instance with name ${instance1}.`);
            console.log('asking user if they want to create the instance...');
            const shouldCreateInstance = confirm(`The code wants to create an instance with name ${instance1}. Would you like to create a new instance?`);
            if (shouldCreateInstance) {
                const introductionMessage = instances.INITIATOR.introduction;
                await createInstance("INITIATOR", instance1, introductionMessage);
            } else {
                throw new Error(`Could not find instance with name ${instance1}`);
            }
        }
        console.log('Finished initializing, waiting for first response to finish.');
        await new Promise(resolve => setTimeout(resolve, 2000));
        await waitForSendButton();
        console.log('Finished waiting for first response to finish.');
    }

    // ... (rest of the code)
})();

