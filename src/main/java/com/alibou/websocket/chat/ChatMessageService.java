package com.alibou.websocket.chat;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatMessageService {

    private final ChatMessageRepository repository;

    // =========================
    // Opslaan van een ChatMessage (DTO) als entity
    // =========================
    public ChatMessage save(ChatMessage message) {

        // 1️⃣ Log dat we een bericht gaan opslaan
        // System.out.println("Saving message: sender=" + message.getSender()
        //         + ", room=" + message.getRoom()
        //         + ", type=" + message.getType()
        //         + ", content=" + message.getContent());

        // 2️⃣ Maak entity van DTO
        ChatMessageEntity entity = ChatMessageEntity.builder()
                .sender(message.getSender())
                .room(message.getRoom())
                .content(message.getContent())
                .timestamp(LocalDateTime.now())
                .type(message.getType()) // type van DTO overnemen
                .build();

        // 3️⃣ Opslaan in DB
        ChatMessageEntity saved = repository.save(entity);

        // 4️⃣ Log dat opslag gelukt is
        // System.out.println("Message saved with ID: " + saved.getId());

        // 5️⃣ Zet terug naar DTO en return
        return ChatMessage.builder()
                .sender(saved.getSender())
                .room(saved.getRoom())
                .content(saved.getContent())
                .timestamp(saved.getTimestamp())
                .type(saved.getType())
                .build();
    }

    // =========================
    // Historie ophalen per room
    // =========================
    public List<ChatMessage> findByRoom(String room) {
        List<ChatMessageEntity> entities = repository.findByRoomOrderByTimestampAsc(room);

        // 1️⃣ Log aantal berichten dat opgehaald wordt
        // System.out.println("Fetching " + entities.size() + " messages for room: " + room);

        // 2️⃣ Map naar DTO
        return entities.stream().map(entity -> ChatMessage.builder()
                .sender(entity.getSender())
                .room(entity.getRoom())
                .content(entity.getContent())
                .timestamp(entity.getTimestamp())
                .type(entity.getType())
                .build()
        ).toList();
    }
}
        