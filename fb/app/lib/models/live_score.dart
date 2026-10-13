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
      matchTitle: (json['matchTitle'] ?? json['matchName']) as String?,
      teamAScore: (json['teamAScore'] ?? json['teamOneScore'])?.toString(),
      teamBScore: (json['teamBScore'] ?? json['teamTwoScore'])?.toString(),
      currentStatus: (json['currentStatus'] ?? json['matchStatus']) as String?,
      commentary: json['commentary'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    final aScore = int.tryParse(teamAScore ?? '0') ?? 0;
    final bScore = int.tryParse(teamBScore ?? '0') ?? 0;
    return {
      if (scoreId != null) 'scoreId': scoreId,
      'sportType': sportType,
      'matchTitle': matchTitle,
      'matchName': matchTitle,
      'teamAScore': teamAScore,
      'teamBScore': teamBScore,
      'teamOneScore': aScore,
      'teamTwoScore': bScore,
      'teamOne': matchTitle != null && matchTitle!.contains('vs') ? matchTitle!.split('vs').first.trim() : (matchTitle ?? 'Team 1'),
      'teamTwo': matchTitle != null && matchTitle!.contains('vs') ? matchTitle!.split('vs').last.trim() : (matchTitle ?? 'Team 2'),

      'currentStatus': currentStatus,
      'matchStatus': currentStatus ?? 'Live',
      'commentary': commentary,
    };
  }

}
