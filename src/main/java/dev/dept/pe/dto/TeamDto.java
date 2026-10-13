package dev.dept.pe.dto;

import java.time.LocalDateTime;

public class TeamDto {
    private Long teamId;
    private String teamName;
    private Long sportId;
    private String captainName;
    private String department;
    private LocalDateTime createdTime;
    private LocalDateTime updatedTime;

    public TeamDto() {}

    public Long getTeamId() { return teamId; }
    public void setTeamId(Long teamId) { this.teamId = teamId; }
    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }
    public Long getSportId() { return sportId; }
    public void setSportId(Long sportId) { this.sportId = sportId; }
    public String getCaptainName() { return captainName; }
    public void setCaptainName(String captainName) { this.captainName = captainName; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public LocalDateTime getCreatedTime() { return createdTime; }
    public void setCreatedTime(LocalDateTime createdTime) { this.createdTime = createdTime; }
    public LocalDateTime getUpdatedTime() { return updatedTime; }
    public void setUpdatedTime(LocalDateTime updatedTime) { this.updatedTime = updatedTime; }

}
