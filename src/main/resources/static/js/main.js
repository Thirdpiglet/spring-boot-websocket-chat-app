'use strict';

document.addEventListener("DOMContentLoaded", () => {

    console.log("🔥 main.js geladen, Versie 4.1 🔥");
    console.log("SockJS versie:", SockJS?.version);

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

    // =========================
    // DOM elementen
    // =========================
    const usernamePage = document.querySelector('#username-page');
    const chatPage = document.querySelector('#chat-page');
    const usernameForm = document.querySelector('#usernameForm');
    const messageForm = document.querySelector('#messageForm');
    const messageInput = document.querySelector('#message');
    const messageArea = document.querySelector('#messageArea');
    const connectingElement = document.querySelector('.connecting');
    const roomButtons = document.querySelectorAll('.predefined-rooms button');

    if (!usernamePage || !chatPage || !messageArea) {
        console.error("❌ DOM elementen ontbreken — check HTML IDs");
        return;
    }

    // =========================
    // Avatar kleur
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

            messageElement.textContent =
                `${hh}:${mm} ${message.sender}: ${message.content}`;

            messageArea.prepend(messageElement);

        } else {

            if (message.type === 'JOIN' || message.type === 'LEAVE') {
                messageElement.classList.add('event-message');
                message.content =
                    message.type === 'JOIN'
                        ? `${message.sender} joined!`
                        : `${message.sender} left!`;
            } else {

                messageElement.classList.add('chat-message');

                const avatarElement = document.createElement('i');

                const name = message.sender?.toLowerCase();

                const avatars = {
                    toine: '/toineAvatar.webp',
                    ilona: '/ilonaAvatar.webp',
                    sandra: '/sandraAvatar.webp',
                    olga: '/olgaAvatar.webp',
                    stoffel: '/stoffelAvatar.webp',
                    anne: '/anneAvatar.webp',
                    teet: '/leontineAvatar.webp'
                };

                if (avatars[name]) {
                    const img = document.createElement('img');
                    img.src = avatars[name];
                    img.style.width = '100%';
                    img.style.height = '100%';
                    img.style.borderRadius = '50%';
                    img.style.objectFit = 'cover';
                    avatarElement.appendChild(img);
                } else {
                    avatarElement.textContent = message.sender?.[0] ?? '?';
                    avatarElement.style.backgroundColor =
                        getAvatarColor(message.sender ?? '?');
                }

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
    // Subscribe room
    // =========================
    function subscribeRoom(roomName) {
        if (subscribedRooms.has(roomName)) return;

        subscribedRooms.add(roomName);

        stompClient.subscribe(`/topic/room.${roomName}`, payload => {
            displayMessage(JSON.parse(payload.body));
        });
    }

    // =========================
    // Connect
    // =========================
    function connect(event) {

        if (stompClient?.connected) return;

        username =
            username ||
            document.querySelector('#name')?.value.trim() ||
            'Anonymous';

        room = room || 'general';

        if (!username || !room) return;

        usernamePage.classList.add('hidden');
        chatPage.classList.remove('hidden');

        const socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);

        socket.onopen = () => console.log("🟢 WebSocket open");
        socket.onclose = () => console.log("🔴 WebSocket closed");
        socket.onerror = err => console.error("WebSocket error", err);

        stompClient.connect({}, onConnected, onError);

        event?.preventDefault();
    }

    // =========================
    // On connected
    // =========================
    function onConnected() {

        console.log("✅ STOMP connected");

        subscribeRoom(room);

        stompClient.send("/app/chat.addUser", {}, JSON.stringify({
            sender: username,
            type: 'JOIN',
            room
        }));

        connectingElement?.classList.add('hidden');
    }

    // =========================
    // Error
    // =========================
    function onError(error) {
        console.error(error);

        if (connectingElement) {
            connectingElement.textContent =
                'Could not connect to WebSocket server.';
            connectingElement.style.color = 'red';
        }
    }

    // =========================
    // Send message
    // =========================
    function sendMessage(event) {

        const content = messageInput.value.trim();

        if (content && stompClient?.connected) {

            stompClient.send("/app/chat.sendMessage", {}, JSON.stringify({
                sender: username,
                content,
                type: 'CHAT',
                room
            }));

            messageInput.value = '';
        }

        event?.preventDefault();
    }

    // =========================
    // Event listeners
    // =========================
    usernameForm?.addEventListener('submit', connect);
    messageForm?.addEventListener('submit', sendMessage);

    roomButtons.forEach(button => {

        button.addEventListener('click', () => {

            const newRoom = button.dataset.room;
            if (!newRoom) return;

            room = newRoom;

            console.log("➡️ Room gekozen:", room);

            if (!stompClient?.connected) {
                connect(new Event('submit'));
            } else {
                stompClient.send("/app/chat.addUser", {}, JSON.stringify({
                    sender: username,
                    type: 'JOIN',
                    room
                }));
            }
        });
    });

    console.log("🧹 main.js init klaar");
});
