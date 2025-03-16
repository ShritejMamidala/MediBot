const chatbox = document.getElementById("chat-box");
const userInput = document.getElementById("chat-input");
const sendButton = document.getElementById("send-btn");

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // Add User Message
    addMessage(message, "user");

    // Clear input field
    userInput.value = "";

    // Simulate bot response (Replace with actual API call)
    setTimeout(() => {
        const botReply = "This is a bot response"; // Replace this with API response
        addMessage(botReply, "bot");
    }, 1000);
}

/**
 * Adds a message bubble to the chatbox
 * @param {string} text - The message text
 * @param {string} sender - Either "user" or "bot"
 */
function addMessage(text, sender) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message");

    if (sender === "user") {
        messageDiv.classList.add("user-message");
    } else {
        messageDiv.classList.add("bot-message");
    }

    messageDiv.textContent = text;
    chatbox.appendChild(messageDiv);

    // Auto-scroll to the latest message
    chatbox.scrollTop = chatbox.scrollHeight;
}

// Event Listeners
sendButton.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") sendMessage();
});
