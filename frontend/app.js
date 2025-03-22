// Select elements
const chatBox = document.getElementById("chat-box");
const chatInput = document.getElementById("chat-input");
const sendButton = document.getElementById("send-btn");
const imageInput = document.getElementById("image-input"); // New file input element
const clearChatButton = document.getElementById("clear-history");
const modal = document.getElementById("clear-chat-modal");
const closeModal = document.querySelector(".close-modal");
const confirmClearChat = document.getElementById("confirm-clear-chat");

// Function to send messages and handle bot responses
async function sendMessage() {
    const message = chatInput.value.trim();
    const imageFile = imageInput.files[0];

    // Do not send if there is no message and no image
    if (!message && !imageFile) return;

    // Add user message to chat (if there's text)
    if (message) {
        addMessage(message, "user");
    } else {
        addMessage("[Image attached]", "user");
    }

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

    // Collect the full chat log (only text content)
    const chatLog = Array.from(document.querySelectorAll(".message")).map(m => m.textContent);

    // Create a FormData object to handle text and file upload
    const formData = new FormData();
    formData.append("question", message);
    formData.append("user_info", JSON.stringify(sidebarInfo));
    formData.append("chat_log", JSON.stringify(chatLog));
    if (imageFile) {
        formData.append("image", imageFile);
    }

    // Send data to backend via a POST request
    try {
        const response = await fetch('/chat', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        addMessage(data.response, "bot"); // Display bot's response
    } catch (error) {
        console.error("Error sending message:", error);
        addMessage("Sorry, something went wrong.", "bot");
    }

    // Clear input fields
    chatInput.value = "";
    imageInput.value = "";
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
    modal.style.display = "flex"; // Show modal when button is clicked
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
