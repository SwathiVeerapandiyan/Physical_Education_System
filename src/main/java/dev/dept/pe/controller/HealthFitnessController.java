package dev.dept.pe.controller;

import dev.dept.pe.dto.HealthFitnessDto;
import dev.dept.pe.service.HealthFitnessService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/health-fitness", "/api/health"})
@CrossOrigin(origins = "*")
public class HealthFitnessController {

    private final HealthFitnessService service;

    @Autowired
    public HealthFitnessController(HealthFitnessService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<HealthFitnessDto> create(@Valid @RequestBody HealthFitnessDto dto) {
        HealthFitnessDto saved = service.create(dto);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<HealthFitnessDto>> getAll(
            @RequestParam(name = "userId", required = false) Integer userId) {
        return ResponseEntity.ok(service.getAll(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<HealthFitnessDto> getById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<HealthFitnessDto> getByUserId(@PathVariable("userId") Integer userId) {
        return ResponseEntity.ok(service.getByUserId(userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<HealthFitnessDto> update(@PathVariable("id") Long id, @Valid @RequestBody HealthFitnessDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
