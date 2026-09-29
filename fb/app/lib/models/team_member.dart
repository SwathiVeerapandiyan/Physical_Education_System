class TeamMemberModel {
  final int? id;
  final int? teamId;
  final int? studentId;
  final String? role;

  TeamMemberModel({
    this.id,
    this.teamId,
    this.studentId,
    this.role,
  });

  factory TeamMemberModel.fromJson(Map<String, dynamic> json) {
    return TeamMemberModel(
      id: json['id'] as int?,
      teamId: json['teamId'] as int?,
      studentId: json['studentId'] as int?,
      role: json['role'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      'teamId': teamId,
      'studentId': studentId,
      'role': role,
    };
  }
}
