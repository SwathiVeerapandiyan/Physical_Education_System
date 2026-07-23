package dev.dept.pe.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ChatMessageDto {
    private String id;
    private String sessionId;
    private String sender; // "user" or "bot"
    private String message;
    private String category;
    private String quickOption;
    private List<ChatOptionDto> suggestedOptions;
    private LocalDateTime timestamp;

    public ChatMessageDto() {
        this.timestamp = LocalDateTime.now();
    }

    public ChatMessageDto(String sender, String message) {
        this.sender = sender;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public String getSender() { return sender; }
    public void setSender(String sender) { this.sender = sender; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getQuickOption() { return quickOption; }
    public void setQuickOption(String quickOption) { this.quickOption = quickOption; }

    public List<ChatOptionDto> getSuggestedOptions() { return suggestedOptions; }
    public void setSuggestedOptions(List<ChatOptionDto> suggestedOptions) { this.suggestedOptions = suggestedOptions; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
