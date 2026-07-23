package dev.dept.pe.controller;

import dev.dept.pe.dto.TeamDto;
import dev.dept.pe.service.TeamService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
@CrossOrigin(origins = "*")
public class TeamController {

    private final TeamService teamService;

    @Autowired
    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    @PostMapping
    public ResponseEntity<TeamDto> create(@Valid @RequestBody TeamDto dto) {
        TeamDto saved = teamService.create(dto);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<TeamDto>> getAll(@RequestParam(name = "sportId", required = false) Long sportId) {
        if (sportId != null) {
            return ResponseEntity.ok(teamService.getBySportId(sportId));
        }
        return ResponseEntity.ok(teamService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TeamDto> getById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(teamService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TeamDto> update(@PathVariable("id") Long id, @Valid @RequestBody TeamDto dto) {
        return ResponseEntity.ok(teamService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        teamService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
