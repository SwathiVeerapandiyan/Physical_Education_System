package dev.dept.pe.dto;

import java.time.LocalDate;

public class TeamMemberDto {
    private Long teamMemberId;
    private Long teamId;
    private Long studentId;
    private LocalDate joinedDate;

    public TeamMemberDto() {}

    public Long getTeamMemberId() { return teamMemberId; }
    public void setTeamMemberId(Long teamMemberId) { this.teamMemberId = teamMemberId; }
    public Long getTeamId() { return teamId; }
    public void setTeamId(Long teamId) { this.teamId = teamId; }
    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
    public LocalDate getJoinedDate() { return joinedDate; }
    public void setJoinedDate(LocalDate joinedDate) { this.joinedDate = joinedDate; }
}
