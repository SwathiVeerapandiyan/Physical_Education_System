package dev.dept.pe.dto;

import java.time.LocalDateTime;

public class SportsDetailsDto {
    private Long sportId;
    private String sportName;
    private String category;
    private String coachName;
    private String description;
    private LocalDateTime createdTime;
    private LocalDateTime updatedTime;

    public SportsDetailsDto() {}

    public SportsDetailsDto(Long sportId, String sportName, String category, String coachName, String description,
                            LocalDateTime createdTime, LocalDateTime updatedTime) {
        this.sportId = sportId;
        this.sportName = sportName;
        this.category = category;
        this.coachName = coachName;
        this.description = description;
        this.createdTime = createdTime;
        this.updatedTime = updatedTime;
    }

    public Long getSportId() { return sportId; }
    public void setSportId(Long sportId) { this.sportId = sportId; }
    public String getSportName() { return sportName; }
    public void setSportName(String sportName) { this.sportName = sportName; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getCoachName() { return coachName; }
    public void setCoachName(String coachName) { this.coachName = coachName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDateTime getCreatedTime() { return createdTime; }
    public void setCreatedTime(LocalDateTime createdTime) { this.createdTime = createdTime; }
    public LocalDateTime getUpdatedTime() { return updatedTime; }
    public void setUpdatedTime(LocalDateTime updatedTime) { this.updatedTime = updatedTime; }
}
