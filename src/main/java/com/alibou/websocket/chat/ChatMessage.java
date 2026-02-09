package com.alibou.websocket.chat;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatMessage {

    public enum MessageType {
        CHAT,
        JOIN,
        LEAVE
    }

    @Enumerated(EnumType.STRING)
    private MessageType type;

    private String content;
    private String sender;
    private String room;
    private LocalDateTime timestamp;
}
