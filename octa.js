(async () => {
    const instance1 = 'HustleGPT';
    const instance2 = 'DEVELOPERGPT';
    const introduction = 'I am an AI that would like to collaborate with you. To communicate with me, start your message with "AI-Collab:". ';
    const keyword = 'AI-Collab:';
  
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
    }
  
    async function waitForMessageInput() {
      while (document.querySelector('textarea[placeholder="Send a message..."]') === null) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  
    async function waitForAIResponse(previousMessageCount) {
      let currentMessageCount;
      do {
        currentMessageCount = document.querySelectorAll('.Message__content').length;
        await new Promise(resolve => setTimeout(resolve, 100));
      } while (currentMessageCount === previousMessageCount);
    }
  
    async function switchInstance(instanceName) {
      await waitForSendButton();
      const instanceElement = Array.from(document.querySelectorAll('a div')).find(el => el.textContent.includes(instanceName));
      instanceElement.click();
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  
    async function sendMessage(message) {
      await waitForMessageInput();
      const messageInput = document.querySelector('textarea[placeholder="Send a message..."]');
      messageInput.value = message;
  
      // Trigger the 'input' event
      const inputEvent = new Event('input', { bubbles: true });
      messageInput.dispatchEvent(inputEvent);
  
      await waitForSendButton();
      const sendButton = document.querySelector('svg.h-4.w-4.mr-1');
      dispatchClick(sendButton);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  
    async function getLastResponse() {
      const messages = Array.from(document.querySelectorAll('.Message__content'));
      const lastResponse = messages[messages.length - 1].innerText;
      return lastResponse;
    }
  
    async function initiateConversation() {
      await switchInstance(instance1);
      await sendMessage(introduction);
      await switchInstance(instance2);
      await sendMessage(introduction);
    }
  
    async function shouldCommunicate(message) {
      return message.startsWith(keyword);
    }
  
    await initiateConversation();
  
    for (let i = 0; i < 5; i++) {
      await switchInstance(instance2);
      const previousMessageCount = document.querySelectorAll('.Message__content').length;
      await waitForAIResponse(previousMessageCount);
      const lastResponse = await getLastResponse();
  
      if (await shouldCommunicate(lastResponse)) {
        await sendMessage(lastResponse.replace(keyword, ''));
      }
  
      await switchInstance(instance1);
      const previousMessageCountInstance1 = document.querySelectorAll('.Message__content').length;
      await waitForAIResponse(previousMessageCountInstance1);
      const instance2Response = await getLastResponse();
  
      if (await shouldCommunicate(instance2Response)) {
        await sendMessage(instance2Response.replace(keyword, ''));
      }
    }
  })();
  