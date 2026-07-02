const form = document.querySelector("form[action*='/message']");
const chatBox = document.getElementById("chat-box");

if (form) {

    scrollToBottom();

    let isSending = false;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (isSending) return;
        isSending = true;

        const input = form.querySelector("input[name='prompt']");
        const button = form.querySelector("button");

        const prompt = input.value.trim();

        if (!prompt) {
            isSending = false;
            return;
        }

        // User message
        chatBox.innerHTML += `
            <div class="text-end mb-3">
                <div class="d-inline-block bg-primary text-white p-3 rounded">
                    ${escapeHTML(prompt)}
                </div>
            </div>
        `;

        scrollToBottom();

        input.value = "";
        input.disabled = true;
        button.disabled = true;
        button.innerText = "Thinking...";

        try {

            const response = await fetch(form.action, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ prompt })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Server Error");
            }

            // Render Markdown as HTML
            const aiReply = marked.parse(data.reply);

            chatBox.innerHTML += `
                <div class="text-start mb-3">
                    <div class="d-inline-block bg-light border p-3 rounded ai-message">
                        ${aiReply}
                    </div>
                </div>
            `;

        } catch (err) {

            console.error(err);

            chatBox.innerHTML += `
                <div class="text-start mb-3">
                    <div class="d-inline-block bg-danger text-white p-3 rounded">
                        ${escapeHTML(err.message)}
                    </div>
                </div>
            `;
        }

        input.disabled = false;
        button.disabled = false;
        button.innerText = "Send";
        input.focus();

        isSending = false;

        scrollToBottom();
    });
}

function scrollToBottom() {
    if (chatBox) {
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

function escapeHTML(text) {
    const div = document.createElement("div");
    div.innerText = text;
    return div.innerHTML;
}