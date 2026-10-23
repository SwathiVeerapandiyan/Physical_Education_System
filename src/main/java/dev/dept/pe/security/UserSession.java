package dev.dept.pe.security;

public class UserSession {
    private Long userId;
    private String username;
    private String email;
    private String role;
    private String registerNo;

    public UserSession() {}

    public UserSession(Long userId, String username, String email, String role, String registerNo) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.role = role != null ? role.toUpperCase() : "STUDENT";
        this.registerNo = registerNo;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role != null ? role.toUpperCase() : "STUDENT";
    }

    public String getRegisterNo() {
        return registerNo;
    }

    public void setRegisterNo(String registerNo) {
        this.registerNo = registerNo;
    }

    public boolean isAdmin() {
        return "ADMIN".equalsIgnoreCase(this.role);
    }
}
