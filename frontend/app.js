document.addEventListener("DOMContentLoaded", function () {
    const chatBox = document.getElementById("chat-box");
    const chatInput = document.getElementById("chat-input");
    const clearHistory = document.getElementById("clear-history");

    chatInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter" && chatInput.value.trim() !== "") {
            addMessage(chatInput.value);
            chatInput.value = "";
        }
    });

    clearHistory.addEventListener("click", function () {
        chatBox.innerHTML = "";
    });

    function addMessage(text) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("chat-message");
        messageDiv.textContent = text;
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }
});
    