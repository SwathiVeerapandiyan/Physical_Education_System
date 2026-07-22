package dev.dept.pe.controller;

import dev.dept.pe.dto.DocumentDetailsDto;
import dev.dept.pe.service.DocumentDetailsService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/document-details")
@CrossOrigin(origins = "*")
public class DocumentDetailsController {

    private final DocumentDetailsService documentDetailsService;

    @Autowired
    public DocumentDetailsController(DocumentDetailsService documentDetailsService) {
        this.documentDetailsService = documentDetailsService;
    }

    // POST (Insert/Associate documents)
    @PostMapping
    public ResponseEntity<DocumentDetailsDto> createDocumentDetails(@Valid @RequestBody DocumentDetailsDto documentDetailsDto) {
        DocumentDetailsDto savedDto = documentDetailsService.createDocumentDetails(documentDetailsDto);
        return new ResponseEntity<>(savedDto, HttpStatus.CREATED);
    }

    // GET (Get by PK)
    @GetMapping("/{id}")
    public ResponseEntity<DocumentDetailsDto> getDocumentDetailsById(@PathVariable("id") Long id) {
        DocumentDetailsDto dto = documentDetailsService.getDocumentDetailsById(id);
        return ResponseEntity.ok(dto);
    }

    // GET (Get by Candidate Form ID)
    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<DocumentDetailsDto> getDocumentDetailsByCandidateId(@PathVariable("candidateId") Long candidateId) {
        DocumentDetailsDto dto = documentDetailsService.getDocumentDetailsByUserFormId(candidateId);
        return ResponseEntity.ok(dto);
    }

    // PUT (Update document paths)
    @PutMapping("/{id}")
    public ResponseEntity<DocumentDetailsDto> updateDocumentDetails(@PathVariable("id") Long id,
                                                                    @Valid @RequestBody DocumentDetailsDto documentDetailsDto) {
        DocumentDetailsDto updatedDto = documentDetailsService.updateDocumentDetails(id, documentDetailsDto);
        return ResponseEntity.ok(updatedDto);
    }

    // DELETE (Delete documents record)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocumentDetails(@PathVariable("id") Long id) {
        documentDetailsService.deleteDocumentDetails(id);
        return ResponseEntity.noContent().build();
    }
}
