package dev.dept.pe.controller;

import dev.dept.pe.dto.ChatMessageDto;
import dev.dept.pe.dto.ChatOptionDto;
import dev.dept.pe.service.ChatbotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/chatbot", "/api/chat"})
@CrossOrigin(origins = "*")
public class ChatbotController {

    private final ChatbotService chatbotService;

    @Autowired
    public ChatbotController(ChatbotService chatbotService) {
        this.chatbotService = chatbotService;
    }

    @GetMapping("/welcome")
    public ResponseEntity<ChatMessageDto> getWelcomeMessage() {
        return ResponseEntity.ok(chatbotService.getWelcomeMessage());
    }

    @GetMapping("/options")
    public ResponseEntity<List<ChatOptionDto>> getQuickOptions() {
        return ResponseEntity.ok(chatbotService.getQuickOptions());
    }

    @GetMapping("/faqs")
    public ResponseEntity<List<ChatMessageDto>> getFaqs() {
        return ResponseEntity.ok(chatbotService.getFaqs());
    }

    @PostMapping("/message")
    public ResponseEntity<ChatMessageDto> processMessage(@RequestBody ChatMessageDto userMessage) {
        ChatMessageDto reply = chatbotService.processMessage(userMessage);
        return ResponseEntity.ok(reply);
    }
}
