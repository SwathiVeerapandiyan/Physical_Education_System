package dev.dept.pe.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public class FamilyDetailsDto {

    private Long familyId;

    @NotNull(message = "User form ID is required")
    private Long userFormId;

    @NotBlank(message = "Father name is required")
    @Size(max = 100, message = "Father name must not exceed 100 characters")
    private String fatherName;

    @Size(max = 100, message = "Father occupation must not exceed 100 characters")
    private String fatherOccupation;

    @NotBlank(message = "Mother name is required")
    @Size(max = 100, message = "Mother name must not exceed 100 characters")
    private String motherName;

    @Size(max = 100, message = "Mother occupation must not exceed 100 characters")
    private String motherOccupation;

    @Size(max = 100, message = "Siblings details must not exceed 100 characters")
    private String siblings;

    @Size(max = 100, message = "Sibling occupation must not exceed 100 characters")
    private String siblingOccupation;

    private LocalDateTime createdTime;
    private LocalDateTime updatedTime;

    // Constructors
    public FamilyDetailsDto() {
    }

    // Getters and Setters
    public Long getFamilyId() {
        return familyId;
    }

    public void setFamilyId(Long familyId) {
        this.familyId = familyId;
    }

    public Long getUserFormId() {
        return userFormId;
    }

    public void setUserFormId(Long userFormId) {
        this.userFormId = userFormId;
    }

    public String getFatherName() {
        return fatherName;
    }

    public void setFatherName(String fatherName) {
        this.fatherName = fatherName;
    }

    public String getFatherOccupation() {
        return fatherOccupation;
    }

    public void setFatherOccupation(String fatherOccupation) {
        this.fatherOccupation = fatherOccupation;
    }

    public String getMotherName() {
        return motherName;
    }

    public void setMotherName(String motherName) {
        this.motherName = motherName;
    }

    public String getMotherOccupation() {
        return motherOccupation;
    }

    public void setMotherOccupation(String motherOccupation) {
        this.motherOccupation = motherOccupation;
    }

    public String getSiblings() {
        return siblings;
    }

    public void setSiblings(String siblings) {
        this.siblings = siblings;
    }

    public String getSiblingOccupation() {
        return siblingOccupation;
    }

    public void setSiblingOccupation(String siblingOccupation) {
        this.siblingOccupation = siblingOccupation;
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
