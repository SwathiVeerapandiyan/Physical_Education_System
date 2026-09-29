class SportModel {
  final int? sportId;
  final String sportName;
  final String? category; // Indoor/Outdoor
  final int? minPlayers;
  final int? maxPlayers;
  final String? coachName;
  final String? description;

  SportModel({
    this.sportId,
    required this.sportName,
    this.category,
    this.minPlayers,
    this.maxPlayers,
    this.coachName,
    this.description,
  });

  factory SportModel.fromJson(Map<String, dynamic> json) {
    return SportModel(
      sportId: json['sportId'] as int?,
      sportName: json['sportName'] ?? '',
      category: json['category'] as String?,
      minPlayers: json['minPlayers'] as int?,
      maxPlayers: json['maxPlayers'] as int?,
      coachName: json['coachName'] as String?,
      description: json['description'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (sportId != null) 'sportId': sportId,
      'sportName': sportName,
      'category': category,
      if (minPlayers != null) 'minPlayers': minPlayers,
      if (maxPlayers != null) 'maxPlayers': maxPlayers,
      if (coachName != null) 'coachName': coachName,
      'description': description,
    };
  }
}
