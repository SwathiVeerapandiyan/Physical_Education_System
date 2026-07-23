package dev.dept.pe.controller;

import dev.dept.pe.dto.TeamMemberDto;
import dev.dept.pe.service.TeamMemberService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/team-members")
@CrossOrigin(origins = "*")
public class TeamMemberController {

    private final TeamMemberService teamMemberService;

    @Autowired
    public TeamMemberController(TeamMemberService teamMemberService) {
        this.teamMemberService = teamMemberService;
    }

    @PostMapping
    public ResponseEntity<TeamMemberDto> create(@Valid @RequestBody TeamMemberDto dto) {
        TeamMemberDto saved = teamMemberService.create(dto);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TeamMemberDto> getById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(teamMemberService.getById(id));
    }

    @GetMapping("/team/{teamId}")
    public ResponseEntity<List<TeamMemberDto>> getByTeamId(@PathVariable("teamId") Long teamId) {
        return ResponseEntity.ok(teamMemberService.getByTeamId(teamId));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<TeamMemberDto>> getByStudentId(@PathVariable("studentId") Long studentId) {
        return ResponseEntity.ok(teamMemberService.getByStudentId(studentId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        teamMemberService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
