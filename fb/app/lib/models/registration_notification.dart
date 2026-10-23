class RegistrationNotification {
  final int? notificationId;
  final String type;
  final String studentName;
  final String email;
  final String registerNo;
  final String dept;
  final int? mobileNo;
  final DateTime? registeredAt;
  bool isRead;

  RegistrationNotification({
    this.notificationId,
    this.type = 'NEW_STUDENT_REGISTRATION',
    required this.studentName,
    required this.email,
    required this.registerNo,
    required this.dept,
    this.mobileNo,
    this.registeredAt,
    this.isRead = false,
  });

  bool get isStudentRegistration => type == 'NEW_STUDENT_REGISTRATION';
  bool get isEquipmentBooking => type == 'EQUIPMENT_BOOKING';
  bool get isGroundBooking => type == 'GROUND_BOOKING';

  String get titleText {
    if (isEquipmentBooking) return 'New Equipment Booking Request';
    if (isGroundBooking) return 'New Ground Reservation Request';
    return 'New Student Registered';
  }

  String get iconEmoji {
    if (isEquipmentBooking) return '🏀';
    if (isGroundBooking) return '🏟️';
    return '🎓';
  }

  String get routeTarget {
    if (isEquipmentBooking) return '/equipment-bookings';
    if (isGroundBooking) return '/ground-bookings';
    return '/users';
  }

  factory RegistrationNotification.fromJson(Map<String, dynamic> json) {
    DateTime? parsedDate;
    if (json['registeredAt'] != null) {
      if (json['registeredAt'] is String) {
        parsedDate = DateTime.tryParse(json['registeredAt']);
      } else if (json['registeredAt'] is List) {
        // Spring sometimes serializes LocalDateTime as [year, month, day, hour, min, sec]
        final list = json['registeredAt'] as List;
        if (list.length >= 3) {
          parsedDate = DateTime(
            list[0] as int,
            list[1] as int,
            list[2] as int,
            list.length > 3 ? list[3] as int : 0,
            list.length > 4 ? list[4] as int : 0,
            list.length > 5 ? list[5] as int : 0,
          );
        }
      }
    }

    final rawId = json['notificationId'] ?? json['id'];
    final rawMobile = json['mobileNo'];

    return RegistrationNotification(
      notificationId: rawId != null ? (rawId as num).toInt() : null,
      type: json['type'] as String? ?? 'NEW_STUDENT_REGISTRATION',
      studentName: json['studentName'] as String? ?? 'Unknown Student',
      email: json['email'] as String? ?? '',
      registerNo: json['registerNo'] as String? ?? '',
      dept: json['dept'] as String? ?? '',
      mobileNo: rawMobile != null ? (rawMobile as num).toInt() : null,
      registeredAt: parsedDate ?? DateTime.now(),
      isRead: json['read'] == true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'notificationId': notificationId,
      'type': type,
      'studentName': studentName,
      'email': email,
      'registerNo': registerNo,
      'dept': dept,
      'mobileNo': mobileNo,
      'registeredAt': registeredAt?.toIso8601String(),
      'read': isRead,
    };
  }
}
