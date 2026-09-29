class EquipmentBookingModel {
  final int? bookingId;
  final int? userId;
  final String? equipmentName;
  final int? quantity;
  final String? bookingDate;
  final String? returnDate;
  final String? status; // PENDING, APPROVED, REJECTED, RETURNED

  EquipmentBookingModel({
    this.bookingId,
    this.userId,
    this.equipmentName,
    this.quantity,
    this.bookingDate,
    this.returnDate,
    this.status,
  });

  factory EquipmentBookingModel.fromJson(Map<String, dynamic> json) {
    return EquipmentBookingModel(
      bookingId: json['bookingId'] as int?,
      userId: json['userId'] as int?,
      equipmentName: json['equipmentName'] as String?,
      quantity: json['quantity'] as int?,
      bookingDate: json['bookingDate'] as String?,
      returnDate: json['returnDate'] as String?,
      status: json['status'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (bookingId != null) 'bookingId': bookingId,
      'userId': userId,
      'equipmentName': equipmentName,
      'quantity': quantity,
      'bookingDate': bookingDate,
      'returnDate': returnDate,
      'status': status,
    };
  }
}
