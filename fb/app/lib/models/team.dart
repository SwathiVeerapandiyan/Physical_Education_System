class TeamModel {
  final int? teamId;
  final String teamName;
  final int? sportId;
  final String? captainName;
  final String? department;

  TeamModel({
    this.teamId,
    required this.teamName,
    this.sportId,
    this.captainName,
    this.department,
  });

  factory TeamModel.fromJson(Map<String, dynamic> json) {
    return TeamModel(
      teamId: json['teamId'] as int?,
      teamName: json['teamName'] ?? '',
      sportId: json['sportId'] as int?,
      captainName: json['captainName'] as String?,
      department: json['department'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (teamId != null) 'teamId': teamId,
      'teamName': teamName,
      'sportId': sportId,
      'captainName': captainName,
      'department': department,
    };
  }
}
