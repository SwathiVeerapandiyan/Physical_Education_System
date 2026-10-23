package dev.dept.pe.dto;

public class LoginRequest {
    private String username; // Can be email, register_no, name, username
    private String password;
    private String requiredRole; // Optional: "ADMIN" or "STUDENT"

    public LoginRequest() {
    }

    public LoginRequest(String username, String password) {
        this.username = username;
        this.password = password;
    }

    public LoginRequest(String username, String password, String requiredRole) {
        this.username = username;
        this.password = password;
        this.requiredRole = requiredRole;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRequiredRole() {
        return requiredRole;
    }

    public void setRequiredRole(String requiredRole) {
        this.requiredRole = requiredRole;
    }
}

