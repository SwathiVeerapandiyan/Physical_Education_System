package dev.dept.pe.dto;

import java.time.LocalDateTime;

public class MatchDto {
    private Long matchId;
    private Long tournamentId;
    private Long teamOne;
    private Long teamTwo;
    private String venue;
    private LocalDateTime matchDate;
    private String status;
    private String teamA;
    private String teamB;
    private String score;
    private String winner;
    private LocalDateTime createdTime;

    public MatchDto() {}

    public Long getMatchId() { return matchId; }
    public void setMatchId(Long matchId) { this.matchId = matchId; }
    public Long getTournamentId() { return tournamentId; }
    public void setTournamentId(Long tournamentId) { this.tournamentId = tournamentId; }
    public Long getTeamOne() { return teamOne; }
    public void setTeamOne(Long teamOne) { this.teamOne = teamOne; }
    public Long getTeamTwo() { return teamTwo; }
    public void setTeamTwo(Long teamTwo) { this.teamTwo = teamTwo; }
    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }
    public LocalDateTime getMatchDate() { return matchDate; }
    public void setMatchDate(LocalDateTime matchDate) { this.matchDate = matchDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getTeamA() { return teamA; }
    public void setTeamA(String teamA) { this.teamA = teamA; }
    public String getTeamB() { return teamB; }
    public void setTeamB(String teamB) { this.teamB = teamB; }
    public String getScore() { return score; }
    public void setScore(String score) { this.score = score; }
    public String getWinner() { return winner; }
    public void setWinner(String winner) { this.winner = winner; }
    public LocalDateTime getCreatedTime() { return createdTime; }
    public void setCreatedTime(LocalDateTime createdTime) { this.createdTime = createdTime; }

}
