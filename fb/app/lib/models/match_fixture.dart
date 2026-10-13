class MatchFixtureModel {
  final int? matchId;
  final int? tournamentId;
  final String? teamA;
  final String? teamB;
  final String? matchDate;
  final String? venue;
  final String? status; // SCHEDULED, LIVE, COMPLETED
  final String? score;
  final String? winner;

  MatchFixtureModel({
    this.matchId,
    this.tournamentId,
    this.teamA,
    this.teamB,
    this.matchDate,
    this.venue,
    this.status,
    this.score,
    this.winner,
  });

  factory MatchFixtureModel.fromJson(Map<String, dynamic> json) {
    return MatchFixtureModel(
      matchId: json['matchId'] as int?,
      tournamentId: json['tournamentId'] as int?,
      teamA: (json['teamA'] ?? (json['teamOne'] != null ? 'Team ${json['teamOne']}' : null)) as String?,
      teamB: (json['teamB'] ?? (json['teamTwo'] != null ? 'Team ${json['teamTwo']}' : null)) as String?,
      matchDate: json['matchDate'] as String?,
      venue: json['venue'] as String?,
      status: json['status'] as String?,
      score: json['score'] as String?,
      winner: json['winner'] as String?,
    );
  }


  Map<String, dynamic> toJson() {
    return {
      if (matchId != null) 'matchId': matchId,
      'tournamentId': tournamentId,
      'teamA': teamA,
      'teamB': teamB,
      'matchDate': matchDate,
      'venue': venue,
      'status': status,
      'score': score,
      'winner': winner,
    };
  }
}
