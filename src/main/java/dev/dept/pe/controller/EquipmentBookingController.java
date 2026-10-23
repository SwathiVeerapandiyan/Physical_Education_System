package dev.dept.pe.controller;

import dev.dept.pe.dto.EquipmentBookingDto;
import dev.dept.pe.service.EquipmentBookingService;
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
@RequestMapping({"/api/equipment-bookings", "/api/equipment-booking"})
@CrossOrigin(originPatterns = "*")
public class EquipmentBookingController {

    private final EquipmentBookingService service;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @Autowired
    public EquipmentBookingController(EquipmentBookingService service,
                                      NotificationService notificationService,
                                      UserRepository userRepository) {
        this.service = service;
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    @PostMapping
    public ResponseEntity<EquipmentBookingDto> create(@Valid @RequestBody EquipmentBookingDto dto, HttpServletRequest request) {
        UserSession session = (UserSession) request.getAttribute("userSession");
        if (dto.getUserId() == null && session != null && session.getUserId() != null) {
            dto.setUserId(session.getUserId().intValue());
        }

        EquipmentBookingDto saved = service.create(dto);

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
                    "EQUIPMENT_BOOKING",
                    studentName,
                    studentEmail,
                    registerNo,
                    "Requested " + (saved.getQuantity() != null ? saved.getQuantity() : 1) + "x " + saved.getEquipmentName() + " on " + saved.getBookingDate(),
                    mobileNo
            );
        } catch (Exception ignored) {}

        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<EquipmentBookingDto>> getAll(
            @RequestParam(name = "userId", required = false) Integer userId,
            @RequestParam(name = "status", required = false) String status) {
        return ResponseEntity.ok(service.getAll(userId, status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EquipmentBookingDto> getById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EquipmentBookingDto> update(@PathVariable("id") Long id, @Valid @RequestBody EquipmentBookingDto dto, HttpServletRequest request) {
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
