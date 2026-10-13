package dev.dept.pe.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

public class LiveScoreDto {

    private Long scoreId;
    private String matchName;
    private String sportType;
    private String teamOne;
    private String teamTwo;
    private Integer teamOneScore = 0;
    private Integer teamTwoScore = 0;
    private String matchStatus = "Scheduled";
    private String venue;
    private LocalDate matchDate;
    private LocalTime startTime;
    private String winner;
    private LocalDateTime updatedAt;

    public LiveScoreDto() {}

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

    private String commentary;

    public String getMatchTitle() { return matchName; }
    public void setMatchTitle(String matchTitle) { if (this.matchName == null || this.matchName.isEmpty()) this.matchName = matchTitle; }

    public String getCurrentStatus() { return matchStatus; }
    public void setCurrentStatus(String currentStatus) { if (currentStatus != null && !currentStatus.isEmpty()) this.matchStatus = currentStatus; }

    public String getTeamAScore() { return teamOneScore != null ? teamOneScore.toString() : "0"; }
    public void setTeamAScore(String s) {
        if (s != null) {
            try { this.teamOneScore = Integer.parseInt(s.trim()); } catch (Exception ignored) {}
        }
    }

    public String getTeamBScore() { return teamTwoScore != null ? teamTwoScore.toString() : "0"; }
    public void setTeamBScore(String s) {
        if (s != null) {
            try { this.teamTwoScore = Integer.parseInt(s.trim()); } catch (Exception ignored) {}
        }
    }

    public String getCommentary() { return commentary; }
    public void setCommentary(String commentary) { this.commentary = commentary; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

