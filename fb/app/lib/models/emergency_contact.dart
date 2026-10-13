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
      relation: (json['relation'] ?? json['relationship']) as String?,
      phone: (json['phone'] ?? json['phoneNumber']) as String?,
      altPhone: (json['altPhone'] ?? json['alternatePhone']) as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (contactId != null) 'contactId': contactId,
      'userId': userId,
      'contactName': contactName,
      'relation': relation,
      'relationship': relation,
      'phone': phone,
      'phoneNumber': phone,
      'altPhone': altPhone,
      'alternatePhone': altPhone,
    };
  }

}
