package com.alibou.websocket;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
// import org.springframework.boot.CommandLineRunner;
// import org.springframework.context.annotation.Bean;

// import com.alibou.websocket.chat.ChatMessage;
// import com.alibou.websocket.chat.ChatMessageEntity;
// import com.alibou.websocket.chat.ChatMessageRepository;
// import com.alibou.websocket.chat.MessageType;

@SpringBootApplication
public class ChatApplication {

    public static void main(String[] args) {
        SpringApplication.run(ChatApplication.class, args);
    }

    // =========================
    // Test DB: lezen én schrijven
    // =========================
    // @Bean
    // public CommandLineRunner testDb(ChatMessageRepository repository) {
    //     return args -> {
    //         System.out.println("=== Test DB content (before insert) ===");
    //         repository.findAll().forEach(msg ->
    //             System.out.println(msg.getId() + " | " + msg.getRoom() + " | " + msg.getSender() + " | " + msg.getContent())
    //         );

    //         // Testbericht toevoegen
    //         ChatMessageEntity testMessage = ChatMessageEntity.builder()
    //                 .sender("TestUser")
    //                 .room("testroom")
    //                 .content("Hello DB!")
    //                 .type(ChatMessage.MessageType.CHAT)
    //                 .build();
    //         repository.save(testMessage);

    //         System.out.println("=== Test DB content (after insert) ===");
    //         repository.findAll().forEach(msg ->
    //             System.out.println(msg.getId() + " | " + msg.getRoom() + " | " + msg.getSender() + " | " + msg.getContent())
    //         );
    //     };
    // }
}
