package com.alibou.websocket.chat;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageService chatMessageService;

    // =========================
    // Verstuur bericht
    // =========================
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessage chatMessage) {
        chatMessageService.save(chatMessage);
        messagingTemplate.convertAndSend("/topic/room." + chatMessage.getRoom(), chatMessage);
    }

    // =========================
    // Voeg gebruiker toe
    // =========================
    @MessageMapping("/chat.addUser")
    public void addUser(@Payload ChatMessage chatMessage, 
                        SimpMessageHeaderAccessor headerAccessor) {

        headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());
        headerAccessor.getSessionAttributes().put("room", chatMessage.getRoom());

        // 1️⃣ JOIN bericht naar alle clients
        messagingTemplate.convertAndSend("/topic/room." + chatMessage.getRoom(), chatMessage);

        // 2️⃣ Historische berichten sturen naar **hele room** (tijdelijk test)
        List<ChatMessage> history = chatMessageService.findByRoom(chatMessage.getRoom());
        history.forEach(msg -> 
            messagingTemplate.convertAndSend("/topic/room." + chatMessage.getRoom(), msg)
        );

        // System.out.println("!@#$ Sent history to room " + chatMessage.getRoom() + ", count=" + history.size());
    }
}
