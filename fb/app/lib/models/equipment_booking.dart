class EquipmentBookingModel {
  final int? bookingId;
  final int? userId;
  final String? equipmentName;
  final String? equipmentCategory;
  final int? quantity;
  final String? bookingDate;    // ISO date: yyyy-MM-dd  (NOT NULL in SQL)
  final String? startTime;      // HH:mm:ss
  final String? endTime;        // HH:mm:ss
  final String? returnDate;     // ISO date: yyyy-MM-dd
  final String? bookingStatus;
  final String? approvedBy;
  final String? remarks;
  final String? studentName;
  final String? studentRegisterNo;
  final String? studentDept;
  final String? createdAt;

  EquipmentBookingModel({
    this.bookingId,
    this.userId,
    this.equipmentName,
    this.equipmentCategory,
    this.quantity,
    this.bookingDate,
    this.startTime,
    this.endTime,
    this.returnDate,
    this.bookingStatus,
    this.approvedBy,
    this.remarks,
    this.studentName,
    this.studentRegisterNo,
    this.studentDept,
    this.createdAt,
  });

  factory EquipmentBookingModel.fromJson(Map<String, dynamic> json) {
    return EquipmentBookingModel(
      bookingId: (json['bookingId'] as num?)?.toInt(),
      userId: (json['userId'] as num?)?.toInt(),
      equipmentName: json['equipmentName'] as String?,
      equipmentCategory: json['equipmentCategory'] as String?,
      quantity: (json['quantity'] as num?)?.toInt(),
      bookingDate: json['bookingDate'] as String?,
      startTime: json['startTime'] as String?,
      endTime: json['endTime'] as String?,
      returnDate: json['returnDate'] as String?,
      bookingStatus: (json['bookingStatus'] ?? json['status']) as String?,
      approvedBy: json['approvedBy'] as String?,
      remarks: json['remarks'] as String?,
      studentName: json['studentName'] as String?,
      studentRegisterNo: json['studentRegisterNo'] as String?,
      studentDept: json['studentDept'] as String?,
      createdAt: json['createdAt'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (bookingId != null) 'bookingId': bookingId,
      if (userId != null) 'userId': userId,
      if (equipmentName != null) 'equipmentName': equipmentName,
      if (equipmentCategory != null) 'equipmentCategory': equipmentCategory,
      'quantity': quantity ?? 1,
      'bookingDate': bookingDate,       // required by SQL NOT NULL
      if (startTime != null) 'startTime': startTime,
      if (endTime != null) 'endTime': endTime,
      if (returnDate != null) 'returnDate': returnDate,
      'bookingStatus': bookingStatus ?? 'Pending',
      if (approvedBy != null) 'approvedBy': approvedBy,
      if (remarks != null) 'remarks': remarks,
    };
  }
}
