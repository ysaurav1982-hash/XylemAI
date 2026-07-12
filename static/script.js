const chatBox = document.getElementById("chatBox");
const messageInput = document.getElementById("message");
const sendButton = document.getElementById("sendButton");
const newChatBtn = document.getElementById("newChatBtn");
function setLoading(isLoading) {

    sendButton.disabled = isLoading;

    messageInput.readOnly = isLoading;

    if (isLoading) {
        sendButton.style.opacity = "0.6";
        sendButton.style.cursor = "not-allowed";
    } else {
        sendButton.style.opacity = "1";
        sendButton.style.cursor = "pointer";
    }

}
function addMessage(text, sender) {

    const bubble = document.createElement("div");
    bubble.className = sender;

    if(sender === "ai"){

        bubble.innerHTML = `
            <div class="message-text">${text}</div>

            <button class="copy-btn">
                ⧉ Copy
            </button>
        `;

    }else{

        bubble.textContent = text;

    }

    chatBox.appendChild(bubble);

    chatBox.scrollTo({
        top: chatBox.scrollHeight,
        behavior:"smooth"
    });

}

async function sendMessage() {

const message = messageInput.value.trim();

if (message === "") return;

// Hide welcome logo after first message
const welcome = document.getElementById("welcomeScreen");
if (welcome) {
    welcome.style.display = "none";
}

addMessage(message, "user");
setLoading(true);
    messageInput.value = "";

    const loading = document.createElement("div");
    loading.className = "ai";
loading.innerHTML = `
<div class="typing">
    <span></span>
    <span></span>
    <span></span>
</div>
`;
    chatBox.appendChild(loading);
chatBox.scrollTo({
    top: chatBox.scrollHeight,
    behavior: "smooth"
});

    try {

        const response = await fetch("/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: message
            })
        });

        const data = await response.json();

loading.remove();

setLoading(false);

addMessage(data.reply, "ai");

    } catch (err) {

loading.remove();

setLoading(false);

addMessage("Unable to connect to Xylem.AI.", "ai");    }
}

sendButton.addEventListener("click", sendMessage);

messageInput.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        sendMessage();
    }
});


newChatBtn.addEventListener("click", () => {

    const confirmNewChat = confirm(
        "Start a new chat?\n\nYour current conversation will be cleared."
    );

    if (!confirmNewChat) {
        return;
    }

    // Clear chat
    chatBox.innerHTML = "";

    // Show welcome screen again
    const welcome = document.getElementById("welcomeScreen");

    if (welcome) {
        welcome.style.display = "flex";
        welcome.style.opacity = "1";
    }

    // Clear input
    messageInput.value = "";
    messageInput.disabled = false;

    messageInput.readOnly = false;
    sendButton.disabled = false;

    // Focus input
    messageInput.focus();

});

document.addEventListener("click",(e)=>{

    if(!e.target.classList.contains("copy-btn")) return;

    const text =
        e.target.parentElement.querySelector(".message-text").innerText;

    navigator.clipboard.writeText(text);

    e.target.innerHTML="✓ Copied";

    setTimeout(()=>{
        e.target.innerHTML="⧉ Copy";
    },2000);

});
