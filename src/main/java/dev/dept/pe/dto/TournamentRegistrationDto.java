package dev.dept.pe.dto;

import java.time.LocalDateTime;

public class TournamentRegistrationDto {
    private Long registrationId;
    private Long tournamentId;
    private Long teamId;
    private LocalDateTime registrationDate;
    private String status;

    public TournamentRegistrationDto() {}

    public Long getRegistrationId() { return registrationId; }
    public void setRegistrationId(Long registrationId) { this.registrationId = registrationId; }
    public Long getTournamentId() { return tournamentId; }
    public void setTournamentId(Long tournamentId) { this.tournamentId = tournamentId; }
    public Long getTeamId() { return teamId; }
    public void setTeamId(Long teamId) { this.teamId = teamId; }
    public LocalDateTime getRegistrationDate() { return registrationDate; }
    public void setRegistrationDate(LocalDateTime registrationDate) { this.registrationDate = registrationDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
