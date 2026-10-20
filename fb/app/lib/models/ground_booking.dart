class GroundBookingModel {
  final int? bookingId;
  final int? userId;
  final String? groundName;
  final String? sportType;
  final String? bookingDate;   // ISO date: yyyy-MM-dd
  final String? startTime;     // HH:mm:ss
  final String? endTime;       // HH:mm:ss
  final double? durationHours;
  final String? bookingStatus;
  final double? paymentAmount;
  final String? paymentStatus;
  final String? approvedBy;
  final String? remarks;
  final String? createdAt;

  GroundBookingModel({
    this.bookingId,
    this.userId,
    this.groundName,
    this.sportType,
    this.bookingDate,
    this.startTime,
    this.endTime,
    this.durationHours,
    this.bookingStatus,
    this.paymentAmount,
    this.paymentStatus,
    this.approvedBy,
    this.remarks,
    this.createdAt,
  });

  factory GroundBookingModel.fromJson(Map<String, dynamic> json) {
    // Reconstruct timeSlot display string from startTime/endTime if present
    String? start = json['startTime'] as String?;
    String? end = json['endTime'] as String?;

    return GroundBookingModel(
      bookingId: (json['bookingId'] as num?)?.toInt(),
      userId: (json['userId'] as num?)?.toInt(),
      groundName: json['groundName'] as String?,
      sportType: json['sportType'] as String?,
      bookingDate: json['bookingDate'] as String?,
      startTime: start,
      endTime: end,
      durationHours: (json['durationHours'] as num?)?.toDouble(),
      bookingStatus: (json['bookingStatus'] ?? json['status']) as String?,
      paymentAmount: (json['paymentAmount'] as num?)?.toDouble(),
      paymentStatus: json['paymentStatus'] as String?,
      approvedBy: json['approvedBy'] as String?,
      remarks: (json['remarks'] ?? json['purpose']) as String?,
      createdAt: json['createdAt'] as String?,
    );
  }

  /// Convenience: display time-slot string for UI
  String get timeSlotDisplay {
    if (startTime != null && endTime != null) {
      return '${_fmt(startTime!)} - ${_fmt(endTime!)}';
    }
    return 'TBD';
  }

  static String _fmt(String t) {
    // Convert "HH:mm:ss" -> "HH:mm" for display
    if (t.length >= 5) return t.substring(0, 5);
    return t;
  }

  Map<String, dynamic> toJson() {
    return {
      if (bookingId != null) 'bookingId': bookingId,
      if (userId != null) 'userId': userId,
      if (groundName != null) 'groundName': groundName,
      if (sportType != null) 'sportType': sportType,
      if (bookingDate != null) 'bookingDate': bookingDate,
      if (startTime != null) 'startTime': startTime,
      if (endTime != null) 'endTime': endTime,
      if (durationHours != null) 'durationHours': durationHours,
      'bookingStatus': bookingStatus ?? 'Pending',
      if (paymentAmount != null) 'paymentAmount': paymentAmount,
      if (paymentStatus != null) 'paymentStatus': paymentStatus,
      if (approvedBy != null) 'approvedBy': approvedBy,
      if (remarks != null) 'remarks': remarks,
    };
  }
}
