package dev.dept.pe.controller;

import dev.dept.pe.dto.GalleryDto;
import dev.dept.pe.service.GalleryService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/gallery", "/api/galleries"})
@CrossOrigin(origins = "*")
public class GalleryController {

    private final GalleryService galleryService;

    @Autowired
    public GalleryController(GalleryService galleryService) {
        this.galleryService = galleryService;
    }

    @PostMapping
    public ResponseEntity<GalleryDto> create(@Valid @RequestBody GalleryDto dto) {
        GalleryDto saved = galleryService.create(dto);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<GalleryDto>> getAll(
            @RequestParam(name = "eventName", required = false) String eventName,
            @RequestParam(name = "activeOnly", required = false) Boolean activeOnly) {
        return ResponseEntity.ok(galleryService.getAll(eventName, activeOnly));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GalleryDto> getById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(galleryService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GalleryDto> update(@PathVariable("id") Long id, @Valid @RequestBody GalleryDto dto) {
        return ResponseEntity.ok(galleryService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") Long id) {
        galleryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
