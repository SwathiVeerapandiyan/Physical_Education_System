package dev.dept.pe.controller;

import dev.dept.pe.dto.FamilyDetailsDto;
import dev.dept.pe.dto.UserFormDto;
import dev.dept.pe.security.UserSession;
import dev.dept.pe.service.FamilyDetailsService;
import dev.dept.pe.service.UserFormService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/family-details")
@CrossOrigin(originPatterns = "*")
public class FamilyDetailsController {

    private final FamilyDetailsService familyDetailsService;
    private final UserFormService userFormService;

    @Autowired
    public FamilyDetailsController(FamilyDetailsService familyDetailsService,
                                   UserFormService userFormService) {
        this.familyDetailsService = familyDetailsService;
        this.userFormService = userFormService;
    }

    // GET (Current Student's Own Family Details)
    @GetMapping("/my-family")
    public ResponseEntity<?> getMyFamilyDetails(HttpServletRequest request) {
        UserSession session = (UserSession) request.getAttribute("userSession");
        if (session == null || session.getEmail() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            UserFormDto form = userFormService.getUserFormByEmail(session.getEmail());
            FamilyDetailsDto dto = familyDetailsService.getFamilyDetailsByUserFormId(form.getId());
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            return ResponseEntity.noContent().build();
        }
    }

    // POST (Create)
    @PostMapping
    public ResponseEntity<?> createFamilyDetails(@Valid @RequestBody FamilyDetailsDto familyDetailsDto, HttpServletRequest request) {
        UserSession session = (UserSession) request.getAttribute("userSession");

        if (session != null && !session.isAdmin()) {
            // Verify that userFormId belongs to this student
            try {
                UserFormDto form = userFormService.getUserFormById(familyDetailsDto.getUserFormId());
                if (!form.getEmail().equalsIgnoreCase(session.getEmail())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: You cannot create family details for another student.");
                }
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid candidate profile reference.");
            }
        }

        FamilyDetailsDto savedDto = familyDetailsService.createFamilyDetails(familyDetailsDto);
        return new ResponseEntity<>(savedDto, HttpStatus.CREATED);
    }

    // GET (By ID)
    @GetMapping("/{id}")
    public ResponseEntity<?> getFamilyDetailsById(@PathVariable("id") Long id, HttpServletRequest request) {
        UserSession session = (UserSession) request.getAttribute("userSession");
        FamilyDetailsDto dto = familyDetailsService.getFamilyDetailsById(id);

        if (session != null && !session.isAdmin()) {
            try {
                UserFormDto form = userFormService.getUserFormById(dto.getUserFormId());
                if (!form.getEmail().equalsIgnoreCase(session.getEmail())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: You cannot view another student's family details.");
                }
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied.");
            }
        }

        return ResponseEntity.ok(dto);
    }

    // GET (By Candidate Form ID)
    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<?> getFamilyDetailsByCandidateId(@PathVariable("candidateId") Long candidateId, HttpServletRequest request) {
        UserSession session = (UserSession) request.getAttribute("userSession");

        if (session != null && !session.isAdmin()) {
            try {
                UserFormDto form = userFormService.getUserFormById(candidateId);
                if (!form.getEmail().equalsIgnoreCase(session.getEmail())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: You cannot view another student's family details.");
                }
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied.");
            }
        }

        FamilyDetailsDto dto = familyDetailsService.getFamilyDetailsByUserFormId(candidateId);
        return ResponseEntity.ok(dto);
    }

    // PUT (Update)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateFamilyDetails(@PathVariable("id") Long id,
                                                 @Valid @RequestBody FamilyDetailsDto familyDetailsDto,
                                                 HttpServletRequest request) {
        UserSession session = (UserSession) request.getAttribute("userSession");

        if (session != null && !session.isAdmin()) {
            FamilyDetailsDto existing = familyDetailsService.getFamilyDetailsById(id);
            try {
                UserFormDto form = userFormService.getUserFormById(existing.getUserFormId());
                if (!form.getEmail().equalsIgnoreCase(session.getEmail())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: You cannot modify another student's family details.");
                }
                // Enforce caller's own form ID
                familyDetailsDto.setUserFormId(form.getId());
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied.");
            }
        }

        FamilyDetailsDto updatedDto = familyDetailsService.updateFamilyDetails(id, familyDetailsDto);
        return ResponseEntity.ok(updatedDto);
    }

    // DELETE (Delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFamilyDetails(@PathVariable("id") Long id, HttpServletRequest request) {
        UserSession session = (UserSession) request.getAttribute("userSession");
        if (session != null && !session.isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: Only administrators can delete records.");
        }
        familyDetailsService.deleteFamilyDetails(id);
        return ResponseEntity.noContent().build();
    }
}

