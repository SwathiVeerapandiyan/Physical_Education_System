package dev.dept.pe.controller;

import dev.dept.pe.dto.LiveScoreDto;
import dev.dept.pe.service.LiveScoreService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/live-scores", "/api/live-score"})
@CrossOrigin(origins = "*")
public class LiveScoreController {

    private final LiveScoreService service;

    @Autowired
    public LiveScoreController(LiveScoreService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<LiveScoreDto> create(@Valid @RequestBody LiveScoreDto dto) {
        LiveScoreDto saved = service.create(dto);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<LiveScoreDto>> getAll(
            @RequestParam(name = "sportType", required = false) String sportType,
            @RequestParam(name = "status", required = false) String status) {
        return ResponseEntity.ok(service.getAll(sportType, status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LiveScoreDto> getById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LiveScoreDto> update(@PathVariable("id") Long id, @Valid @RequestBody LiveScoreDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
