package dev.dept.pe.controller;

import dev.dept.pe.dto.TournamentDto;
import dev.dept.pe.service.TournamentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tournaments")
@CrossOrigin(origins = "*")
public class TournamentController {

    private final TournamentService tournamentService;

    @Autowired
    public TournamentController(TournamentService tournamentService) {
        this.tournamentService = tournamentService;
    }

    @PostMapping
    public ResponseEntity<TournamentDto> create(@Valid @RequestBody TournamentDto dto) {
        TournamentDto saved = tournamentService.create(dto);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<TournamentDto>> getAll(@RequestParam(name = "status", required = false) String status) {
        if (status != null && !status.trim().isEmpty()) {
            return ResponseEntity.ok(tournamentService.getByStatus(status));
        }
        return ResponseEntity.ok(tournamentService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TournamentDto> getById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(tournamentService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TournamentDto> update(@PathVariable("id") Long id, @Valid @RequestBody TournamentDto dto) {
        return ResponseEntity.ok(tournamentService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        tournamentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
