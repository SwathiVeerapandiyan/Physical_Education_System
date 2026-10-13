class TournamentModel {
  final int? tournamentId;
  final String title;
  final int? sportId;
  final String? startDate;
  final String? endDate;
  final String? venue;
  final String? status; // UPCOMING, ONGOING, COMPLETED
  final String? description;

  TournamentModel({
    this.tournamentId,
    required this.title,
    this.sportId,
    this.startDate,
    this.endDate,
    this.venue,
    this.status,
    this.description,
  });

  factory TournamentModel.fromJson(Map<String, dynamic> json) {
    return TournamentModel(
      tournamentId: json['tournamentId'] as int?,
      title: (json['title'] ?? json['tournamentName'] ?? '') as String,
      sportId: json['sportId'] as int?,
      startDate: json['startDate'] as String?,
      endDate: json['endDate'] as String?,
      venue: json['venue'] as String?,
      status: json['status'] as String?,
      description: (json['description'] ?? json['organizer']) as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (tournamentId != null) 'tournamentId': tournamentId,
      'title': title,
      'tournamentName': title,
      'sportId': sportId,
      'startDate': startDate,
      'endDate': endDate,
      'venue': venue,
      'status': status,
      'description': description,
      'organizer': description ?? 'PE Department',
    };
  }

}
