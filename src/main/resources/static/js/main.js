'use strict';

// =========================
// Globale variabelen
// =========================
let stompClient = null;
let username = null;
let room = null;
const subscribedRooms = new Set();

const colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];

const usernamePage = document.querySelector('#username-page');
const chatPage = document.querySelector('#chat-page');
const usernameForm = document.querySelector('#usernameForm');
const messageForm = document.querySelector('#messageForm');
const messageInput = document.querySelector('#message');
const messageArea = document.querySelector('#messageArea');
const connectingElement = document.querySelector('.connecting');

// WEG WEG WEG WEG WEG WEG WEG WEG WEG >>>>
console.log("🔥 main.js geladen, Versie 3.0 🔥");
console.log("main.js geladen, SockJS versie:", SockJS.version);
// WEG WEG WEG WEG WEG WEG WEG WEG WEG <<<<


// =========================
// Helper: Avatar kleur
// =========================
function getAvatarColor(messageSender) {
    let hash = 0;
    for (let i = 0; i < messageSender.length; i++) {
        hash = 31 * hash + messageSender.charCodeAt(i);
    }
    return colors[Math.abs(hash % colors.length)];
}

// =========================
// Display message
// =========================
function displayMessage(message, isHistory = false) {
    const messageElement = document.createElement('li');

    if (isHistory) {
        messageElement.className = 'history-message';
        const timestamp = message.timestamp ? new Date(message.timestamp) : new Date();
        const hh = String(timestamp.getHours()).padStart(2, '0');
        const mm = String(timestamp.getMinutes()).padStart(2, '0');
        const yyyy = timestamp.getFullYear();
        const mmth = String(timestamp.getMonth() + 1).padStart(2, '0');
        const dd = String(timestamp.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}${mmth}${dd} ${hh}:${mm}`;
        const senderInitial = message.sender ? message.sender[0] : '?';
        messageElement.textContent = `${dateStr}, ${senderInitial}: ${message.content}`;
        messageArea.prepend(messageElement);
    } else {
        if (message.type === 'JOIN' || message.type === 'LEAVE') {
            messageElement.classList.add('event-message');
            message.content = message.type === 'JOIN' ? `${message.sender} joined!` : `${message.sender} left!`;
        } else {
            messageElement.classList.add('chat-message');
            const avatarElement = document.createElement('i');
            avatarElement.textContent = message.sender[0];
            avatarElement.style['background-color'] = getAvatarColor(message.sender);
            messageElement.appendChild(avatarElement);

            const usernameElement = document.createElement('span');
            usernameElement.textContent = message.sender;
            messageElement.appendChild(usernameElement);
        }

        const textElement = document.createElement('p');
        textElement.textContent = message.content;
        messageElement.appendChild(textElement);

        messageArea.appendChild(messageElement);
    }

    messageArea.scrollTop = messageArea.scrollHeight;
}

// =========================
// Subscribe naar room
// =========================
function subscribeRoom(room) {
    if (subscribedRooms.has(room)) return;
    subscribedRooms.add(room);

    stompClient.subscribe(`/topic/room.${room}`, function(payload) {
        displayMessage(JSON.parse(payload.body));
    });
}

// =========================
// Connect
// =========================
function connect(event) {
    if (stompClient && stompClient.connected) return;

    username = username || document.querySelector('#name')?.value.trim() || 'Anonymous';
    room = room || "general";

    if (!username || !room) return;

    usernamePage.classList.add('hidden');
    chatPage.classList.remove('hidden');

    const socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);

    socket.onopen = () => console.log("Web Socket Opened...");
    socket.onclose = () => console.log("Web Socket Closed...");
    socket.onerror = (err) => console.error("Web Socket Error", err);

    stompClient.connect({}, onConnected, onError);

    if (event) event.preventDefault();
}

// =========================
// Bij connect
// =========================
function onConnected() {
    console.log("STOMP connected:", stompClient.connected);
    subscribeRoom(room);

    // JOIN event
    stompClient.send("/app/chat.addUser", {}, JSON.stringify({
        sender: username,
        type: 'JOIN',
        room: room
    }));

    connectingElement.classList.add('hidden');
}

// =========================
// Error handling
// =========================
function onError(error) {
    connectingElement.textContent = 'Could not connect to WebSocket server. Refresh page!';
    connectingElement.style.color = 'red';
}

// =========================
// Verstuur bericht
// =========================
function sendMessage(event) {
    const messageContent = messageInput.value.trim();
    if (messageContent && stompClient && stompClient.connected) {
        const chatMessage = {
            sender: username,
            content: messageContent,
            type: 'CHAT',
            room: room
        };
        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
        messageInput.value = '';
    }
    if (event) event.preventDefault();
}

// =========================
// Event listeners
// =========================
if (usernameForm) {
    usernameForm.addEventListener('submit', connect, true);
}
if (messageForm) {
    messageForm.addEventListener('submit', sendMessage, true);
}

// Predefined-room buttons
document.querySelectorAll('.predefined-rooms button').forEach(button => {
    button.addEventListener('click', function() {
        const newRoom = button.getAttribute('data-room');
        if (!newRoom) return;

        room = newRoom;
        if (!stompClient || !stompClient.connected) {
            connect(new Event('submit'));
        } else {
            stompClient.send("/app/chat.addUser", {}, JSON.stringify({
                sender: username,
                type: 'JOIN',
                room: room
            }));
        }
    });
});

// =========================
// Debug logs
// =========================
console.log("main.js geladen, Versie 2.3");
console.log("main.js geladen, SockJS versie:", SockJS.version);
