package dev.dept.pe.service;

import dev.dept.pe.dto.ChatMessageDto;
import dev.dept.pe.dto.ChatOptionDto;

import java.util.List;

public interface ChatbotService {
    ChatMessageDto processMessage(ChatMessageDto userMessage);
    List<ChatOptionDto> getQuickOptions();
    List<ChatMessageDto> getFaqs();
    ChatMessageDto getWelcomeMessage();
}
