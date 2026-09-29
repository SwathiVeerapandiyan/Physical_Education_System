class TournamentRegistrationModel {
  final int? registrationId;
  final int tournamentId;
  final int teamId;
  final String? registrationDate;
  final String? status; // PENDING, APPROVED, REJECTED

  TournamentRegistrationModel({
    this.registrationId,
    required this.tournamentId,
    required this.teamId,
    this.registrationDate,
    this.status,
  });

  factory TournamentRegistrationModel.fromJson(Map<String, dynamic> json) {
    return TournamentRegistrationModel(
      registrationId: json['registrationId'] as int?,
      tournamentId: json['tournamentId'] as int,
      teamId: json['teamId'] as int,
      registrationDate: json['registrationDate'] as String?,
      status: json['status'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (registrationId != null) 'registrationId': registrationId,
      'tournamentId': tournamentId,
      'teamId': teamId,
      if (registrationDate != null) 'registrationDate': registrationDate,
      if (status != null) 'status': status,
    };
  }
}
