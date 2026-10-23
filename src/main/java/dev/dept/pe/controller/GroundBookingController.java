package dev.dept.pe.controller;

import dev.dept.pe.dto.GroundBookingDto;
import dev.dept.pe.service.GroundBookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import dev.dept.pe.model.User;
import dev.dept.pe.repository.UserRepository;
import dev.dept.pe.security.UserSession;
import dev.dept.pe.service.NotificationService;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping({"/api/ground-bookings", "/api/ground-booking"})
@CrossOrigin(originPatterns = "*")
public class GroundBookingController {

    private final GroundBookingService service;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @Autowired
    public GroundBookingController(GroundBookingService service,
                                   NotificationService notificationService,
                                   UserRepository userRepository) {
        this.service = service;
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<GroundBookingDto> create(@Valid @RequestBody GroundBookingDto dto, HttpServletRequest request) {
        UserSession session = (UserSession) request.getAttribute("userSession");
        if (dto.getUserId() == null && session != null && session.getUserId() != null) {
            dto.setUserId(session.getUserId().intValue());
        }

        GroundBookingDto saved = service.create(dto);

        // Broadcast real-time notification to Admin
        try {
            String studentName = "Student";
            String studentEmail = "";
            String registerNo = "";
            Long mobileNo = null;

            if (saved.getUserId() != null) {
                User u = userRepository.findById(saved.getUserId().longValue()).orElse(null);
                if (u != null) {
                    studentName = u.getName() != null ? u.getName() : u.getUsername();
                    studentEmail = u.getEmail();
                    registerNo = u.getRegisterNo();
                    mobileNo = u.getMobileNo();
                }
            } else if (session != null) {
                studentName = session.getUsername();
                studentEmail = session.getEmail();
            }

            notificationService.notifyBookingRequest(
                    "GROUND_BOOKING",
                    studentName,
                    studentEmail,
                    registerNo,
                    "Reserved " + saved.getGroundName() + " on " + saved.getBookingDate() + (saved.getSportType() != null ? " (" + saved.getSportType() + ")" : ""),
                    mobileNo
            );
        } catch (Exception ignored) {}

        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<GroundBookingDto>> getAll(
            @RequestParam(name = "userId", required = false) Integer userId,
            @RequestParam(name = "status", required = false) String status) {
        return ResponseEntity.ok(service.getAll(userId, status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GroundBookingDto> getById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GroundBookingDto> update(@PathVariable("id") Long id, @Valid @RequestBody GroundBookingDto dto, HttpServletRequest request) {
        UserSession session = (UserSession) request.getAttribute("userSession");
        if (session != null && session.isAdmin() && (dto.getApprovedBy() == null || dto.getApprovedBy().isEmpty())) {
            dto.setApprovedBy(session.getUsername());
        }
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
