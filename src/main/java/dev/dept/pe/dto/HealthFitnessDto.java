package dev.dept.pe.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class HealthFitnessDto {

    private Long recordId;
    private Integer userId;
    private BigDecimal heightCm;
    private BigDecimal weightKg;
    private BigDecimal bmi;
    private String bloodGroup;
    private Integer heartRate;
    private String fitnessLevel;
    private String medicalConditions;
    private String allergies;
    private String emergencyNotes;
    private LocalDate lastCheckup;
    private LocalDateTime createdAt;

    public HealthFitnessDto() {}

    public Long getRecordId() { return recordId; }
    public void setRecordId(Long recordId) { this.recordId = recordId; }

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public BigDecimal getHeightCm() { return heightCm; }
    public void setHeightCm(BigDecimal heightCm) { this.heightCm = heightCm; }
    public Double getHeight() { return heightCm != null ? heightCm.doubleValue() : null; }
    public void setHeight(Double height) { if (height != null && this.heightCm == null) this.heightCm = BigDecimal.valueOf(height); }

    public BigDecimal getWeightKg() { return weightKg; }
    public void setWeightKg(BigDecimal weightKg) { this.weightKg = weightKg; }
    public Double getWeight() { return weightKg != null ? weightKg.doubleValue() : null; }
    public void setWeight(Double weight) { if (weight != null && this.weightKg == null) this.weightKg = BigDecimal.valueOf(weight); }

    public BigDecimal getBmi() { return bmi; }
    public void setBmi(BigDecimal bmi) { this.bmi = bmi; }

    public String getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }

    public Integer getHeartRate() { return heartRate; }
    public void setHeartRate(Integer heartRate) { this.heartRate = heartRate; }

    public String getFitnessLevel() { return fitnessLevel; }
    public void setFitnessLevel(String fitnessLevel) { this.fitnessLevel = fitnessLevel; }

    public String getMedicalConditions() { return medicalConditions; }
    public void setMedicalConditions(String medicalConditions) { this.medicalConditions = medicalConditions; }

    public String getAllergies() { return allergies; }
    public void setAllergies(String allergies) { this.allergies = allergies; }

    public String getEmergencyNotes() { return emergencyNotes; }
    public void setEmergencyNotes(String emergencyNotes) { this.emergencyNotes = emergencyNotes; }

    public LocalDate getLastCheckup() { return lastCheckup; }
    public void setLastCheckup(LocalDate lastCheckup) { this.lastCheckup = lastCheckup; }
    public String getLastCheckupDate() { return lastCheckup != null ? lastCheckup.toString() : null; }
    public void setLastCheckupDate(String s) {
        if (s != null && !s.trim().isEmpty()) {
            try { this.lastCheckup = LocalDate.parse(s.trim()); } catch (Exception ignored) {}
        }
    }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

