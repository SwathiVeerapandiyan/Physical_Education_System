package dev.dept.pe.controller;

import dev.dept.pe.dto.UserFormDto;
import dev.dept.pe.security.UserSession;
import dev.dept.pe.service.UserFormService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/users-form")
@CrossOrigin(originPatterns = "*")
public class UserFormController {

    private final UserFormService userFormService;

    @Autowired
    public UserFormController(UserFormService userFormService) {
        this.userFormService = userFormService;
    }

    // GET (All - Admin Only)
    @GetMapping
    public ResponseEntity<?> getAllUserForms(HttpServletRequest request) {
        UserSession session = (UserSession) request.getAttribute("userSession");
        if (session != null && !session.isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: Only administrators can view all student records.");
        }
        List<UserFormDto> forms = userFormService.getAllUserForms();
        return ResponseEntity.ok(forms);
    }

    // GET (Current Student's Own Profile)
    @GetMapping("/me")
    public ResponseEntity<UserFormDto> getMyUserForm(HttpServletRequest request) {
        UserSession session = (UserSession) request.getAttribute("userSession");
        if (session == null || session.getEmail() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            UserFormDto formDto = userFormService.getUserFormByEmail(session.getEmail());
            return ResponseEntity.ok(formDto);
        } catch (Exception e) {
            // Auto-initialize base form for current user if not found
            UserFormDto newForm = new UserFormDto();
            newForm.setName(session.getUsername());
            newForm.setEmail(session.getEmail());
            newForm.setPassword("Secure@123");
            newForm.setBatch("2024-2025");
            newForm.setGender("MALE");
            newForm.setDob(LocalDate.of(2003, 1, 1));
            newForm.setMobileNo(9876543210L);
            newForm.setSpecialization("Athletics");
            newForm.setPermanentAddress("Campus Residence");
            UserFormDto created = userFormService.createUserForm(newForm);
            return ResponseEntity.ok(created);
        }
    }

    // PUT (Update Current Student's Own Profile)
    @PutMapping("/me")
    public ResponseEntity<?> updateMyUserForm(HttpServletRequest request,
                                              @Valid @RequestBody UserFormDto userFormDto) {
        UserSession session = (UserSession) request.getAttribute("userSession");
        if (session == null || session.getEmail() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // Ensure email matches session
        userFormDto.setEmail(session.getEmail());

        try {
            UserFormDto existing = userFormService.getUserFormByEmail(session.getEmail());
            UserFormDto updated = userFormService.updateUserForm(existing.getId(), userFormDto);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            // If doesn't exist, create it
            userFormDto.setPassword(userFormDto.getPassword() != null && !userFormDto.getPassword().isEmpty() ? userFormDto.getPassword() : "Secure@123");
            UserFormDto created = userFormService.createUserForm(userFormDto);
            return ResponseEntity.ok(created);
        }
    }

    // GET (By ID - Admin or Owner only)
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserFormById(@PathVariable("id") Long id, HttpServletRequest request) {
        UserSession session = (UserSession) request.getAttribute("userSession");
        UserFormDto formDto = userFormService.getUserFormById(id);

        if (session != null && !session.isAdmin()) {
            if (formDto.getEmail() == null || !formDto.getEmail().equalsIgnoreCase(session.getEmail())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Access Denied: You cannot view another student's personal information.");
            }
        }

        return ResponseEntity.ok(formDto);
    }

    // POST (Create)
    @PostMapping
    public ResponseEntity<UserFormDto> createUserForm(@Valid @RequestBody UserFormDto userFormDto, HttpServletRequest request) {
        UserSession session = (UserSession) request.getAttribute("userSession");
        if (session != null && !session.isAdmin()) {
            userFormDto.setEmail(session.getEmail());
        }
        UserFormDto createdForm = userFormService.createUserForm(userFormDto);
        return new ResponseEntity<>(createdForm, HttpStatus.CREATED);
    }

    // PUT (Update by ID - Admin or Owner only)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUserForm(@PathVariable("id") Long id,
                                            @Valid @RequestBody UserFormDto userFormDto,
                                            HttpServletRequest request) {
        UserSession session = (UserSession) request.getAttribute("userSession");
        UserFormDto existing = userFormService.getUserFormById(id);

        if (session != null && !session.isAdmin()) {
            if (existing.getEmail() == null || !existing.getEmail().equalsIgnoreCase(session.getEmail())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Access Denied: You cannot modify another student's personal information.");
            }
            // Enforce caller's email
            userFormDto.setEmail(session.getEmail());
        }

        UserFormDto updatedForm = userFormService.updateUserForm(id, userFormDto);
        return ResponseEntity.ok(updatedForm);
    }

    // DELETE (Delete - Admin Only)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUserForm(@PathVariable("id") Long id, HttpServletRequest request) {
        UserSession session = (UserSession) request.getAttribute("userSession");
        if (session != null && !session.isAdmin()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: Only administrators can delete records.");
        }
        userFormService.deleteUserForm(id);
        return ResponseEntity.noContent().build();
    }
}

