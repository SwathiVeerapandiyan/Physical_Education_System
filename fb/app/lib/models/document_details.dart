class DocumentDetailsModel {
  final int? documentId;
  final int? userFormId;
  final int? candidateId;
  final String? aadharNo;
  final String? medicalCertificateUrl;
  final String? photoUrl;

  DocumentDetailsModel({
    this.documentId,
    this.userFormId,
    this.candidateId,
    this.aadharNo,
    this.medicalCertificateUrl,
    this.photoUrl,
  });

  factory DocumentDetailsModel.fromJson(Map<String, dynamic> json) {
    final formId = json['userFormId'] ?? json['candidateId'];
    return DocumentDetailsModel(
      documentId: json['documentId'] as int?,
      userFormId: formId != null ? (formId as num).toInt() : null,
      candidateId: formId != null ? (formId as num).toInt() : null,
      aadharNo: (json['aadharCard'] ?? json['aadharNo']) as String?,
      medicalCertificateUrl: (json['fitnessMedicalCertificate'] ?? json['medicalCertificateUrl']) as String?,
      photoUrl: (json['admissionCard'] ?? json['photoUrl']) as String?,
    );
  }

  Map<String, dynamic> toJson() {
    final formId = userFormId ?? candidateId;
    return {
      if (documentId != null) 'documentId': documentId,
      'userFormId': formId,
      'candidateId': formId,
      'aadharCard': aadharNo ?? '',
      'aadharNo': aadharNo ?? '',
      'fitnessMedicalCertificate': medicalCertificateUrl ?? '',
      'medicalCertificateUrl': medicalCertificateUrl ?? '',
      'admissionCard': photoUrl ?? '',
      'photoUrl': photoUrl ?? '',
    };
  }
}
