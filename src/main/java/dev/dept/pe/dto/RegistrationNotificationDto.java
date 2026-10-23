package dev.dept.pe.dto;

import java.time.LocalDateTime;

public class RegistrationNotificationDto {
    private Long notificationId;
    private String type = "NEW_STUDENT_REGISTRATION";
    private String studentName;
    private String email;
    private String registerNo;
    private String dept;
    private Long mobileNo;
    private LocalDateTime registeredAt;
    private boolean read = false;

    public RegistrationNotificationDto() {
    }

    public RegistrationNotificationDto(Long notificationId, String studentName, String email, String registerNo, String dept, Long mobileNo, LocalDateTime registeredAt) {
        this.notificationId = notificationId;
        this.studentName = studentName;
        this.email = email;
        this.registerNo = registerNo;
        this.dept = dept;
        this.mobileNo = mobileNo;
        this.registeredAt = registeredAt != null ? registeredAt : LocalDateTime.now();
        this.read = false;
    }

    public Long getNotificationId() {
        return notificationId;
    }

    public void setNotificationId(Long notificationId) {
        this.notificationId = notificationId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRegisterNo() {
        return registerNo;
    }

    public void setRegisterNo(String registerNo) {
        this.registerNo = registerNo;
    }

    public String getDept() {
        return dept;
    }

    public void setDept(String dept) {
        this.dept = dept;
    }

    public Long getMobileNo() {
        return mobileNo;
    }

    public void setMobileNo(Long mobileNo) {
        this.mobileNo = mobileNo;
    }

    public LocalDateTime getRegisteredAt() {
        return registeredAt;
    }

    public void setRegisteredAt(LocalDateTime registeredAt) {
        this.registeredAt = registeredAt;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }
}
