package com.alibou.websocket.config;

import com.alibou.websocket.chat.ChatMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
@Slf4j
@RequiredArgsConstructor
public class WebSocketEventListener {

    private final SimpMessageSendingOperations messagingTemplate;

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {

        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        var sessionAttributes = headerAccessor.getSessionAttributes();
        if (sessionAttributes == null) {
            return;
        }

        String username = (String) sessionAttributes.get("username");
        String room = (String) sessionAttributes.get("room");

        if (username != null && room != null) {
            log.info("user disconnected: {} from room {}", username, room);

            ChatMessage chatMessage = ChatMessage.builder()
                    .type(ChatMessage.MessageType.LEAVE) // nested enum
                    .sender(username)
                    .room(room) // belangrijk!
                    .build();

            messagingTemplate.convertAndSend(
                    "/topic/room." + room,
                    chatMessage
            );
        }
    }
}
