async function handleSendMessage() {
  const text = chatInput.value.trim();
  if (text.length < 3) {
    alert(UI.shortQuery);
    return;
  }

  chatInput.value = "";
  sendButton.disabled = true;

  // Add user message
  const userMsg = document.createElement("div");
  userMsg.style.cssText = "padding: 10px 14px; border-radius: 12px; max-width: 85%; word-break: break-word; line-height: 1.5; font-size: 14px; background: #dbeafe; align-self: flex-start; margin-right: auto;";
  userMsg.textContent = text;
  chatMessages.appendChild(userMsg);
  conversationHistory.push({ role: "user", content: text });
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Add "thinking" placeholder
  const thinkingEl = document.createElement("div");
  thinkingEl.textContent = UI.thinking;
  thinkingEl.style.cssText = "background: #f1f5f9; padding: 10px 14px; border-radius: 12px; align-self: flex-end; margin-left: auto; font-style: italic;";
  chatMessages.appendChild(thinkingEl);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  let assistantMsgDiv = null; // Will hold the live-updating message element
  let fullResponse = "";

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
        "X-API-Key": "sk-1234567890" 
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    // ✅ Keep thinkingEl until first token!
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let isFirstChunk = true;

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
          console.warn("Invalid JSON line:", line);
          continue;
        }

        if (parsed.error) {
          throw new Error(parsed.error);
        }

        if (parsed.response !== undefined) {
          fullResponse += parsed.response;

          // ✅ On first token: replace "thinking" with real message
          if (isFirstChunk) {
            // Create assistant message div
            assistantMsgDiv = document.createElement("div");
            assistantMsgDiv.style.cssText = "padding: 10px 14px; border-radius: 12px; max-width: 85%; word-break: break-word; line-height: 1.5; font-size: 14px; background: #f1f5f9; align-self: flex-end; margin-left: auto;";
            
            // Replace thinkingEl with assistantMsgDiv
            chatMessages.replaceChild(assistantMsgDiv, thinkingEl);
            isFirstChunk = false;
          }

          // Update content with cleaned & rendered markdown
          const cleanText = stripReferences(fullResponse);
          const renderedHTML = renderMarkdown(cleanText);
          assistantMsgDiv.innerHTML = renderedHTML;
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }
      }
    }

    // Finalize conversation history
    conversationHistory.push({ role: "assistant", content: stripReferences(fullResponse) });

  } catch (err) {
    console.error("Stream error:", err);

    // If thinking is still there (e.g., error before first token), remove it
    if (thinkingEl.parentNode) {
      chatMessages.removeChild(thinkingEl);
    }

    // Show error
    const errDiv = document.createElement("div");
    errDiv.style.cssText = "background: #fee; padding: 10px 14px; border-radius: 12px; align-self: flex-end; margin-left: auto; color: #b00;";
    errDiv.textContent = UI.error;
    chatMessages.appendChild(errDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

  } finally {
    sendButton.disabled = false;
    chatInput.focus();
  }
}