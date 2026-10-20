class EmergencyContactModel {
  final int? contactId;
  final int? userId;
  final String? contactName;
  final String? relationship;
  final String? phoneNumber;
  final String? alternatePhone;
  final String? email;
  final String? address;
  final String? city;
  final String? state;
  final String? pincode;
  final String? createdAt;

  EmergencyContactModel({
    this.contactId,
    this.userId,
    this.contactName,
    this.relationship,
    this.phoneNumber,
    this.alternatePhone,
    this.email,
    this.address,
    this.city,
    this.state,
    this.pincode,
    this.createdAt,
  });

  factory EmergencyContactModel.fromJson(Map<String, dynamic> json) {
    return EmergencyContactModel(
      contactId: (json['contactId'] as num?)?.toInt(),
      userId: (json['userId'] as num?)?.toInt(),
      contactName: json['contactName'] as String?,
      relationship: (json['relationship'] ?? json['relation']) as String?,
      phoneNumber: (json['phoneNumber'] ?? json['phone']) as String?,
      alternatePhone: (json['alternatePhone'] ?? json['altPhone']) as String?,
      email: json['email'] as String?,
      address: json['address'] as String?,
      city: json['city'] as String?,
      state: json['state'] as String?,
      pincode: json['pincode'] as String?,
      createdAt: json['createdAt'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (contactId != null) 'contactId': contactId,
      if (userId != null) 'userId': userId,
      if (contactName != null) 'contactName': contactName,
      if (relationship != null) 'relationship': relationship,
      if (phoneNumber != null) 'phoneNumber': phoneNumber,
      if (alternatePhone != null) 'alternatePhone': alternatePhone,
      if (email != null) 'email': email,
      if (address != null) 'address': address,
      if (city != null) 'city': city,
      if (state != null) 'state': state,
      if (pincode != null) 'pincode': pincode,
    };
  }
}
