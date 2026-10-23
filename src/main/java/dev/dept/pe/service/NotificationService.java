package dev.dept.pe.service;

import dev.dept.pe.dto.RegistrationNotificationDto;
import dev.dept.pe.model.User;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class NotificationService {

    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();
    private final List<RegistrationNotificationDto> recentNotifications = new CopyOnWriteArrayList<>();
    private final AtomicLong idSequence = new AtomicLong(1);

    public SseEmitter subscribe() {
        // 30 minute timeout
        SseEmitter emitter = new SseEmitter(30 * 60 * 1000L);
        emitters.add(emitter);

        emitter.onCompletion(() -> emitters.remove(emitter));
        emitter.onTimeout(() -> {
            emitter.complete();
            emitters.remove(emitter);
        });
        emitter.onError((ex) -> {
            emitter.complete();
            emitters.remove(emitter);
        });

        // Send initial connection event with current timestamp
        try {
            emitter.send(SseEmitter.event()
                    .name("CONNECTED")
                    .data("Connected to Real-time Notification Stream"));
        } catch (IOException e) {
            emitters.remove(emitter);
        }

        return emitter;
    }

    public RegistrationNotificationDto notifyNewStudentRegistration(User user) {
        RegistrationNotificationDto notification = new RegistrationNotificationDto(
                idSequence.getAndIncrement(),
                user.getName(),
                user.getEmail(),
                user.getRegisterNo(),
                user.getDept(),
                user.getMobileNo(),
                LocalDateTime.now()
        );

        // Store at beginning of recent notifications list (most recent first)
        recentNotifications.add(0, notification);
        if (recentNotifications.size() > 50) {
            recentNotifications.remove(recentNotifications.size() - 1);
        }

        // Broadcast to all active subscribers
        List<SseEmitter> deadEmitters = new ArrayList<>();
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("STUDENT_REGISTERED")
                        .data(notification));
            } catch (Exception e) {
                deadEmitters.add(emitter);
            }
        }
        emitters.removeAll(deadEmitters);

        return notification;
    }

    public List<RegistrationNotificationDto> getRecentNotifications() {
        return Collections.unmodifiableList(recentNotifications);
    }

    public long getUnreadCount() {
        return recentNotifications.stream().filter(n -> !n.isRead()).count();
    }

    public void markAsRead(Long notificationId) {
        if (notificationId == null) {
            recentNotifications.forEach(n -> n.setRead(true));
        } else {
            recentNotifications.stream()
                    .filter(n -> n.getNotificationId().equals(notificationId))
                    .findFirst()
                    .ifPresent(n -> n.setRead(true));
        }
    }
}
