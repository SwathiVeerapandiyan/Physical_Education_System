package dev.dept.pe.controller;

import dev.dept.pe.dto.EquipmentBookingDto;
import dev.dept.pe.service.EquipmentBookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/equipment-bookings", "/api/equipment-booking"})
@CrossOrigin(origins = "*")
public class EquipmentBookingController {

    private final EquipmentBookingService service;

    @Autowired
    public EquipmentBookingController(EquipmentBookingService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<EquipmentBookingDto> create(@Valid @RequestBody EquipmentBookingDto dto) {
        EquipmentBookingDto saved = service.create(dto);
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
    public ResponseEntity<EquipmentBookingDto> update(@PathVariable("id") Long id, @Valid @RequestBody EquipmentBookingDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
