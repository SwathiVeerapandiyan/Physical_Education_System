package dev.dept.pe.controller;

import dev.dept.pe.dto.FamilyDetailsDto;
import dev.dept.pe.service.FamilyDetailsService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/family-details")
@CrossOrigin(origins = "*")
public class FamilyDetailsController {

    private final FamilyDetailsService familyDetailsService;

    @Autowired
    public FamilyDetailsController(FamilyDetailsService familyDetailsService) {
        this.familyDetailsService = familyDetailsService;
    }

    // POST (Create)
    @PostMapping
    public ResponseEntity<FamilyDetailsDto> createFamilyDetails(@Valid @RequestBody FamilyDetailsDto familyDetailsDto) {
        FamilyDetailsDto savedDto = familyDetailsService.createFamilyDetails(familyDetailsDto);
        return new ResponseEntity<>(savedDto, HttpStatus.CREATED);
    }

    // GET (By ID)
    @GetMapping("/{id}")
    public ResponseEntity<FamilyDetailsDto> getFamilyDetailsById(@PathVariable("id") Long id) {
        FamilyDetailsDto dto = familyDetailsService.getFamilyDetailsById(id);
        return ResponseEntity.ok(dto);
    }

    // GET (By Candidate Form ID)
    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<FamilyDetailsDto> getFamilyDetailsByCandidateId(@PathVariable("candidateId") Long candidateId) {
        FamilyDetailsDto dto = familyDetailsService.getFamilyDetailsByUserFormId(candidateId);
        return ResponseEntity.ok(dto);
    }

    // PUT (Update)
    @PutMapping("/{id}")
    public ResponseEntity<FamilyDetailsDto> updateFamilyDetails(@PathVariable("id") Long id,
                                                                @Valid @RequestBody FamilyDetailsDto familyDetailsDto) {
        FamilyDetailsDto updatedDto = familyDetailsService.updateFamilyDetails(id, familyDetailsDto);
        return ResponseEntity.ok(updatedDto);
    }

    // DELETE (Delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFamilyDetails(@PathVariable("id") Long id) {
        familyDetailsService.deleteFamilyDetails(id);
        return ResponseEntity.noContent().build();
    }
}
