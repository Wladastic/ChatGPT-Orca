(async () => {
  const instance1 = 'COMMANDER';
  var currentInstance = 'COMMANDER';
  const keyword = 'AI-Collab((';

  function initiationMessage(currentInstance) {
    return 'Hello, you are' +
      currentInstance
      + '. I am an AI that would like to collaborate with you, '
      + 'my name is INITIATOR. I am setting you up with other Instances. '
      + ', start your message with "AI-Collab(instance to talk to):" followed by the message you want to send. '
      + 'For example, if you want to talk to me then say "AI-Collab((INITIATOR)):" followed by your message. '
      + 'I will respond to your message and you can respond to mine. '
      + 'If you want to talk to the user, then say "TO-USER:" followed by your message.'
      + 'You can say "CREATE-INSTANCE((Instancename)):" followed by the name of the instance you want to create. '
      + 'For example, if you want to create an instance called "COMMANDER" then say "CREATE-INSTANCE((COMMANDER)):" followed by the initial message.'
      + 'Now that you have the context, I would like to collaborate with you to create a new website featuring a simple 3D roleplaying game with a random terrain generator using Three.js. Please create instances and/or decide on the best approach to accomplish the task at hand, as I want to do no manual work. Here is a summary of what we discussed previously: we will use HTML, CSS, and JavaScript for the front-end, and a game engine such as Three.js for the game. We will include interactive objects, enemies, and obstacles in the game, and generate the terrain using a noise function. '
  }

  function dispatchClick(element) {
    const event = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    });
    element.dispatchEvent(event);
  }

  async function waitForSendButton() {
    while (document.querySelector('svg.h-4.w-4.mr-1') === null) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    await new Promise(resolve => setTimeout(resolve, 4000));
  }

  async function waitForMessageInput() {
    while (document.querySelector('textarea[placeholder="Send a message..."]') === null) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  async function waitForAIResponse(previousMessageCount) {
    let currentMessageCount;
    do {
      currentMessageCount = await getAllMessages().length;
      await new Promise(resolve => setTimeout(resolve, 100));
    } while (currentMessageCount === previousMessageCount);
  }

  async function createInstance(creatorName, introductionMessage) {
    await waitForSendButton();
    const createInstanceButton = document.querySelector('a');
    dispatchClick(createInstanceButton);

    await new Promise(resolve => setTimeout(resolve, 5000));

    await waitForMessageInput();
    sendMessage(introductionMessage, creatorName);

    // Trigger the 'input' event
    const inputEvent = new Event('input', { bubbles: true });
    instanceInput.dispatchEvent(inputEvent);

    await new Promise(resolve => setTimeout(resolve, 3000));
  }

  async function switchInstance(instanceName) {
    await waitForSendButton();
    const instanceElement = Array.from(document.querySelectorAll('a div')).find(el => el.textContent.includes(instanceName));
    if (instanceElement === undefined) {
      throw new Error(`Could not find instance with name ${instanceName}`);
    }
    instanceElement.click();
    await new Promise(resolve => setTimeout(resolve, 500));
    currentInstance = instanceName;
  }

  async function sendMessageTo(instance, otherInstance, message) {
    await switchInstance(otherInstance);
    await sendMessage(message, instance);
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

  async function initiateConversation() {
    try {
      await switchInstance(instance1);

      const previousMessageCount = await getAllMessages().length;
      if (previousMessageCount === 0) {
        await sendMessage(initiationMessage(instance1), "INITIATOR");
      } else {
        await sendMessage("I just got restarted, if I didn't execute something, please tell me again.", "INITIATOR");
      }
    } catch (e) {
      const shouldCreateInstance = confirm(`The code wants to create an instance with name ${instance1}. Would you like to create a new instance?`);
      if (shouldCreateInstance) {
        await createInstance("INITIATOR", initiationMessage(instance1));
      } else {
        throw new Error(`Could not find instance with name ${instance1}`);
      }
    }
  }

  async function shouldCommunicate(message) {
    console.log('Checking if should communicate...');
    const shouldCommunicate = message.startsWith(keyword);
    console.log(`Should communicate: ${shouldCommunicate}`);
    return shouldCommunicate;
  }

  async function getAllMessages() {
    const messages = Array.from(document.getElementsByClassName('markdown prose w-full break-words dark:prose-invert dark'));
    return messages;
  }

  async function start() {
    console.log('Starting conversation...');
    console.log('Waiting for 5 seconds...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    for (let i = 0; i < 5; i++) {
      const previousMessageCount = await getAllMessages().length;

      await waitForAIResponse(previousMessageCount);
      const lastResponse = await getLastResponse();

      if (await shouldCommunicate(lastResponse)) {
        const otherInstance = lastResponse.stringBetween('((', '))');
        console.log(`Other instance: ${otherInstance}`);
        const message = lastResponse.replace(keyword + otherInstance + ")):", '');
        await sendMessageTo(currentInstance, otherInstance, message);
      }

      if (lastResponse.startsWith("CREATE-INSTANCE:")) {
        const otherInstance = lastResponse.stringBetween('((', ')):');
        const shouldCreateInstance = confirm(`${currentInstance} wants to create an instance with name ${otherInstance}. Would you like to create a new instance?`);
        if (shouldCreateInstance) {
          const initialMessage = lastResponse.replace("CREATE-INSTANCE:((" + otherInstance + ")): ", '');
          await createInstance(currentInstance, initialMessage);
        } else {
          // Do something else if the user chooses not to create a new instance
          sendMessage("I declined to create a new instance.", "INITIATOR")
        }
      }

      const previousMessageCountInstance1 = getAllMessages().length;
      await waitForAIResponse(previousMessageCountInstance1);
      const instance2Response = await getLastResponse();

      if (await shouldCommunicate(instance2Response)) {
        await sendMessage(instance2Response.replace(keyword, ''));
      }
    }
  }

  console.log('Initiating conversation...');
  await initiateConversation();
  console.log('Conversation initiated!');

  console.log('Starting...');
  await start();

})();
