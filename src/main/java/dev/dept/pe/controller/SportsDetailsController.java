package dev.dept.pe.controller;

import dev.dept.pe.dto.SportsDetailsDto;
import dev.dept.pe.service.SportsDetailsService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sports")
@CrossOrigin(origins = "*")
public class SportsDetailsController {

    private final SportsDetailsService sportsDetailsService;

    @Autowired
    public SportsDetailsController(SportsDetailsService sportsDetailsService) {
        this.sportsDetailsService = sportsDetailsService;
    }

    @PostMapping
    public ResponseEntity<SportsDetailsDto> create(@Valid @RequestBody SportsDetailsDto dto) {
        SportsDetailsDto saved = sportsDetailsService.create(dto);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<SportsDetailsDto>> getAll() {
        return ResponseEntity.ok(sportsDetailsService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SportsDetailsDto> getById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(sportsDetailsService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SportsDetailsDto> update(@PathVariable("id") Long id, @Valid @RequestBody SportsDetailsDto dto) {
        return ResponseEntity.ok(sportsDetailsService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        sportsDetailsService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
