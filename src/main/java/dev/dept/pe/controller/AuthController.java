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
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Allow frontend requests from any origin
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

        // Try to find user by email or register number (case-insensitive email)
        Optional<User> userOpt = userRepository.findByEmail(username.toLowerCase());
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByEmail(username);
        }
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByRegisterNo(username);
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
                user.getDept(),
                user.getRegisterNo(),
                user.getEmail(),
                user.getMobileNo(),
                user.getCreatedTime(),
                user.getUpdatedTime()
        );

        return ResponseEntity.ok(new LoginResponse(true, "Login successful", userDetails));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (user == null) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "User details are required"));
        }
        if (user.getName() == null || user.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Full name is required"));
        }
        if (user.getRegisterNo() == null || user.getRegisterNo().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Register number is required"));
        }
        if (user.getDept() == null || user.getDept().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Department is required"));
        }
        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Email address is required"));
        }
        if (user.getMobileNo() == null) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Mobile number is required"));
        }
        if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Password is required"));
        }

        // Clean & trim fields
        user.setName(user.getName().trim());
        user.setRegisterNo(user.getRegisterNo().trim());
        user.setDept(user.getDept().trim());
        user.setEmail(user.getEmail().trim().toLowerCase());

        // Pre-validate unique constraint fields before save
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Email is already registered: " + user.getEmail()));
        }

        if (userRepository.findByRegisterNo(user.getRegisterNo()).isPresent()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Register number is already registered: " + user.getRegisterNo()));
        }

        if (userRepository.findByMobileNo(user.getMobileNo()).isPresent()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Mobile number is already registered: " + user.getMobileNo()));
        }
        
        // Hash password with BCrypt before saving
        String hashedPassword = BCrypt.hashpw(user.getPassword(), BCrypt.gensalt());
        user.setPassword(hashedPassword);
        
        try {
            User savedUser = userRepository.save(user);
            savedUser.setPassword(null); // Do not expose password hash in response
            return ResponseEntity.ok(savedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Failed to register user: " + e.getMessage()));
        }
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }
}
