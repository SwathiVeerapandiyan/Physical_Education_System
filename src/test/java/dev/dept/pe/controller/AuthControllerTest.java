package dev.dept.pe.controller;

import dev.dept.pe.dto.LoginRequest;
import dev.dept.pe.model.User;
import dev.dept.pe.repository.UserRepository;
import tools.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setUserId(1L);
        testUser.setName("Test User");
        testUser.setDept("PE");
        testUser.setRegisterNo("REG123");
        testUser.setEmail("test@example.com");
        testUser.setMobileNo(9876543210L);
        // Using plain text password "password123"
        testUser.setPassword("password123");
    }

    @Test
    public void login_Success_WithEmail() throws Exception {
        Mockito.when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        LoginRequest request = new LoginRequest("test@example.com", "password123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Login successful"))
                .andExpect(jsonPath("$.user.name").value("Test User"));
    }

    @Test
    public void login_Success_WithRegisterNo() throws Exception {
        Mockito.when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());
        Mockito.when(userRepository.findByRegisterNo("REG123")).thenReturn(Optional.of(testUser));

        LoginRequest request = new LoginRequest("REG123", "password123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.user.dept").value("PE"));
    }

    @Test
    public void login_Failure_InvalidPassword() throws Exception {
        Mockito.when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        LoginRequest request = new LoginRequest("test@example.com", "wrongpassword");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid username or password"));
    }
}
