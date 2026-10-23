package dev.dept.pe.controller;

import dev.dept.pe.dto.RegistrationNotificationDto;
import dev.dept.pe.model.User;
import dev.dept.pe.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(originPatterns = "*")
public class NotificationController {

    private final NotificationService notificationService;

    @Autowired
    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamNotifications() {
        return notificationService.subscribe();
    }

    @GetMapping
    public ResponseEntity<List<RegistrationNotificationDto>> getNotifications() {
        return ResponseEntity.ok(notificationService.getRecentNotifications());
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Object>> getUnreadCount() {
        Map<String, Object> resp = new HashMap<>();
        resp.put("unreadCount", notificationService.getUnreadCount());
        return ResponseEntity.ok(resp);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable("id") Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        notificationService.markAsRead(null);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/test")
    public ResponseEntity<RegistrationNotificationDto> testNotification(@RequestParam(defaultValue = "Sample Student") String name) {
        User testUser = new User();
        testUser.setName(name);
        testUser.setEmail(name.toLowerCase().replace(" ", ".") + "@example.com");
        testUser.setRegisterNo("TEST" + (System.currentTimeMillis() % 10000));
        testUser.setDept("Physical Education");
        testUser.setMobileNo(9000000000L + (System.currentTimeMillis() % 1000000000L));
        return ResponseEntity.ok(notificationService.notifyNewStudentRegistration(testUser));
    }
}
