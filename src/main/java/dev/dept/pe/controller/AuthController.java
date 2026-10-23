package dev.dept.pe.controller;

import dev.dept.pe.dto.LoginRequest;
import dev.dept.pe.dto.LoginResponse;
import dev.dept.pe.model.User;
import dev.dept.pe.model.UserForm;
import dev.dept.pe.repository.UserRepository;
import dev.dept.pe.repository.UserFormRepository;
import dev.dept.pe.security.TokenService;
import dev.dept.pe.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.web.bind.annotation.*;

import dev.dept.pe.service.UserFormService;
import java.time.LocalDate;
import java.util.Optional;
import java.util.List;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(originPatterns = "*") // Allow frontend requests with credentials from any origin
public class AuthController {

    private final UserRepository userRepository;
    private final UserFormRepository userFormRepository;
    private final UserFormService userFormService;
    private final TokenService tokenService;
    private final NotificationService notificationService;

    @Autowired
    public AuthController(UserRepository userRepository,
                          UserFormRepository userFormRepository,
                          UserFormService userFormService,
                          TokenService tokenService,
                          NotificationService notificationService) {
        this.userRepository = userRepository;
        this.userFormRepository = userFormRepository;
        this.userFormService = userFormService;
        this.tokenService = tokenService;
        this.notificationService = notificationService;
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

        // Try to find user by email, register number, name, username, or mobile number
        Optional<User> userOpt = userRepository.findByEmail(username);
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByRegisterNo(username);
        }
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByName(username);
        }
        if (userOpt.isEmpty()) {
            userOpt = userRepository.findByUsername(username);
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

        // Enforce role separation if login requested for a specific portal
        if (loginRequest.getRequiredRole() != null && !loginRequest.getRequiredRole().trim().isEmpty()) {
            String reqRole = loginRequest.getRequiredRole().trim().toUpperCase();
            String userRole = user.getRole() != null ? user.getRole().trim().toUpperCase() : "STUDENT";
            if ("ADMIN".equals(reqRole) && !"ADMIN".equals(userRole)) {
                return ResponseEntity.status(403).body(new LoginResponse(false, "Access Denied: Only administrators are authorized to log in through the Admin Portal."));
            }
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

        // Generate verified session token
        String token = tokenService.generateToken(user);

        return ResponseEntity.ok(new LoginResponse(true, "Login successful", userDetails, token));
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

            // Automatically initialize baseline student profile form in users_form if not present
            try {
                if (userFormRepository.findByEmail(savedUser.getEmail()).isEmpty()) {
                    UserForm form = new UserForm();
                    form.setName(savedUser.getName());
                    form.setEmail(savedUser.getEmail());
                    form.setPassword(savedUser.getPassword());
                    form.setBatch("2024-2025");
                    form.setGender("MALE");
                    form.setDob(LocalDate.of(2003, 1, 1));
                    form.setMobileNo(savedUser.getMobileNo());
                    form.setSpecialization("Athletics");
                    form.setPermanentAddress("Student Campus Residence");
                    userFormRepository.save(form);
                }
            } catch (Exception ignored) {
            }

            // Immediately broadcast real-time notification to active admin dashboards
            try {
                notificationService.notifyNewStudentRegistration(savedUser);
            } catch (Exception ignored) {
            }

            return ResponseEntity.ok(savedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to register user: " + e.getMessage());
        }
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable("id") Long id) {
        Optional<User> opt = userRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        User user = opt.get();
        // If related UserForm exists, delete it safely (cascading family & doc)
        if (user.getEmail() != null) {
            userFormRepository.findByEmail(user.getEmail().trim()).ifPresent(uf -> {
                userFormService.deleteUserForm(uf.getId());
            });
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok("User deleted successfully");
    }
}
