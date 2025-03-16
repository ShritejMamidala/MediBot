// Select elements
const chatBox = document.getElementById("chat-box");
const chatInput = document.getElementById("chat-input");
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

// Sends user message and fetches bot response
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // Add User Message
    addMessage(message, "user");

    // Collect sidebar information
    const sidebarInfo = {
        age: document.getElementById("age").value,
        gender: document.getElementById("gender").value,
        weight: document.getElementById("weight").value,
        status: document.getElementById("status").value
    };

    // Collect the full chat log
    const chatLog = Array.from(document.querySelectorAll(".message")).map(m => ({
        text: m.textContent,
        sender: m.classList.contains("user-message") ? "user" : "bot"
    }));

    // Prepare the data to be sent to the backend
    const requestData = {
        chat_log: chatLog.map(entry => entry.text), // Ensure only text is sent, not object
        user_info: sidebarInfo,
        question: message
    };

    // Send data to backend and receive response
    const botReply = await sendToApi(requestData);
    addMessage(botReply.response, "bot");

    // Clear input field
    userInput.value = "";
}

// Function to send data to the API
async function sendToApi(data) {
    const response = await fetch('/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return response.json();
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
userInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") sendMessage();
});
