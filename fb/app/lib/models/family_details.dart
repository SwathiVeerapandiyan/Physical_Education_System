class FamilyDetailsModel {
  final int? familyId;
  final int? userFormId;
  final int? candidateId;
  final String? fatherName;
  final String? fatherOccupation;
  final String? motherName;
  final String? motherOccupation;
  final String? guardianPhone;

  FamilyDetailsModel({
    this.familyId,
    this.userFormId,
    this.candidateId,
    this.fatherName,
    this.fatherOccupation,
    this.motherName,
    this.motherOccupation,
    this.guardianPhone,
  });

  factory FamilyDetailsModel.fromJson(Map<String, dynamic> json) {
    final formId = json['userFormId'] ?? json['candidateId'];
    return FamilyDetailsModel(
      familyId: json['familyId'] as int?,
      userFormId: formId != null ? (formId as num).toInt() : null,
      candidateId: formId != null ? (formId as num).toInt() : null,
      fatherName: json['fatherName'] as String?,
      fatherOccupation: json['fatherOccupation'] as String?,
      motherName: json['motherName'] as String?,
      motherOccupation: json['motherOccupation'] as String?,
      guardianPhone: json['guardianPhone'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    final formId = userFormId ?? candidateId;
    return {
      if (familyId != null) 'familyId': familyId,
      'userFormId': formId,
      'candidateId': formId,
      'fatherName': fatherName ?? '',
      'fatherOccupation': fatherOccupation ?? '',
      'motherName': motherName ?? '',
      'motherOccupation': motherOccupation ?? '',
      'guardianPhone': guardianPhone ?? '',
    };
  }
}
