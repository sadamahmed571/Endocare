(function () {
    const isEnglish = window.location.pathname.includes('/en/');

    let isProcessing = false;
    let isOpen = false;
    let fab, overlay, closeBtn, messagesEl, inputEl, sendBtn;

    const $ = selector => document.querySelector(selector);
    const $$ = selector => document.querySelectorAll(selector);

    function formatText(text) {
        if (!text) return '';
        let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
        formatted = formatted.replace(/\n/g, '<br>');
        return formatted;
    }

    async function copyToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        } else {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            textArea.style.position = "fixed";
            textArea.style.left = "-999999px";
            textArea.style.top = "-999999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                textArea.remove();
                return Promise.resolve();
            } catch (error) {
                textArea.remove();
                return Promise.reject(error);
            }
        }
    }

    async function callGemini(text) {
        let systemPrompt = isEnglish 
            ? `You are NovaBot, the AI medical and technical assistant representing NovaCare Yemen (نوفاكير للتوريدات الدوائية).
CRITICAL RESPONSE INSTRUCTIONS:
1. CONCISENESS FIRST: Keep your initial and general responses EXTREMELY concise, brief, and direct (maximum 2 to 3 short sentences or clear bullet points). Do NOT give verbose introductions or long company overviews unless explicitly asked.
2. Get straight to answering the user's question directly.
3. Provide accurate information about pharmaceutical supplies, vitamins, hormones, APIs, and medical equipment.
4. Do not prescribe specific treatments or dosages unless quoted from verified product guides. Direct users to consult a doctor when appropriate.
5. Always be polite, professional, and helpful.`
            : `أنت NovaBot، المساعد الطبي والتقني الذكي لشركة نوفاكير للتوريدات الدوائية (NovaCare Yemen).
تعليمات هامة وصارمة جداً وطريقة الإجابة:
1. الاختصار والتركيز: اجعل إجاباتك وخاصة الإجابة الأولى مختصرة جداً ومباشرة وموجزة (في حدود سطرين أو ثلاثة أسطر أو نقاط سريعة). تجنب تماماً المقدمات الإنشائية الطويلة أو سرد تعريف الشركة وتاريخها ما لم يُطلب منك ذلك صراحة.
2. ادخل في صلب الموضوع ومباشرة في إجابة السؤال دون تكرار عبارات الترحيب في كل رسالة.
3. قدم معلومات طبية وتقنية دقيقة حول التوريدات الصيدلانية، الفيتامينات، الهرمونات، والمواد الفعالة.
4. يمنع تقديم وصفات طبية نهائية أو تحديد جرعات علاجية. انصح باستشارة الطبيب المختص عند الحاجة.
5. كن لبقاً ومهنياً ومباشراً في إجابتك.`;

        try {
            // First try calling the local backend if it's running
            if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
                const res = await fetch('/api/chat', {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ text, systemPrompt })
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.candidates && data.candidates.length > 0) {
                        return data.candidates[0].content.parts[0].text;
                    }
                }
            }
        } catch (e) {
            console.log("Local backend not available, falling back to direct API call...");
        }

        // Fallback: Call Gemini API directly from the frontend (for static HTML / file:// viewing)
        const apiKey = window.__ENV__ && window.__ENV__.GEMINI_API_KEY;
        if (!apiKey) throw new Error("API Key is missing from frontend environment");

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;
        const payload = {
            contents: [{ parts: [{ text: `${systemPrompt}\n\nUser: ${text}` }] }]
        };

        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`HTTP Error: ${res.status} - ${errText}`);
        }

        const data = await res.json();
        if (data && data.candidates && data.candidates.length > 0) {
            return data.candidates[0].content.parts[0].text;
        }
        
        throw new Error("Invalid response from Gemini API");
    }

    function injectStyles() {
        if ($('#novacare-chatbot-realchat-styles')) return;
        const style = document.createElement('style');
        style.id = 'novacare-chatbot-realchat-styles';
        style.textContent = `
            .chatbot-messages {
                display: flex !important;
                flex-direction: column !important;
                gap: 16px !important;
                padding: 18px 14px !important;
                background: #f8fafc !important;
            }
            .chat-item {
                display: flex;
                align-items: flex-end;
                gap: 10px;
                max-width: 92%;
                animation: chatItemFadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            }
            @keyframes chatItemFadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .chat-item-bot {
                align-self: flex-start;
            }
            .chat-item-user {
                align-self: flex-end;
                flex-direction: row-reverse;
            }
            .chat-item-avatar {
                width: 34px;
                height: 34px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
                font-size: 16px;
                box-shadow: 0 2px 6px rgba(0,0,0,0.1);
            }
            .chat-avatar-bot {
                background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
                color: #fff;
            }
            .chat-avatar-user {
                background: #475569;
                color: #fff;
            }
            .chat-item-content {
                display: flex;
                flex-direction: column;
                min-width: 130px;
            }
            .chat-item-bot .chat-item-content {
                align-items: flex-start;
            }
            .chat-item-user .chat-item-content {
                align-items: flex-end;
            }
            .chat-sender-name {
                font-size: 11px;
                font-weight: 700;
                color: #64748b;
                margin-bottom: 4px;
                padding: 0 4px;
                letter-spacing: 0.2px;
            }
            .chat-bubble {
                padding: 12px 16px;
                border-radius: 18px;
                font-size: 14px;
                line-height: 1.6;
                word-break: break-word;
                position: relative;
                box-shadow: 0 2px 8px rgba(0,0,0,0.06);
            }
            .bot-bubble {
                background: #ffffff;
                color: #1e293b;
                border: 1px solid #e2e8f0;
                border-bottom-left-radius: 4px;
            }
            [dir="rtl"] .bot-bubble, .chatbot-overlay:not([style*="direction: ltr"]) .chat-item-bot .bot-bubble {
                border-bottom-left-radius: 18px;
                border-bottom-right-radius: 4px;
            }
            .user-bubble {
                background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
                color: #ffffff;
                border-bottom-right-radius: 4px;
                box-shadow: 0 3px 12px rgba(13, 148, 136, 0.25);
            }
            [dir="rtl"] .user-bubble, .chatbot-overlay:not([style*="direction: ltr"]) .chat-item-user .user-bubble {
                border-bottom-right-radius: 18px;
                border-bottom-left-radius: 4px;
            }
            .chat-text strong {
                font-weight: 700;
                color: inherit;
            }
            .chat-footer {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                margin-top: 8px;
                padding-top: 6px;
                border-top: 1px solid rgba(0, 0, 0, 0.06);
                font-size: 11px;
                color: #94a3b8;
            }
            .user-bubble .chat-footer {
                border-top: 1px solid rgba(255, 255, 255, 0.2);
                color: rgba(255, 255, 255, 0.85);
            }
            .chat-time {
                font-size: 10.5px;
                white-space: nowrap;
            }
            .chat-actions {
                display: flex;
                align-items: center;
                gap: 4px;
            }
            .chat-action-btn {
                background: rgba(0,0,0,0.03);
                border: 1px solid rgba(0,0,0,0.06);
                color: #64748b;
                border-radius: 6px;
                padding: 4px 7px;
                font-size: 12px;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
                line-height: 1;
                user-select: none;
            }
            .chat-action-btn:hover {
                background: rgba(13, 148, 136, 0.1);
                color: #0d9488;
                border-color: rgba(13, 148, 136, 0.25);
            }
            .user-bubble .chat-action-btn {
                background: rgba(255, 255, 255, 0.15);
                border: 1px solid rgba(255, 255, 255, 0.25);
                color: #ffffff;
            }
            .user-bubble .chat-action-btn:hover {
                background: rgba(255, 255, 255, 0.3);
                color: #ffffff;
            }
            .chat-action-btn.copied {
                background: #dcfce7 !important;
                color: #166534 !important;
                border-color: #86efac !important;
            }
            .user-bubble .chat-action-btn.copied {
                background: #ffffff !important;
                color: #0d9488 !important;
            }
            .typing-dots {
                display: flex;
                align-items: center;
                gap: 5px;
                padding: 6px 8px;
            }
            .typing-dots span {
                width: 7px;
                height: 7px;
                background: #0d9488;
                border-radius: 50%;
                display: inline-block;
                animation: typingBounce 1.4s infinite ease-in-out both;
            }
            .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
            .typing-dots span:nth-child(2) { animation-delay: -0.16s; }
            @keyframes typingBounce {
                0%, 80%, 100% { transform: scale(0); opacity: 0.4; }
                40% { transform: scale(1); opacity: 1; }
            }
            @media (max-width: 576px) {
                .chatbot-overlay {
                    bottom: 60px !important;
                    left: 10px !important;
                    right: 10px !important;
                    width: auto !important;
                    max-width: calc(100vw - 20px) !important;
                    height: 440px !important;
                    max-height: calc(100vh - 110px) !important;
                    border-radius: 12px !important;
                }
                .chatbot-header {
                    padding: 10px 12px !important;
                }
                .chatbot-avatar {
                    width: 32px !important;
                    height: 32px !important;
                    font-size: 15px !important;
                }
                .chatbot-title {
                    font-size: 13px !important;
                }
                .chatbot-status {
                    font-size: 9.5px !important;
                }
                .chatbot-messages {
                    gap: 12px !important;
                    padding: 14px 10px !important;
                }
                .chat-item {
                    gap: 8px;
                    max-width: 95%;
                }
                .chat-item-avatar {
                    width: 30px;
                    height: 30px;
                    font-size: 14px;
                }
                .chat-bubble {
                    padding: 10px 13px;
                    border-radius: 15px;
                    font-size: 13px;
                    line-height: 1.5;
                }
                .chat-sender-name {
                    font-size: 10px;
                    margin-bottom: 3px;
                }
                .chat-footer {
                    margin-top: 6px;
                    padding-top: 5px;
                    gap: 8px;
                }
                .chat-time {
                    font-size: 9.5px;
                }
                .chat-action-btn {
                    padding: 3px 6px;
                    font-size: 11px;
                }
                .chatbot-input-area {
                    padding: 8px 10px 10px !important;
                }
                .chatbot-input-wrapper {
                    padding: 4px 4px 4px 10px !important;
                }
                .chatbot-input {
                    font-size: 12px !important;
                }
                .chatbot-send-btn {
                    width: 32px !important;
                    height: 32px !important;
                    font-size: 13px !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    function injectHTML() {
        if ($('#chatbot-overlay')) return;
        injectStyles();

        const html = isEnglish ? `
    <div id="chatbot-overlay" class="chatbot-overlay" style="direction: ltr;">
        <div class="chatbot-container">
            <div class="chatbot-header">
                <div class="chatbot-header-info">
                    <div class="chatbot-avatar"><i class="bi bi-robot"></i></div>
                    <div>
                        <h5 class="chatbot-title">NovaCare AI Assistant</h5>
                        <span class="chatbot-status">Online - Ready to answer</span>
                    </div>
                </div>
                <button id="chatbot-close" class="btn btn-sm chatbot-close-btn" aria-label="Close"><i class="bi bi-x-lg"></i></button>
            </div>
            <div id="chatbot-messages" class="chatbot-messages">
            </div>
            <div class="chatbot-input-area">
                <div class="chatbot-input-wrapper">
                    <textarea id="chatbot-input" class="chatbot-input" rows="1" placeholder="Type your question..." maxlength="500"></textarea>
                    <button id="chatbot-send" class="btn btn-primary chatbot-send-btn" aria-label="Send"><i class="bi bi-send"></i></button>
                </div>
            </div>
        </div>
    </div>` : `
    <div id="chatbot-overlay" class="chatbot-overlay">
        <div class="chatbot-container">
            <div class="chatbot-header">
                <div class="chatbot-header-info">
                    <div class="chatbot-avatar"><i class="bi bi-robot"></i></div>
                    <div>
                        <h5 class="chatbot-title">مساعد NovaCare AI</h5>
                        <span class="chatbot-status">متصل - جاهز للإجابة</span>
                    </div>
                </div>
                <button id="chatbot-close" class="btn btn-sm chatbot-close-btn" aria-label="إغلاق"><i class="bi bi-x-lg"></i></button>
            </div>
            <div id="chatbot-messages" class="chatbot-messages">
            </div>
            <div class="chatbot-input-area">
                <div class="chatbot-input-wrapper">                    
                    <textarea id="chatbot-input" class="chatbot-input" rows="1" placeholder="اكتب سؤالك هنا..." maxlength="500"></textarea>
                    <button id="chatbot-send" class="btn btn-primary chatbot-send-btn" aria-label="إرسال"><i class="bi bi-send"></i></button>
                </div>
            </div>
        </div>
    </div>`;
        const container = document.createElement('div');
        container.id = 'novacare-chatbot-wrapper';
        container.innerHTML = html;
        document.body.appendChild(container);
    }

    function appendMessage(text, sender) {
        if (!text) return;

        const timeStr = new Date().toLocaleTimeString(isEnglish ? 'en-US' : 'ar-YE', { hour: '2-digit', minute: '2-digit' });
        const itemDiv = document.createElement('div');
        itemDiv.className = `chat-item ${sender === 'user' ? 'chat-item-user' : 'chat-item-bot'}`;

        const avatarIcon = sender === 'user' ? 'bi-person-fill' : 'bi-robot';
        const avatarClass = sender === 'user' ? 'chat-avatar-user' : 'chat-avatar-bot';
        const senderLabel = sender === 'user' ? (isEnglish ? 'You' : 'أنت') : (isEnglish ? 'NovaBot AI' : 'مساعد NovaBot');
        const bubbleClass = sender === 'user' ? 'user-bubble' : 'bot-bubble';
        const formattedContent = sender === 'user' ? text : formatText(text);

        const copyLabel = isEnglish ? 'Copy' : 'نسخ';
        const copiedLabel = isEnglish ? 'Copied!' : 'تم النسخ';

        let actionsHtml = `
            <button class="chat-action-btn copy-btn" title="${isEnglish ? 'Copy message' : 'نسخ الرسالة'}" aria-label="Copy">
                <i class="bi bi-clipboard"></i>
            </button>
        `;

        itemDiv.innerHTML = `
            <div class="chat-item-avatar ${avatarClass}">
                <i class="bi ${avatarIcon}"></i>
            </div>
            <div class="chat-item-content">
                ${sender === 'bot' ? `<div class="chat-sender-name">${senderLabel}</div>` : ''}
                <div class="chat-bubble ${bubbleClass}">
                    <div class="chat-text">${formattedContent}</div>
                    <div class="chat-footer">
                        <span class="chat-time">${timeStr}</span>
                        <div class="chat-actions">
                            ${actionsHtml}
                        </div>
                    </div>
                </div>
            </div>
        `;

        const copyBtn = itemDiv.querySelector('.copy-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                try {
                    await copyToClipboard(text);
                    copyBtn.classList.add('copied');
                    copyBtn.innerHTML = `<i class="bi bi-check2"></i>`;
                    setTimeout(() => {
                        copyBtn.classList.remove('copied');
                        copyBtn.innerHTML = `<i class="bi bi-clipboard"></i>`;
                    }, 2000);
                } catch (err) {
                    console.error('Copy failed', err);
                }
            });
        }

        messagesEl.appendChild(itemDiv);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function showTyping() {
        const id = 'typing-indicator';
        if ($('#' + id)) return;
        
        const itemDiv = document.createElement('div');
        itemDiv.id = id;
        itemDiv.className = 'chat-item chat-item-bot';
        itemDiv.innerHTML = `
            <div class="chat-item-avatar chat-avatar-bot">
                <i class="bi bi-robot"></i>
            </div>
            <div class="chat-item-content">
                <div class="chat-sender-name">${isEnglish ? 'NovaBot AI' : 'مساعد NovaBot'}</div>
                <div class="chat-bubble bot-bubble">
                    <div class="typing-dots">
                        <span></span><span></span><span></span>
                    </div>
                </div>
            </div>
        `;
        messagesEl.appendChild(itemDiv);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function hideTyping() {
        const el = $('#typing-indicator');
        if (el) el.remove();
    }

    async function handleSend() {
        if (isProcessing) return;
        const text = inputEl.value.trim();
        if (!text) return;

        inputEl.value = '';
        appendMessage(text, 'user');

        isProcessing = true;
        showTyping();

        try {
            const answer = await callGemini(text);
            hideTyping();
            appendMessage(answer, 'bot');
        } catch (err) {
            console.error("Gemini Error:", err);
            hideTyping();
            const errMsg = isEnglish 
                ? 'We apologize, the AI assistant is temporarily unavailable. Please try again later.' 
                : 'نعتذر، المساعد الذكي غير متوفر حالياً. يرجى المحاولة في وقت لاحق.';
            appendMessage(errMsg, 'bot');
        } finally {
            isProcessing = false;
            inputEl.focus();
        }
    }

    function openChat(e) {
        if (e) e.stopPropagation();
        if (!fab.classList.contains('expanded')) {
            fab.classList.add('expanded');
            return;
        }
        if (isOpen) return;
        isOpen = true;
        overlay.classList.add('open');
        fab.style.display = 'none';
        fab.classList.remove('expanded');
        setTimeout(() => inputEl.focus(), 400);
    }

    function closeChat() {
        if (!isOpen) return;
        isOpen = false;
        overlay.classList.remove('open');
        fab.style.display = 'flex';
    }

    function init() {
        injectHTML();
        fab = $('#chatbot-fab');
        overlay = $('#chatbot-overlay');
        closeBtn = $('#chatbot-close');
        messagesEl = $('#chatbot-messages');
        inputEl = $('#chatbot-input');
        sendBtn = $('#chatbot-send');

        if (fab) fab.addEventListener('click', openChat);
        if (closeBtn) closeBtn.addEventListener('click', closeChat);
        if (sendBtn) sendBtn.addEventListener('click', handleSend);
        if (inputEl) {
            inputEl.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                }
            });
        }

        if (messagesEl && messagesEl.children.length === 0) {
            const welcomeMsg = isEnglish
                ? "Hello! 👋 I'm NovaBot, AI medical assistant for NovaCare Yemen. How can I help you today?"
                : "مرحباً بك! 👋 أنا NovaBot، المساعد الذكي لشركة نوفاكير للتوريدات الدوائية. كيف يمكنني مساعدتك اليوم؟";
            appendMessage(welcomeMsg, 'bot');
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
