package dev.dept.pe.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "matches")
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "match_id")
    private Long matchId;

    @Column(name = "tournament_id")
    private Long tournamentId;

    @Column(name = "team_one")
    private Long teamOne;

    @Column(name = "team_two")
    private Long teamTwo;

    @Column(name = "venue", length = 150)
    private String venue;

    @Column(name = "match_date")
    private LocalDateTime matchDate;

    @Column(name = "status", length = 30)
    private String status;

    @Column(name = "created_time", insertable = false, updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdTime;

    public Match() {
    }

    public Long getMatchId() {
        return matchId;
    }

    public void setMatchId(Long matchId) {
        this.matchId = matchId;
    }

    public Long getTournamentId() {
        return tournamentId;
    }

    public void setTournamentId(Long tournamentId) {
        this.tournamentId = tournamentId;
    }

    public Long getTeamOne() {
        return teamOne;
    }

    public void setTeamOne(Long teamOne) {
        this.teamOne = teamOne;
    }

    public Long getTeamTwo() {
        return teamTwo;
    }

    public void setTeamTwo(Long teamTwo) {
        this.teamTwo = teamTwo;
    }

    public String getVenue() {
        return venue;
    }

    public void setVenue(String venue) {
        this.venue = venue;
    }

    public LocalDateTime getMatchDate() {
        return matchDate;
    }

    public void setMatchDate(LocalDateTime matchDate) {
        this.matchDate = matchDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedTime() {
        return createdTime;
    }

    public void setCreatedTime(LocalDateTime createdTime) {
        this.createdTime = createdTime;
    }
}
