package dev.dept.pe.dto;

public class DashboardStatsDto {

    private long totalUsers;
    private long totalCandidates;
    private long totalMaleStudents;
    private long totalFemaleStudents;

    // Constructors
    public DashboardStatsDto() {
    }

    public DashboardStatsDto(long totalUsers, long totalCandidates,
                             long totalMaleStudents, long totalFemaleStudents) {
        this.totalUsers = totalUsers;
        this.totalCandidates = totalCandidates;
        this.totalMaleStudents = totalMaleStudents;
        this.totalFemaleStudents = totalFemaleStudents;
    }

    // Getters and Setters
    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalCandidates() {
        return totalCandidates;
    }

    public void setTotalCandidates(long totalCandidates) {
        this.totalCandidates = totalCandidates;
    }

    public long getTotalMaleStudents() {
        return totalMaleStudents;
    }

    public void setTotalMaleStudents(long totalMaleStudents) {
        this.totalMaleStudents = totalMaleStudents;
    }

    public long getTotalFemaleStudents() {
        return totalFemaleStudents;
    }

    public void setTotalFemaleStudents(long totalFemaleStudents) {
        this.totalFemaleStudents = totalFemaleStudents;
    }
}
