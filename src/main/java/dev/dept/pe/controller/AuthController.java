package dev.dept.pe.controller;

import dev.dept.pe.dto.LoginRequest;
import dev.dept.pe.dto.LoginResponse;
import dev.dept.pe.model.User;
import dev.dept.pe.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.List;

@RestController
@RequestMapping({"/api/auth", "/api/users", "/api/user"})
@CrossOrigin(originPatterns = "*") // Allow frontend requests with credentials from any origin
public class AuthController {

    private final UserRepository userRepository;

    @Autowired
    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest) {
        // Validate input
        if (loginRequest == null || loginRequest.getUsername() == null || loginRequest.getPassword() == null 
                || loginRequest.getUsername().trim().isEmpty() || loginRequest.getPassword().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new LoginResponse(false, "Username and password are required"));
        }

        String username = loginRequest.getUsername().trim();
        String password = loginRequest.getPassword();

        // Try to find user by email, register number, name, username, or mobile number (case-insensitive)
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(username);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByRegisterNoIgnoreCase(username);
        }
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByUsernameIgnoreCase(username);
        }
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByNameIgnoreCase(username);
        }
        if (userOpt.isEmpty()) {
            try {
                Long mobile = Long.parseLong(username);
                userOpt = userRepository.findByMobileNo(mobile);
            } catch (NumberFormatException ignored) {}
        }

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(new LoginResponse(false, "Invalid username or password"));
        }

        User user = userOpt.get();

        // Verify password (supports plain-text for development and BCrypt for secure storage)
        boolean passwordMatches = false;
        String dbPassword = user.getPassword();

        if (password.equals(dbPassword)) {
            passwordMatches = true;
        } else {
            try {
                // If it looks like a BCrypt hash, check it
                if (dbPassword != null && (dbPassword.startsWith("$2a$") || dbPassword.startsWith("$2b$") || dbPassword.startsWith("$2y$"))) {
                    passwordMatches = BCrypt.checkpw(password, dbPassword);
                }
            } catch (Exception e) {
                // Ignore hash parse errors, fall through to false
            }
        }

        if (!passwordMatches) {
            return ResponseEntity.status(401).body(new LoginResponse(false, "Invalid username or password"));
        }

        // Map User entity to UserDetails DTO to avoid exposing the password
        LoginResponse.UserDetails userDetails = new LoginResponse.UserDetails(
                user.getUserId(),
                user.getName(),
                user.getUsername() != null ? user.getUsername() : user.getName(),
                user.getDept(),
                user.getRegisterNo(),
                user.getEmail(),
                user.getRole() != null ? user.getRole() : "STUDENT",
                user.getMobileNo(),
                user.getCreatedTime(),
                user.getUpdatedTime()
        );

        return ResponseEntity.ok(new LoginResponse(true, "Login successful", userDetails));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (user == null || user.getEmail() == null || user.getPassword() == null) {
            return ResponseEntity.badRequest().body("Email and password are required");
        }

        if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
            user.setUsername(user.getName() != null ? user.getName() : user.getEmail().split("@")[0]);
        }
        if (user.getRole() == null || user.getRole().trim().isEmpty()) {
            user.setRole("STUDENT");
        }


        // Pre-validate unique constraint fields before save
        if (user.getEmail() != null && userRepository.findByEmail(user.getEmail().trim()).isPresent()) {
            return ResponseEntity.badRequest().body("Email is already registered: " + user.getEmail());
        }

        if (user.getRegisterNo() != null && userRepository.findByRegisterNo(user.getRegisterNo().trim()).isPresent()) {
            return ResponseEntity.badRequest().body("Register number is already registered: " + user.getRegisterNo());
        }

        if (user.getMobileNo() != null && userRepository.findByMobileNo(user.getMobileNo()).isPresent()) {
            return ResponseEntity.badRequest().body("Mobile number is already registered: " + user.getMobileNo());
        }
        
        // Hash password with BCrypt before saving
        String hashedPassword = BCrypt.hashpw(user.getPassword(), BCrypt.gensalt());
        user.setPassword(hashedPassword);
        
        try {
            User savedUser = userRepository.save(user);
            return ResponseEntity.ok(savedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to register user: " + e.getMessage());
        }
    }

    @GetMapping({"/users", ""})
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable("id") Long id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable("id") Long id, @RequestBody User updatedData) {
        return userRepository.findById(id).map(user -> {
            if (updatedData.getName() != null) user.setName(updatedData.getName());
            if (updatedData.getDept() != null) user.setDept(updatedData.getDept());
            if (updatedData.getEmail() != null) user.setEmail(updatedData.getEmail());
            if (updatedData.getRegisterNo() != null) user.setRegisterNo(updatedData.getRegisterNo());
            if (updatedData.getMobileNo() != null) user.setMobileNo(updatedData.getMobileNo());
            if (updatedData.getRole() != null) user.setRole(updatedData.getRole());
            if (updatedData.getUsername() != null) user.setUsername(updatedData.getUsername());
            userRepository.save(user);
            return ResponseEntity.ok(user);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable("id") Long id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
