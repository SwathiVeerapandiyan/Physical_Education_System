package dev.dept.pe.controller;

import dev.dept.pe.dto.EmergencyContactDto;
import dev.dept.pe.service.EmergencyContactService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/emergency-contacts", "/api/emergency-contact"})
@CrossOrigin(origins = "*")
public class EmergencyContactController {

    private final EmergencyContactService service;

    @Autowired
    public EmergencyContactController(EmergencyContactService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<EmergencyContactDto> create(@Valid @RequestBody EmergencyContactDto dto) {
        EmergencyContactDto saved = service.create(dto);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<EmergencyContactDto>> getAll(
            @RequestParam(name = "userId", required = false) Integer userId) {
        return ResponseEntity.ok(service.getAll(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmergencyContactDto> getById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmergencyContactDto> update(@PathVariable("id") Long id, @Valid @RequestBody EmergencyContactDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
