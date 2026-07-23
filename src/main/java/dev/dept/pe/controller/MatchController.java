package dev.dept.pe.controller;

import dev.dept.pe.dto.MatchDto;
import dev.dept.pe.service.MatchService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matches")
@CrossOrigin(origins = "*")
public class MatchController {

    private final MatchService matchService;

    @Autowired
    public MatchController(MatchService matchService) {
        this.matchService = matchService;
    }

    @PostMapping
    public ResponseEntity<MatchDto> create(@Valid @RequestBody MatchDto dto) {
        MatchDto saved = matchService.create(dto);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<MatchDto>> getAll(@RequestParam(name = "tournamentId", required = false) Long tournamentId) {
        if (tournamentId != null) {
            return ResponseEntity.ok(matchService.getByTournamentId(tournamentId));
        }
        return ResponseEntity.ok(matchService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MatchDto> getById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(matchService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MatchDto> update(@PathVariable("id") Long id, @Valid @RequestBody MatchDto dto) {
        return ResponseEntity.ok(matchService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        matchService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
