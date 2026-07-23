package dev.dept.pe.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Entity
@Table(name = "live_score")
public class LiveScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "score_id")
    private Long scoreId;

    @Column(name = "match_name", length = 150)
    private String matchName;

    @Column(name = "sport_type", length = 50)
    private String sportType;

    @Column(name = "team_one", length = 100)
    private String teamOne;

    @Column(name = "team_two", length = 100)
    private String teamTwo;

    @Column(name = "team_one_score")
    private Integer teamOneScore = 0;

    @Column(name = "team_two_score")
    private Integer teamTwoScore = 0;

    @Column(name = "match_status", length = 30)
    private String matchStatus = "Scheduled";

    @Column(name = "venue", length = 150)
    private String venue;

    @Column(name = "match_date")
    private LocalDate matchDate;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "winner", length = 100)
    private String winner;

    @Column(name = "updated_at", insertable = false, updatable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime updatedAt;

    public LiveScore() {}

    public Long getScoreId() { return scoreId; }
    public void setScoreId(Long scoreId) { this.scoreId = scoreId; }

    public String getMatchName() { return matchName; }
    public void setMatchName(String matchName) { this.matchName = matchName; }

    public String getSportType() { return sportType; }
    public void setSportType(String sportType) { this.sportType = sportType; }

    public String getTeamOne() { return teamOne; }
    public void setTeamOne(String teamOne) { this.teamOne = teamOne; }

    public String getTeamTwo() { return teamTwo; }
    public void setTeamTwo(String teamTwo) { this.teamTwo = teamTwo; }

    public Integer getTeamOneScore() { return teamOneScore; }
    public void setTeamOneScore(Integer teamOneScore) { this.teamOneScore = teamOneScore; }

    public Integer getTeamTwoScore() { return teamTwoScore; }
    public void setTeamTwoScore(Integer teamTwoScore) { this.teamTwoScore = teamTwoScore; }

    public String getMatchStatus() { return matchStatus; }
    public void setMatchStatus(String matchStatus) { this.matchStatus = matchStatus; }

    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }

    public LocalDate getMatchDate() { return matchDate; }
    public void setMatchDate(LocalDate matchDate) { this.matchDate = matchDate; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public String getWinner() { return winner; }
    public void setWinner(String winner) { this.winner = winner; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
