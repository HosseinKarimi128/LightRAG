(function () {
  // Read domain from global variable set by client
  const domain_name = window._lightragDomain || 'chatbot.hoka-ai.site';

  function getAPIEndpoint() {
    return `https://${domain_name}/query/stream`;
  }

  function renderMarkdown(text) {
    // Escape HTML for security
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

    // Handle ***bold italic***
    html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    // Handle **bold**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Handle *italic*
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Preserve line breaks
    html = html.replace(/\n/g, '<br>');

    return html;
  }

  function stripReferences(text) {
    // Remove everything from "### References" (case-insensitive)
    return text.split(/###\s*References/i)[0].trim();
  }

  const UI = {
    placeholder: "پیام خود را بنویسید...",
    send: "ارسال",
    title: " دستیار هوشمند ثروت‌افزا ",
    thinking: "در حال پاسخ‌دهی...",
    error: "❌ خطایی رخ داد. لطفاً دوباره تلاش کنید.",
    shortQuery: "پیام شما باید حداقل ۳ کاراکتر باشد."
  };

  let conversationHistory = [];
  let chatButton, chatModal, chatMessages, chatInput, sendButton, closeBtn;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWidget);
  } else {
    initWidget();
  }

  function initWidget() {
    createElements();
    bindEvents();
  }

  function createElements() {
    chatButton = document.createElement("div");
    chatButton.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
      </svg>
    `;
    chatButton.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 20px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #4F46E5;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.25);
      z-index: 10000;
    `;
    document.body.appendChild(chatButton);

    chatModal = document.createElement("div");
    chatModal.dir = "rtl";
    chatModal.lang = "fa";
    chatModal.style.cssText = `
      display: none;
      position: fixed;
      bottom: 90px;
      left: 20px;
      width: 360px;
      height: 550px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      flex-direction: column;
      z-index: 10001;
      font-family: 'Vazirmatn', 'IRANSans', Tahoma, sans-serif;
      direction: rtl;
    `;
    chatModal.innerHTML = `
      <div style="padding: 14px 16px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between;">
        <span style="font-weight: 600; color: #1e293b; font-size: 16px;">${UI.title}</span>
        <button id="close-chat" style="background: none; border: none; font-size: 24px; cursor: pointer; color: #64748b; line-height: 1;">×</button>
      </div>
      <div id="chat-messages" style="flex: 1; padding: 16px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px;"></div>
      <div style="padding: 12px; border-top: 1px solid #e2e8f0; display: flex; gap: 8px;">
        <input id="chat-input" type="text" placeholder="${UI.placeholder}" 
               style="flex: 1; padding: 10px 14px; border: 1px solid #cbd5e1; border-radius: 10px; outline: none; font-size: 14px; text-align: right;" />
        <button id="send-message" style="padding: 10px 16px; background: #4F46E5; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: 500;">${UI.send}</button>
      </div>
    `;
    document.body.appendChild(chatModal);

    chatMessages = chatModal.querySelector("#chat-messages");
    chatInput = chatModal.querySelector("#chat-input");
    sendButton = chatModal.querySelector("#send-message");
    closeBtn = chatModal.querySelector("#close-chat");
  }

  function bindEvents() {
    chatButton.addEventListener("click", () => {
      chatModal.style.display = "flex";
      chatInput.focus();
    });

    closeBtn.addEventListener("click", () => {
      chatModal.style.display = "none";
    });

    sendButton.addEventListener("click", handleSendMessage);
    chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    });
  }

  async function handleSendMessage() {
    const text = chatInput.value.trim();
    if (text.length < 3) {
      alert(UI.shortQuery);
      return;
    }

    chatInput.value = "";
    sendButton.disabled = true;

    const userMsg = document.createElement("div");
    userMsg.style.cssText = "padding: 10px 14px; border-radius: 12px; max-width: 85%; word-break: break-word; line-height: 1.5; font-size: 14px; background: #dbeafe; align-self: flex-start; margin-right: auto;";
    userMsg.textContent = text;
    chatMessages.appendChild(userMsg);
    conversationHistory.push({ role: "user", content: text });
    chatMessages.scrollTop = chatMessages.scrollHeight;

    const thinkingEl = document.createElement("div");
    thinkingEl.textContent = UI.thinking;
    thinkingEl.style.cssText = "background: #f1f5f9; padding: 10px 14px; border-radius: 12px; align-self: flex-end; margin-left: auto; font-style: italic;";
    chatMessages.appendChild(thinkingEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    try {
      const userPrompt = `
you are the serVat-afza assistantِ
You should never ever mention references.
You should speak fluent Persian without any error.
Do not ever say phrases like based on the given text or document.
Structure your answers in a clear and organized manner.
Use appropriate formatting and bullet points when necessary.
ِYou should not answer out of questions, and if user asked such question tell it what are you.
`;

      const payload = {
        query: text,
        mode: "local",
        response_type: "Multiple Paragraphs",
        top_k: 40,
        chunk_top_k: 20,
        max_entity_tokens: 6000,
        max_relation_tokens: 8000,
        max_total_tokens: 30000,
        only_need_context: false,
        only_need_prompt: false,
        stream: true,
        history_turns: 0,
        enable_rerank: true,
        conversation_history: conversationHistory,
        user_prompt: userPrompt
      };

      const response = await fetch(getAPIEndpoint(), {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          // ⚠️ SECURITY WARNING: API keys should NEVER be exposed in frontend code.
          // This is a placeholder. In production, use a backend proxy.
          "X-API-Key": "sk-1234567890" 
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      chatMessages.removeChild(thinkingEl);

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullResponse = "";
      let isFirst = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter(l => l.trim());

        for (const line of lines) {
          let parsed;
          try {
            parsed = JSON.parse(line);
          } catch (e) {
            console.warn("خط در پردازش خط:", line); // Just log JSON parse failures (malformed line)
            continue;
          }
          if (parsed.error) {
            const errDiv = document.createElement("div");
            errDiv.style.cssText = "background: #fee; padding: 10px 14px; border-radius: 12px; align-self: flex-end; margin-left: auto; color: #b00;";
            errDiv.textContent = "⚠️ " + parsed.error;
            chatMessages.appendChild(errDiv);
            // Now, immediately propagate to the outer try/catch.
            throw new Error(parsed.error);
          }
            if (parsed.response !== undefined) {
              if (isFirst) {
                const msg = document.createElement("div");
                msg.style.cssText = "padding: 10px 14px; border-radius: 12px; max-width: 85%; word-break: break-word; line-height: 1.5; font-size: 14px; background: #f1f5f9; align-self: flex-end; margin-left: auto;";
                chatMessages.appendChild(msg);
                isFirst = false;
              }

              fullResponse += parsed.response;
              const cleanText = stripReferences(fullResponse);
              const renderedHTML = renderMarkdown(cleanText);

              const lastMsg = chatMessages.lastChild;
              if (lastMsg) lastMsg.innerHTML = renderedHTML;
              chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        }
      }

      conversationHistory.push({ role: "assistant", content: stripReferences(fullResponse) });

    } catch (err) {
      console.error("خطا:", err);
      if (chatMessages.lastChild?.textContent === UI.thinking) {
        chatMessages.removeChild(chatMessages.lastChild);
      }
      const errDiv = document.createElement("div");
      errDiv.style.cssText = "background: #fee; padding: 10px 14px; border-radius: 12px; align-self: flex-end; margin-left: auto; color: #b00;";
      errDiv.textContent = UI.error;
      chatMessages.appendChild(errDiv);
    } finally {
      sendButton.disabled = false;
      chatInput.focus();
    }
  }

  const fontLink = document.createElement("link");
  fontLink.rel = "stylesheet";
  fontLink.href = "https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600&display=swap";
  document.head.appendChild(fontLink);
})();