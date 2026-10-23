package dev.dept.pe.controller;

import dev.dept.pe.dto.NoticeBoardDto;
import dev.dept.pe.service.NoticeBoardService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import dev.dept.pe.security.UserSession;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping({"/api/notice-board", "/api/notices"})
@CrossOrigin(originPatterns = "*")
public class NoticeBoardController {

    private final NoticeBoardService service;

    @Autowired
    public NoticeBoardController(NoticeBoardService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody NoticeBoardDto dto, HttpServletRequest request) {
        UserSession session = (UserSession) request.getAttribute("userSession");
        if (session == null || !session.isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access Denied: Only administrators can post official notices.");
        }
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
    public ResponseEntity<?> update(@PathVariable("id") Long id, @Valid @RequestBody NoticeBoardDto dto, HttpServletRequest request) {
        UserSession session = (UserSession) request.getAttribute("userSession");
        if (session == null || !session.isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access Denied: Only administrators can modify notices.");
        }
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable("id") Long id, HttpServletRequest request) {
        UserSession session = (UserSession) request.getAttribute("userSession");
        if (session == null || !session.isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access Denied: Only administrators can delete notices.");
        }
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
