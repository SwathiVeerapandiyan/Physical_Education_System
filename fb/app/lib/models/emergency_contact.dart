class EmergencyContactModel {
  final int? contactId;
  final int? userId;
  final String? contactName;
  final String? relation;
  final String? phone;
  final String? altPhone;

  EmergencyContactModel({
    this.contactId,
    this.userId,
    this.contactName,
    this.relation,
    this.phone,
    this.altPhone,
  });

  factory EmergencyContactModel.fromJson(Map<String, dynamic> json) {
    return EmergencyContactModel(
      contactId: json['contactId'] as int?,
      userId: json['userId'] as int?,
      contactName: json['contactName'] as String?,
      relation: json['relation'] as String?,
      phone: json['phone'] as String?,
      altPhone: json['altPhone'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (contactId != null) 'contactId': contactId,
      'userId': userId,
      'contactName': contactName,
      'relation': relation,
      'phone': phone,
      'altPhone': altPhone,
    };
  }
}
