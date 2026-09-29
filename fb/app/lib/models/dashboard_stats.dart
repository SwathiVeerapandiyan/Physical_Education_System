class DashboardStats {
  final int totalUsers;
  final int totalCandidates;
  final int totalMaleStudents;
  final int totalFemaleStudents;

  DashboardStats({
    this.totalUsers = 0,
    this.totalCandidates = 0,
    this.totalMaleStudents = 0,
    this.totalFemaleStudents = 0,
  });

  factory DashboardStats.fromJson(Map<String, dynamic> json) {
    return DashboardStats(
      totalUsers: json['totalUsers'] ?? 0,
      totalCandidates: json['totalCandidates'] ?? 0,
      totalMaleStudents: json['totalMaleStudents'] ?? 0,
      totalFemaleStudents: json['totalFemaleStudents'] ?? 0,
    );
  }
}
