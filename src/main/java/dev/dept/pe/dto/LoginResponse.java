package dev.dept.pe.dto;

import java.time.LocalDateTime;

public class LoginResponse {
    private boolean success;
    private String message;
    private UserDetails user;

    public LoginResponse() {
    }

    public LoginResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public LoginResponse(boolean success, String message, UserDetails user) {
        this.success = success;
        this.message = message;
        this.user = user;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public UserDetails getUser() {
        return user;
    }

    public void setUser(UserDetails user) {
        this.user = user;
    }

    public static class UserDetails {
        private Long userId;
        private String name;
        private String username;
        private String dept;
        private String registerNo;
        private String email;
        private String role;
        private Long mobileNo;
        private LocalDateTime createdTime;
        private LocalDateTime updatedTime;

        public UserDetails() {
        }

        public UserDetails(Long userId, String name, String username, String dept, String registerNo, String email, String role, Long mobileNo, LocalDateTime createdTime, LocalDateTime updatedTime) {
            this.userId = userId;
            this.name = name;
            this.username = username;
            this.dept = dept;
            this.registerNo = registerNo;
            this.email = email;
            this.role = role;
            this.mobileNo = mobileNo;
            this.createdTime = createdTime;
            this.updatedTime = updatedTime;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }

        public Long getUserId() {
            return userId;
        }

        public void setUserId(Long userId) {
            this.userId = userId;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getDept() {
            return dept;
        }

        public void setDept(String dept) {
            this.dept = dept;
        }

        public String getRegisterNo() {
            return registerNo;
        }

        public void setRegisterNo(String registerNo) {
            this.registerNo = registerNo;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public Long getMobileNo() {
            return mobileNo;
        }

        public void setMobileNo(Long mobileNo) {
            this.mobileNo = mobileNo;
        }

        public LocalDateTime getCreatedTime() {
            return createdTime;
        }

        public void setCreatedTime(LocalDateTime createdTime) {
            this.createdTime = createdTime;
        }

        public LocalDateTime getUpdatedTime() {
            return updatedTime;
        }

        public void setUpdatedTime(LocalDateTime updatedTime) {
            this.updatedTime = updatedTime;
        }
    }
}
