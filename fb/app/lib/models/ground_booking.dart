class GroundBookingModel {
  final int? bookingId;
  final int? userId;
  final String? groundName;
  final String? bookingDate;
  final String? timeSlot;
  final String? purpose;
  final String? status; // PENDING, APPROVED, CANCELLED

  GroundBookingModel({
    this.bookingId,
    this.userId,
    this.groundName,
    this.bookingDate,
    this.timeSlot,
    this.purpose,
    this.status,
  });

  factory GroundBookingModel.fromJson(Map<String, dynamic> json) {
    return GroundBookingModel(
      bookingId: json['bookingId'] as int?,
      userId: json['userId'] as int?,
      groundName: json['groundName'] as String?,
      bookingDate: json['bookingDate'] as String?,
      timeSlot: (json['timeSlot'] ?? (json['startTime'] != null ? '${json['startTime']} - ${json['endTime']}' : null)) as String?,
      purpose: (json['purpose'] ?? json['remarks'] ?? json['sportType']) as String?,
      status: (json['status'] ?? json['bookingStatus']) as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (bookingId != null) 'bookingId': bookingId,
      'userId': userId,
      'groundName': groundName,
      'sportType': purpose ?? 'Football',
      'bookingDate': bookingDate,
      'timeSlot': timeSlot,
      'purpose': purpose,
      'remarks': purpose,
      'status': status,
      'bookingStatus': status ?? 'Pending',
    };
  }

}
