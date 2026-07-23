package dev.dept.pe.controller;

import dev.dept.pe.dto.NoticeBoardDto;
import dev.dept.pe.service.NoticeBoardService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/notice-board", "/api/notices"})
@CrossOrigin(origins = "*")
public class NoticeBoardController {

    private final NoticeBoardService service;

    @Autowired
    public NoticeBoardController(NoticeBoardService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<NoticeBoardDto> create(@Valid @RequestBody NoticeBoardDto dto) {
        NoticeBoardDto saved = service.create(dto);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<NoticeBoardDto>> getAll(
            @RequestParam(name = "category", required = false) String category,
            @RequestParam(name = "activeOnly", required = false) Boolean activeOnly) {
        return ResponseEntity.ok(service.getAll(category, activeOnly));
    }

    @GetMapping("/{id}")
    public ResponseEntity<NoticeBoardDto> getById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NoticeBoardDto> update(@PathVariable("id") Long id, @Valid @RequestBody NoticeBoardDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
