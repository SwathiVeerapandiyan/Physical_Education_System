package dev.dept.pe.controller;

import dev.dept.pe.dto.DocumentDetailsDto;
import dev.dept.pe.dto.UserFormDto;
import dev.dept.pe.security.UserSession;
import dev.dept.pe.service.DocumentDetailsService;
import dev.dept.pe.service.UserFormService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/document-details")
@CrossOrigin(originPatterns = "*")
public class DocumentDetailsController {

    private final DocumentDetailsService documentDetailsService;
    private final UserFormService userFormService;

    @Autowired
    public DocumentDetailsController(DocumentDetailsService documentDetailsService,
                                     UserFormService userFormService) {
        this.documentDetailsService = documentDetailsService;
        this.userFormService = userFormService;
    }

    // GET (Current Student's Own Documents)
    @GetMapping("/my-documents")
    public ResponseEntity<?> getMyDocuments(HttpServletRequest request) {
        UserSession session = (UserSession) request.getAttribute("userSession");
        if (session == null || session.getEmail() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            UserFormDto form = userFormService.getUserFormByEmail(session.getEmail());
            DocumentDetailsDto dto = documentDetailsService.getDocumentDetailsByUserFormId(form.getId());
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.noContent().build();
        }
    }

    // POST (Insert/Associate documents)
    @PostMapping
    public ResponseEntity<?> createDocumentDetails(@Valid @RequestBody DocumentDetailsDto documentDetailsDto, HttpServletRequest request) {
        UserSession session = (UserSession) request.getAttribute("userSession");

        if (session != null && !session.isAdmin()) {
            try {
                UserFormDto form = userFormService.getUserFormById(documentDetailsDto.getUserFormId());
                if (!form.getEmail().equalsIgnoreCase(session.getEmail())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: You cannot upload documents for another student.");
                }
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid candidate profile reference.");
            }
        }

        DocumentDetailsDto savedDto = documentDetailsService.createDocumentDetails(documentDetailsDto);
        return new ResponseEntity<>(savedDto, HttpStatus.CREATED);
    }

    // GET (Get by PK)
    @GetMapping("/{id}")
    public ResponseEntity<?> getDocumentDetailsById(@PathVariable("id") Long id, HttpServletRequest request) {
        UserSession session = (UserSession) request.getAttribute("userSession");
        DocumentDetailsDto dto = documentDetailsService.getDocumentDetailsById(id);

        if (session != null && !session.isAdmin()) {
            try {
                UserFormDto form = userFormService.getUserFormById(dto.getUserFormId());
                if (!form.getEmail().equalsIgnoreCase(session.getEmail())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: You cannot view another student's documents.");
                }
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied.");
            }
        }

        return ResponseEntity.ok(dto);
    }

    // GET (Get by Candidate Form ID)
    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<?> getDocumentDetailsByCandidateId(@PathVariable("candidateId") Long candidateId, HttpServletRequest request) {
        UserSession session = (UserSession) request.getAttribute("userSession");

        if (session != null && !session.isAdmin()) {
            try {
                UserFormDto form = userFormService.getUserFormById(candidateId);
                if (!form.getEmail().equalsIgnoreCase(session.getEmail())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: You cannot view another student's documents.");
                }
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied.");
            }
        }

        DocumentDetailsDto dto = documentDetailsService.getDocumentDetailsByUserFormId(candidateId);
        return ResponseEntity.ok(dto);
    }

    // PUT (Update document paths)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateDocumentDetails(@PathVariable("id") Long id,
                                                   @Valid @RequestBody DocumentDetailsDto documentDetailsDto,
                                                   HttpServletRequest request) {
        UserSession session = (UserSession) request.getAttribute("userSession");

        if (session != null && !session.isAdmin()) {
            DocumentDetailsDto existing = documentDetailsService.getDocumentDetailsById(id);
            try {
                UserFormDto form = userFormService.getUserFormById(existing.getUserFormId());
                if (!form.getEmail().equalsIgnoreCase(session.getEmail())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: You cannot modify another student's documents.");
                }
                documentDetailsDto.setUserFormId(form.getId());
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied.");
            }
        }

        DocumentDetailsDto updatedDto = documentDetailsService.updateDocumentDetails(id, documentDetailsDto);
        return ResponseEntity.ok(updatedDto);
    }

    // DELETE (Delete documents record)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocumentDetails(@PathVariable("id") Long id, HttpServletRequest request) {
        UserSession session = (UserSession) request.getAttribute("userSession");
        if (session != null && !session.isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: Only administrators can delete records.");
        }
        documentDetailsService.deleteDocumentDetails(id);
        return ResponseEntity.noContent().build();
    }
}

