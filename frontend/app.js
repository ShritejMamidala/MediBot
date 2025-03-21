// Select elements
const chatBox = document.getElementById("chat-box");
const chatInput = document.getElementById("chat-input");
const sendButton = document.getElementById("send-btn");
const clearChatButton = document.getElementById("clear-history");
const modal = document.getElementById("clear-chat-modal");
const closeModal = document.querySelector(".close-modal");
const confirmClearChat = document.getElementById("confirm-clear-chat");

// Function to send messages and handle bot responses
async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return; // Don't send empty messages

    // Add user message to chat
    addMessage(message, "user");

    // Collect sidebar information
    const sidebarInfo = {
        age: document.getElementById("age").value,
        gender: document.getElementById("gender").value,
        weight: document.getElementById("weight").value,
        waterIntake: document.getElementById("water-intake").value,
        recentFood: document.getElementById("recent-food").value,
        status: document.getElementById("status").value,
        symptoms: document.getElementById("symptoms").value
    };

    // Collect the full chat log
    const chatLog = Array.from(document.querySelectorAll(".message")).map(m => ({
        text: m.textContent,
        sender: m.classList.contains("user-message") ? "user" : "bot"
    }));

    // Prepare the data to be sent to the backend
    const requestData = {
        chat_log: chatLog.map(entry => entry.text),
        user_info: sidebarInfo,
        question: message
    };

    // Send data to backend and receive response
    const response = await fetch('/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    addMessage(data.response, "bot"); // Assume 'response' contains the reply text

    // Clear input field
    chatInput.value = "";
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

// Event Listeners
sendButton.addEventListener("click", sendMessage);
chatInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});

clearChatButton.addEventListener("click", function () {
    modal.style.display = "flex"; // Show modal only when button is clicked
});

closeModal.addEventListener("click", function () {
    modal.style.display = "none";
});

confirmClearChat.addEventListener("click", clearChat);

window.addEventListener("click", function (event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
});