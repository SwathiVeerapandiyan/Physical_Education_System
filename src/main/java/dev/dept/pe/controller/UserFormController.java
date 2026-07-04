package dev.dept.pe.controller;

import dev.dept.pe.dto.UserFormDto;
import dev.dept.pe.service.UserFormService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users-form")
@CrossOrigin(origins = "*")
public class UserFormController {

    private final UserFormService userFormService;

    @Autowired
    public UserFormController(UserFormService userFormService) {
        this.userFormService = userFormService;
    }

    // GET (All)
    @GetMapping
    public ResponseEntity<List<UserFormDto>> getAllUserForms() {
        List<UserFormDto> forms = userFormService.getAllUserForms();
        return ResponseEntity.ok(forms);
    }

    // GET (By ID)
    @GetMapping("/{id}")
    public ResponseEntity<UserFormDto> getUserFormById(@PathVariable("id") Long id) {
        UserFormDto formDto = userFormService.getUserFormById(id);
        return ResponseEntity.ok(formDto);
    }

    // POST (Create)
    @PostMapping
    public ResponseEntity<UserFormDto> createUserForm(@Valid @RequestBody UserFormDto userFormDto) {
        UserFormDto createdForm = userFormService.createUserForm(userFormDto);
        return new ResponseEntity<>(createdForm, HttpStatus.CREATED);
    }

    // PUT (Update)
    @PutMapping("/{id}")
    public ResponseEntity<UserFormDto> updateUserForm(@PathVariable("id") Long id,
            @Valid @RequestBody UserFormDto userFormDto) {
        UserFormDto updatedForm = userFormService.updateUserForm(id, userFormDto);
        return ResponseEntity.ok(updatedForm);
    }

    // DELETE (Delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUserForm(@PathVariable("id") Long id) {
        userFormService.deleteUserForm(id);
        return ResponseEntity.noContent().build();
    }
}
