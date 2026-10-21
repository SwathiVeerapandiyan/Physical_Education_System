package dev.dept.pe.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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

    private static final Pattern TIME_PATTERN = Pattern.compile("(\\d{1,2}):(\\d{2})\\s*(AM|PM)?", Pattern.CASE_INSENSITIVE);

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

    public void setMatchDate(String text) {
        if (text == null || text.trim().isEmpty()) {
            this.matchDate = null;
            return;
        }
        String trimmed = text.trim();
        try {
            this.matchDate = LocalDateTime.parse(trimmed);
            return;
        } catch (Exception ignored) {}

        try {
            this.matchDate = LocalDateTime.parse(trimmed, DateTimeFormatter.ISO_DATE_TIME);
            return;
        } catch (Exception ignored) {}

        String[] patterns = new String[] {
            "yyyy-MM-dd HH:mm:ss", "yyyy-MM-dd HH:mm", "yyyy-MM-dd'T'HH:mm",
            "dd-MM-yyyy HH:mm:ss", "dd-MM-yyyy HH:mm", "dd/MM/yyyy HH:mm"
        };
        for (String pattern : patterns) {
            try {
                this.matchDate = LocalDateTime.parse(trimmed, DateTimeFormatter.ofPattern(pattern));
                return;
            } catch (Exception ignored) {}
        }

        try {
            this.matchDate = LocalDate.parse(trimmed).atStartOfDay();
            return;
        } catch (Exception ignored) {}

        LocalDate baseDate = LocalDate.now();
        if (trimmed.toLowerCase().contains("tomorrow")) {
            baseDate = baseDate.plusDays(1);
        }
        Matcher matcher = TIME_PATTERN.matcher(trimmed);
        if (matcher.find()) {
            try {
                int hour = Integer.parseInt(matcher.group(1));
                int minute = Integer.parseInt(matcher.group(2));
                String ampm = matcher.group(3);
                if (ampm != null) {
                    if (ampm.equalsIgnoreCase("PM") && hour < 12) hour += 12;
                    else if (ampm.equalsIgnoreCase("AM") && hour == 12) hour = 0;
                }
                this.matchDate = LocalDateTime.of(baseDate, LocalTime.of(hour, minute));
                return;
            } catch (Exception ignored) {}
        }
        this.matchDate = LocalDateTime.now();
    }

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
