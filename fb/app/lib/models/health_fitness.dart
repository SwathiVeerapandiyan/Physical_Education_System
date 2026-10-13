class HealthFitnessModel {
  final int? recordId;
  final int? userId;
  final double? height;
  final double? weight;
  final String? bmi;
  final String? fitnessLevel;
  final String? lastCheckupDate;

  HealthFitnessModel({
    this.recordId,
    this.userId,
    this.height,
    this.weight,
    this.bmi,
    this.fitnessLevel,
    this.lastCheckupDate,
  });

  factory HealthFitnessModel.fromJson(Map<String, dynamic> json) {
    return HealthFitnessModel(
      recordId: json['recordId'] as int?,
      userId: json['userId'] as int?,
      height: ((json['height'] ?? json['heightCm']) as num?)?.toDouble(),
      weight: ((json['weight'] ?? json['weightKg']) as num?)?.toDouble(),
      bmi: json['bmi']?.toString(),
      fitnessLevel: json['fitnessLevel'] as String?,
      lastCheckupDate: (json['lastCheckupDate'] ?? json['lastCheckup']) as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (recordId != null) 'recordId': recordId,
      'userId': userId,
      'height': height,
      'heightCm': height,
      'weight': weight,
      'weightKg': weight,
      'bmi': bmi != null ? double.tryParse(bmi!) : null,
      'fitnessLevel': fitnessLevel,
      'lastCheckupDate': lastCheckupDate,
      'lastCheckup': lastCheckupDate,
    };
  }

}
