document.addEventListener('DOMContentLoaded', () => {
    const chatContainer = document.getElementById('chat-container');
    const toggleButton = document.getElementById('chat-toggle-button');
    const closeButton = document.getElementById('chat-close');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('chat-send');

    const API_KEY = "AIzaSyC_mQwKj7H4wJ3wmxB-6W9bOFyrA0j_Aik";
    const MODEL_NAME = "gemini-1.5-pro";
    const API_URL = `https://generativelanguage.googleapis.com/v1/models/${MODEL_NAME}:generateContent`;

    // Chat panelini aç/kapat
    function toggleChat() {
        chatContainer.classList.toggle('chat-open');
        chatContainer.classList.toggle('chat-closed');
        if (chatContainer.classList.contains('chat-open')) {
            chatInput.focus();
        }
    }

    function addMessage(message, isUser = false) {
        const msg = document.createElement('div');
        msg.className = isUser ? 'user-message' : 'bot-message';
        msg.textContent = message;
        chatMessages.appendChild(msg);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addTyping() {
        const typing = document.createElement('div');
        typing.id = 'typing-indicator';
        typing.className = 'typing-indicator';
        typing.innerHTML = '<span></span><span></span><span></span>';
        chatMessages.appendChild(typing);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function removeTyping() {
        const typing = document.getElementById('typing-indicator');
        if (typing) typing.remove();
    }

    async function sendToGemini(userMessage) {
        addTyping();
        try {
            const res = await fetch(`${API_URL}?key=${API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: `Bağlam: Bu sohbet akıllı sokak lambaları, enerji tasarrufu ve akıllı şehir çözümleri hakkındadır. Kullanıcı sorusu: ${userMessage}` }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024
                    },
                    safetySettings: [
                        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
                    ]
                })
            });

            const data = await res.json();
            removeTyping();

            const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (responseText) {
                addMessage(responseText);
            } else {
                addMessage("Cevap alınamadı. Lütfen tekrar deneyin.");
                console.error("Yanıt yapısı beklenmedik:", data);
            }
        } catch (err) {
            removeTyping();
            addMessage("Hata oluştu: " + err.message);
            console.error("Gemini API hatası:", err);
        }
    }

    function sendMessage() {
        const msg = chatInput.value.trim();
        if (!msg) return;
        addMessage(msg, true);
        chatInput.value = '';
        sendToGemini(msg);
    }

    // Olay dinleyicileri
    toggleButton.addEventListener('click', toggleChat);
    closeButton.addEventListener('click', toggleChat);
    sendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') sendMessage();
    });

    console.log("Chatbot yüklendi.");
});
