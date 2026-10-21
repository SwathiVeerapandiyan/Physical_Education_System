package dev.dept.pe.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "team_members", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"team_id", "student_id"})
})
public class TeamMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "team_member_id")
    private Long teamMemberId;

    @Column(name = "team_id", nullable = false)
    private Long teamId;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "joined_date")
    private LocalDate joinedDate;

    @Column(name = "role", length = 50)
    private String role;

    @Column(name = "student_name", length = 100)
    private String studentName;

    public TeamMember() {
    }

    public Long getTeamMemberId() {
        return teamMemberId;
    }

    public void setTeamMemberId(Long teamMemberId) {
        this.teamMemberId = teamMemberId;
    }

    public Long getTeamId() {
        return teamId;
    }

    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public LocalDate getJoinedDate() {
        return joinedDate;
    }

    public void setJoinedDate(LocalDate joinedDate) {
        this.joinedDate = joinedDate;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }
}
