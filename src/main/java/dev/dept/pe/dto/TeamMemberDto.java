package dev.dept.pe.dto;

import java.time.LocalDate;

public class TeamMemberDto {
    private Long teamMemberId;
    private Long teamId;
    private Long studentId;
    private LocalDate joinedDate;

    private String role;
    private String studentName;

    public TeamMemberDto() {}

    public Long getTeamMemberId() { return teamMemberId; }
    public void setTeamMemberId(Long teamMemberId) { this.teamMemberId = teamMemberId; }
    public Long getId() { return teamMemberId; }
    public void setId(Long id) { if (this.teamMemberId == null) this.teamMemberId = id; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public Long getTeamId() { return teamId; }
    public void setTeamId(Long teamId) { this.teamId = teamId; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public LocalDate getJoinedDate() { return joinedDate; }
    public void setJoinedDate(LocalDate joinedDate) { this.joinedDate = joinedDate; }

}
