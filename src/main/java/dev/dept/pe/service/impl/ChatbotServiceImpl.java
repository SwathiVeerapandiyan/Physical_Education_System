package dev.dept.pe.service.impl;

import dev.dept.pe.dto.ChatMessageDto;
import dev.dept.pe.dto.ChatOptionDto;
import dev.dept.pe.service.ChatbotService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class ChatbotServiceImpl implements ChatbotService {

    @Override
    public ChatMessageDto getWelcomeMessage() {
        ChatMessageDto botMsg = new ChatMessageDto("bot", "Welcome to Madras Christian College - Department of Physical Education! How may I assist you today?");
        botMsg.setId(UUID.randomUUID().toString());
        botMsg.setCategory("WELCOME");
        botMsg.setSuggestedOptions(getQuickOptions());
        return botMsg;
    }

    @Override
    public List<ChatOptionDto> getQuickOptions() {
        List<ChatOptionDto> options = new ArrayList<>();
        options.add(new ChatOptionDto("faq", "FAQ", "ACTION_FAQ", null));
        options.add(new ChatOptionDto("ground", "Ground Booking", "ACTION_GROUND", null));
        options.add(new ChatOptionDto("equipment", "Equipment Rental", "ACTION_EQUIPMENT", null));
        options.add(new ChatOptionDto("tournament", "Tournaments & Matches", "ACTION_TOURNAMENT", null));
        options.add(new ChatOptionDto("email", "Send Us Email", "ACTION_EMAIL", null));
        options.add(new ChatOptionDto("goodbye", "GoodBye", "ACTION_GOODBYE", null));
        return options;
    }

    @Override
    public List<ChatMessageDto> getFaqs() {
        List<ChatMessageDto> faqs = new ArrayList<>();

        ChatMessageDto faq1 = new ChatMessageDto("bot", "Q: How do I book a sports ground?\nA: Navigate to 'Ground Bookings' from the sidebar, select your preferred ground, time slot, and submit the booking request.");
        faq1.setCategory("FAQ");
        faqs.add(faq1);

        ChatMessageDto faq2 = new ChatMessageDto("bot", "Q: What are the Department operating hours?\nA: The Physical Education Sports Complex is open Monday through Saturday from 6:00 AM to 7:00 PM.");
        faq2.setCategory("FAQ");
        faqs.add(faq2);

        ChatMessageDto faq3 = new ChatMessageDto("bot", "Q: How can I request sports equipment?\nA: Go to 'Equipment Bookings' section, choose the required sports gear, specify quantity and duration, then submit for approval.");
        faq3.setCategory("FAQ");
        faqs.add(faq3);

        ChatMessageDto faq4 = new ChatMessageDto("bot", "Q: Where can I check live scores for ongoing matches?\nA: Click on 'Live Scoreboard' in the main menu to view real-time updates and match statistics.");
        faq4.setCategory("FAQ");
        faqs.add(faq4);

        return faqs;
    }

    @Override
    public ChatMessageDto processMessage(ChatMessageDto userMessage) {
        String msg = userMessage.getMessage() != null ? userMessage.getMessage().toLowerCase().trim() : "";
        String quickAction = userMessage.getQuickOption();

        ChatMessageDto response = new ChatMessageDto();
        response.setId(UUID.randomUUID().toString());
        response.setSessionId(userMessage.getSessionId());
        response.setSender("bot");
        response.setTimestamp(LocalDateTime.now());

        // Handle specific action pills
        if ("ACTION_FAQ".equalsIgnoreCase(quickAction) || msg.contains("faq")) {
            response.setMessage("Here are some Frequently Asked Questions:\n\n1. How to book a ground?\n2. How to rent equipment?\n3. Operating hours & contacts\n4. Tournament registration details.\n\nSelect an option below or type your question!");
            response.setCategory("FAQ");
            response.setSuggestedOptions(getQuickOptions());
            return response;
        }

        if ("ACTION_EMAIL".equalsIgnoreCase(quickAction) || msg.contains("email") || msg.contains("contact")) {
            response.setMessage("📧 You can reach out directly to the PE Department at:\nEmail: pe.dept@mcc.edu.in\nPhone: +91 44 2239 0675 / +91 44 2239 6272\nAddress: Department of Physical Education, Madras Christian College, Tambaram, Chennai - 600059.");
            response.setCategory("CONTACT");
            response.setSuggestedOptions(getQuickOptions());
            return response;
        }

        if ("ACTION_GOODBYE".equalsIgnoreCase(quickAction) || msg.contains("bye") || msg.contains("goodbye")) {
            response.setMessage("Thank you for connecting with MCC Physical Education Portal. Have a energetic and active day! 🏆👋");
            response.setCategory("GOODBYE");
            List<ChatOptionDto> resetOptions = new ArrayList<>();
            resetOptions.add(new ChatOptionDto("restart", "Start New Chat", "ACTION_RESTART", null));
            response.setSuggestedOptions(resetOptions);
            return response;
        }

        if ("ACTION_GROUND".equalsIgnoreCase(quickAction) || msg.contains("ground") || msg.contains("court") || msg.contains("field") || msg.contains("turf")) {
            response.setMessage("🏟️ Ground Bookings:\nYou can reserve MCC Main Football Ground, Cricket Oval, Basketball Courts, and Tennis Courts online. Visit the 'Ground Bookings' section in your portal dashboard to request slot allocations.");
            response.setCategory("GROUND");
            response.setSuggestedOptions(Arrays.asList(
                    new ChatOptionDto("equip", "Rent Equipment", "ACTION_EQUIPMENT", null),
                    new ChatOptionDto("tourn", "View Tournaments", "ACTION_TOURNAMENT", null),
                    new ChatOptionDto("main", "Main Menu", "ACTION_RESTART", null)
            ));
            return response;
        }

        if ("ACTION_EQUIPMENT".equalsIgnoreCase(quickAction) || msg.contains("equipment") || msg.contains("bat") || msg.contains("ball") || msg.contains("racket") || msg.contains("net")) {
            response.setMessage("🏀 Equipment Rental:\nWe offer Footballs, Basketballs, Cricket Kits, Badminton Rackets, and Volleyball nets. Request gear directly via the 'Equipment Bookings' page.");
            response.setCategory("EQUIPMENT");
            response.setSuggestedOptions(Arrays.asList(
                    new ChatOptionDto("grnd", "Book Ground", "ACTION_GROUND", null),
                    new ChatOptionDto("email", "Send Email", "ACTION_EMAIL", null),
                    new ChatOptionDto("main", "Main Menu", "ACTION_RESTART", null)
            ));
            return response;
        }

        if ("ACTION_TOURNAMENT".equalsIgnoreCase(quickAction) || msg.contains("tournament") || msg.contains("match") || msg.contains("fixture") || msg.contains("score")) {
            response.setMessage("🏆 Tournaments & Matches:\nCheck out active campus tournaments, upcoming fixtures, team registration statuses, and live match scores in the 'Tournaments' and 'Live Scoreboard' sections.");
            response.setCategory("TOURNAMENTS");
            response.setSuggestedOptions(Arrays.asList(
                    new ChatOptionDto("faq", "FAQ", "ACTION_FAQ", null),
                    new ChatOptionDto("main", "Main Menu", "ACTION_RESTART", null)
            ));
            return response;
        }

        if ("ACTION_RESTART".equalsIgnoreCase(quickAction)) {
            return getWelcomeMessage();
        }

        // Natural Language Processing fallback & keyword matching
        if (msg.contains("hi") || msg.contains("hello") || msg.contains("hey")) {
            response.setMessage("Hello! Welcome to Madras Christian College PE Assistant ✋. How can I help you today?");
            response.setSuggestedOptions(getQuickOptions());
        } else if (msg.contains("hours") || msg.contains("time") || msg.contains("timing") || msg.contains("open")) {
            response.setMessage("⏰ Department Operating Hours:\nMonday to Saturday: 6:00 AM - 7:00 PM\nSunday & Holidays: Special Events Only.");
            response.setSuggestedOptions(getQuickOptions());
        } else if (msg.contains("health") || msg.contains("fitness") || msg.contains("bmi") || msg.contains("medical")) {
            response.setMessage("🩺 Health & Fitness Module:\nYou can log fitness records, track BMI, and update medical clearance reports under the 'Health & Fitness' tab.");
            response.setSuggestedOptions(getQuickOptions());
        } else if (msg.contains("emergency") || msg.contains("doctor") || msg.contains("first aid")) {
            response.setMessage("🚨 Emergency Contacts:\nCampus Medical Center: +91 44 2239 0100\nPE Emergency Help Desk: +91 94440 12345");
            response.setSuggestedOptions(getQuickOptions());
        } else {
            response.setMessage("Thank you for your message! For specific assistance regarding ground reservations, sports equipment, tournaments, or live scores, please choose an option below or email pe.dept@mcc.edu.in.");
            response.setSuggestedOptions(getQuickOptions());
        }

        return response;
    }
}
