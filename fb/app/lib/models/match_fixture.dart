class MatchFixtureModel {
  final int? matchId;
  final int? tournamentId;
  final int? teamOne;
  final int? teamTwo;
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
    this.teamOne,
    this.teamTwo,
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
      teamOne: json['teamOne'] as int?,
      teamTwo: json['teamTwo'] as int?,
      teamA: (json['teamA'] ?? (json['teamOne'] != null ? 'Team ${json['teamOne']}' : null)) as String?,
      teamB: (json['teamB'] ?? (json['teamTwo'] != null ? 'Team ${json['teamTwo']}' : null)) as String?,
      matchDate: json['matchDate']?.toString(),
      venue: json['venue'] as String?,
      status: json['status'] as String?,
      score: json['score'] as String?,
      winner: json['winner'] as String?,
    );
  }

  int? get team1Id => teamOne;
  int? get team2Id => teamTwo;
  String? get matchTime => null;

  Map<String, dynamic> toJson() {
    return {
      if (matchId != null) 'matchId': matchId,
      if (tournamentId != null) 'tournamentId': tournamentId,
      if (teamOne != null) 'teamOne': teamOne,
      if (teamTwo != null) 'teamTwo': teamTwo,
      if (teamA != null) 'teamA': teamA,
      if (teamB != null) 'teamB': teamB,
      if (matchDate != null) 'matchDate': matchDate,
      if (venue != null) 'venue': venue,
      if (status != null) 'status': status,
      if (score != null) 'score': score,
      if (winner != null) 'winner': winner,
    };
  }
}
