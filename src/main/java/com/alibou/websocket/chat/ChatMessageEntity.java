package com.alibou.websocket.chat;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChatMessageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // primaire sleutel

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ChatMessage.MessageType type; // CHAT, JOIN, LEAVE

    @Column(nullable = false, length = 1000)
    private String content;

    @Column(nullable = false)
    private String sender;

    @Column(nullable = false)
    private String room;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime timestamp;
}
