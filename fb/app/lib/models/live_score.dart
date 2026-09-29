class LiveScoreModel {
  final int? scoreId;
  final String? sportType;
  final String? matchTitle;
  final String? teamAScore;
  final String? teamBScore;
  final String? currentStatus; // UPCOMING, LIVE, FINAL
  final String? commentary;

  LiveScoreModel({
    this.scoreId,
    this.sportType,
    this.matchTitle,
    this.teamAScore,
    this.teamBScore,
    this.currentStatus,
    this.commentary,
  });

  factory LiveScoreModel.fromJson(Map<String, dynamic> json) {
    return LiveScoreModel(
      scoreId: json['scoreId'] as int?,
      sportType: json['sportType'] as String?,
      matchTitle: json['matchTitle'] as String?,
      teamAScore: json['teamAScore'] as String?,
      teamBScore: json['teamBScore'] as String?,
      currentStatus: json['currentStatus'] as String?,
      commentary: json['commentary'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (scoreId != null) 'scoreId': scoreId,
      'sportType': sportType,
      'matchTitle': matchTitle,
      'teamAScore': teamAScore,
      'teamBScore': teamBScore,
      'currentStatus': currentStatus,
      'commentary': commentary,
    };
  }
}
