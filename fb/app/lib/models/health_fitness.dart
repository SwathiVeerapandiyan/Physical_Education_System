class HealthFitnessModel {
  final int? recordId;
  final int? userId;
  final double? heightCm;
  final double? weightKg;
  final double? bmi;
  final String? bloodGroup;
  final int? heartRate;
  final String? fitnessLevel;
  final String? medicalConditions;
  final String? allergies;
  final String? emergencyNotes;
  final String? lastCheckup;   // ISO date: yyyy-MM-dd
  final String? createdAt;

  HealthFitnessModel({
    this.recordId,
    this.userId,
    this.heightCm,
    this.weightKg,
    this.bmi,
    this.bloodGroup,
    this.heartRate,
    this.fitnessLevel,
    this.medicalConditions,
    this.allergies,
    this.emergencyNotes,
    this.lastCheckup,
    this.createdAt,
  });

  factory HealthFitnessModel.fromJson(Map<String, dynamic> json) {
    return HealthFitnessModel(
      recordId: (json['recordId'] as num?)?.toInt(),
      userId: (json['userId'] as num?)?.toInt(),
      heightCm: ((json['heightCm'] ?? json['height']) as num?)?.toDouble(),
      weightKg: ((json['weightKg'] ?? json['weight']) as num?)?.toDouble(),
      bmi: (json['bmi'] as num?)?.toDouble(),
      bloodGroup: json['bloodGroup'] as String?,
      heartRate: (json['heartRate'] as num?)?.toInt(),
      fitnessLevel: json['fitnessLevel'] as String?,
      medicalConditions: json['medicalConditions'] as String?,
      allergies: json['allergies'] as String?,
      emergencyNotes: json['emergencyNotes'] as String?,
      lastCheckup: (json['lastCheckup'] ?? json['lastCheckupDate']) as String?,
      createdAt: json['createdAt'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (recordId != null) 'recordId': recordId,
      if (userId != null) 'userId': userId,
      if (heightCm != null) 'heightCm': heightCm,
      if (weightKg != null) 'weightKg': weightKg,
      if (bmi != null) 'bmi': bmi,
      if (bloodGroup != null) 'bloodGroup': bloodGroup,
      if (heartRate != null) 'heartRate': heartRate,
      if (fitnessLevel != null) 'fitnessLevel': fitnessLevel,
      if (medicalConditions != null) 'medicalConditions': medicalConditions,
      if (allergies != null) 'allergies': allergies,
      if (emergencyNotes != null) 'emergencyNotes': emergencyNotes,
      if (lastCheckup != null) 'lastCheckup': lastCheckup,
    };
  }
}
