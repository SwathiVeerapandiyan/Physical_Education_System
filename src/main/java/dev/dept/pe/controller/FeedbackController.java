package dev.dept.pe.controller;

import dev.dept.pe.dto.FeedbackDto;
import dev.dept.pe.service.FeedbackService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/feedback", "/api/feedbacks"})
@CrossOrigin(origins = "*")
public class FeedbackController {

    private final FeedbackService service;

    @Autowired
    public FeedbackController(FeedbackService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<FeedbackDto> create(@Valid @RequestBody FeedbackDto dto) {
        FeedbackDto saved = service.create(dto);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<FeedbackDto>> getAll(
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "userId", required = false) Integer userId) {
        return ResponseEntity.ok(service.getAll(status, userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FeedbackDto> getById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FeedbackDto> update(@PathVariable("id") Long id, @Valid @RequestBody FeedbackDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
