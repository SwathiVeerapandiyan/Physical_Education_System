package dev.dept.pe.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "family_details")
public class FamilyDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "family_id")
    private Long familyId;

    @Column(name = "user_form_id", unique = true, nullable = false)
    private Long userFormId;

    @Column(name = "father_name", nullable = false, length = 100)
    private String fatherName;

    @Column(name = "father_occupation", length = 100)
    private String fatherOccupation;

    @Column(name = "mother_name", nullable = false, length = 100)
    private String motherName;

    @Column(name = "mother_occupation", length = 100)
    private String motherOccupation;

    @Column(name = "siblings", length = 100)
    private String siblings;

    @Column(name = "sibling_occupation", length = 100)
    private String siblingOccupation;

    @Column(name = "created_time", insertable = false, updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdTime;

    @Column(name = "updated_time", insertable = false, updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime updatedTime;

    // Constructors
    public FamilyDetails() {
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
