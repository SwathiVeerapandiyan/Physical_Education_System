class User {
  final int? id;
  final String username;
  final String? name;
  final String? registerNo;
  final String? email;
  final String? dept;
  final String? role;
  final int? mobileNo;
  final String? token;

  User({
    this.id,
    required this.username,
    this.name,
    this.registerNo,
    this.email,
    this.dept,
    this.role,
    this.mobileNo,
    this.token,
  });

  bool get isAdmin => role?.toUpperCase() == 'ADMIN';

  factory User.fromJson(Map<String, dynamic> json) {
    final rawId = json['userId'] ?? json['id'];
    final nameStr = json['name'] as String?;
    final emailStr = json['email'] as String?;
    final regNoStr = json['registerNo'] as String?;
    final uName = json['username'] as String? ?? emailStr ?? regNoStr ?? nameStr ?? '';
    final tokenStr = json['token'] as String? ?? json['authToken'] as String?;

    return User(
      id: rawId != null ? (rawId as num).toInt() : null,
      username: uName,
      name: nameStr,
      registerNo: regNoStr,
      email: emailStr,
      dept: json['dept'] as String?,
      role: json['role'] as String?,
      mobileNo: json['mobileNo'] != null ? (json['mobileNo'] as num).toInt() : null,
      token: tokenStr,
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
      if (token != null) 'token': token,
    };
  }

  User copyWith({String? token}) {
    return User(
      id: id,
      username: username,
      name: name,
      registerNo: registerNo,
      email: email,
      dept: dept,
      role: role,
      mobileNo: mobileNo,
      token: token ?? this.token,
    );
  }
}

class LoginResponse {
  final bool success;
  final String message;
  final User? userDetails;
  final String? token;

  LoginResponse({
    required this.success,
    required this.message,
    this.userDetails,
    this.token,
  });

  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    Map<String, dynamic>? uMap;
    if (json['userDetails'] != null) {
      uMap = json['userDetails'] as Map<String, dynamic>;
    } else if (json['user'] != null) {
      uMap = json['user'] as Map<String, dynamic>;
    }

    final tokenVal = json['token'] as String?;
    User? user;
    if (uMap != null) {
      if (tokenVal != null && uMap['token'] == null) {
        uMap['token'] = tokenVal;
      }
      user = User.fromJson(uMap);
    }

    return LoginResponse(
      success: json['success'] ?? false,
      message: json['message'] ?? '',
      userDetails: user,
      token: tokenVal,
    );
  }
}
