package dev.dept.pe.controller;

import dev.dept.pe.dto.TournamentRegistrationDto;
import dev.dept.pe.service.TournamentRegistrationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tournament-registrations")
@CrossOrigin(origins = "*")
public class TournamentRegistrationController {

    private final TournamentRegistrationService registrationService;

    @Autowired
    public TournamentRegistrationController(TournamentRegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @PostMapping
    public ResponseEntity<TournamentRegistrationDto> create(@Valid @RequestBody TournamentRegistrationDto dto) {
        TournamentRegistrationDto saved = registrationService.create(dto);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TournamentRegistrationDto> getById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(registrationService.getById(id));
    }

    @GetMapping("/tournament/{tournamentId}")
    public ResponseEntity<List<TournamentRegistrationDto>> getByTournamentId(@PathVariable("tournamentId") Long tournamentId) {
        return ResponseEntity.ok(registrationService.getByTournamentId(tournamentId));
    }

    @GetMapping("/team/{teamId}")
    public ResponseEntity<List<TournamentRegistrationDto>> getByTeamId(@PathVariable("teamId") Long teamId) {
        return ResponseEntity.ok(registrationService.getByTeamId(teamId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TournamentRegistrationDto> update(@PathVariable("id") Long id, @Valid @RequestBody TournamentRegistrationDto dto) {
        return ResponseEntity.ok(registrationService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        registrationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
