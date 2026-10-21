class TeamMemberModel {
  final int? id;
  final int? teamId;
  final int? studentId;
  final String? studentName;
  final String? role;
  final String? joinedDate;

  TeamMemberModel({
    this.id,
    this.teamId,
    this.studentId,
    this.studentName,
    this.role,
    this.joinedDate,
  });

  factory TeamMemberModel.fromJson(Map<String, dynamic> json) {
    return TeamMemberModel(
      id: (json['teamMemberId'] ?? json['id']) as int?,
      teamId: json['teamId'] as int?,
      studentId: json['studentId'] as int?,
      studentName: json['studentName'] as String?,
      role: json['role'] as String?,
      joinedDate: json['joinedDate'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      if (id != null) 'teamMemberId': id,
      'teamId': teamId,
      if (studentId != null) 'studentId': studentId,
      if (studentName != null && studentName!.isNotEmpty) 'studentName': studentName,
      if (role != null && role!.isNotEmpty) 'role': role,
      if (joinedDate != null) 'joinedDate': joinedDate,
    };
  }
}
