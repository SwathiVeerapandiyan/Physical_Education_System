package dev.dept.pe.controller;

import dev.dept.pe.dto.GroundBookingDto;
import dev.dept.pe.service.GroundBookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/ground-bookings", "/api/ground-booking"})
@CrossOrigin(origins = "*")
public class GroundBookingController {

    private final GroundBookingService service;

    @Autowired
    public GroundBookingController(GroundBookingService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<GroundBookingDto> create(@Valid @RequestBody GroundBookingDto dto) {
        GroundBookingDto saved = service.create(dto);
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
    public ResponseEntity<GroundBookingDto> update(@PathVariable("id") Long id, @Valid @RequestBody GroundBookingDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
