class User {
  final int? id;
  final String username;
  final String? name;
  final String? registerNo;
  final String? email;
  final String? dept;
  final String? role;
  final int? mobileNo;

  User({
    this.id,
    required this.username,
    this.name,
    this.registerNo,
    this.email,
    this.dept,
    this.role,
    this.mobileNo,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    final rawId = json['userId'] ?? json['id'];
    final nameStr = json['name'] as String?;
    final emailStr = json['email'] as String?;
    final regNoStr = json['registerNo'] as String?;
    final uName = json['username'] as String? ?? emailStr ?? regNoStr ?? nameStr ?? '';

    return User(
      id: rawId != null ? (rawId as num).toInt() : null,
      username: uName,
      name: nameStr,
      registerNo: regNoStr,
      email: emailStr,
      dept: json['dept'] as String?,
      role: json['role'] as String?,
      mobileNo: json['mobileNo'] != null ? (json['mobileNo'] as num).toInt() : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'userId': id,
      'username': username,
      'name': name,
      'registerNo': registerNo,
      'email': email,
      'dept': dept,
      'role': role,
      if (mobileNo != null) 'mobileNo': mobileNo,
    };
  }
}

class LoginResponse {
  final bool success;
  final String message;
  final User? userDetails;

  LoginResponse({
    required this.success,
    required this.message,
    this.userDetails,
  });

  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    Map<String, dynamic>? uMap;
    if (json['userDetails'] != null) {
      uMap = json['userDetails'] as Map<String, dynamic>;
    } else if (json['user'] != null) {
      uMap = json['user'] as Map<String, dynamic>;
    }

    return LoginResponse(
      success: json['success'] ?? false,
      message: json['message'] ?? '',
      userDetails: uMap != null ? User.fromJson(uMap) : null,
    );
  }
}
