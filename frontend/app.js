// Select elements
const chatBox = document.getElementById("chat-box");
const chatInput = document.getElementById("chat-input");
const sendButton = document.getElementById("send-btn");
const clearChatButton = document.getElementById("clear-history");
const modal = document.getElementById("clear-chat-modal");
const closeModal = document.querySelector(".close-modal");
const confirmClearChat = document.getElementById("confirm-clear-chat");

// Function to send a message
function sendMessage() {
    const message = chatInput.value.trim();
    if (message === "") return; // Don't send empty messages

    // Add user message to chat
    addMessage(message, "user");

    // Clear input field
    chatInput.value = "";

    // Simulate bot response (replace this with an actual API call later)
    setTimeout(() => {
        const botReply = "This is a bot response."; 
        addMessage(botReply, "bot");
    }, 1000);
}

// Function to add messages to chat
function addMessage(text, sender) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message");

    if (sender === "user") {
        messageDiv.classList.add("user-message");
    } else {
        messageDiv.classList.add("bot-message");
    }

    messageDiv.textContent = text;
    chatBox.appendChild(messageDiv);

    // Auto-scroll to the latest message
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Function to clear the chat
function clearChat() {
    chatBox.innerHTML = ""; // Removes all messages
    modal.style.display = "none"; // Close modal after clearing
}

// Open modal when Clear Chat button is clicked
clearChatButton.addEventListener("click", function () {
    modal.style.display = "flex"; // Show modal only when button is clicked
});

// Close modal when X button is clicked
closeModal.addEventListener("click", function () {
    modal.style.display = "none";
});

// Confirm clear chat
confirmClearChat.addEventListener("click", clearChat);

// Close modal if user clicks outside the box
window.addEventListener("click", function (event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
});

// Event Listeners for sending messages
sendButton.addEventListener("click", sendMessage);
chatInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});
