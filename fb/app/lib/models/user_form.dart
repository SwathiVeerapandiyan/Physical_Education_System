class UserFormModel {
  final int? id;
  final String? name;
  final String? registerNo;
  final String? email;
  final String? dept;
  final String? gender;
  final String? batch;
  final String? address;
  final String? phone;
  final String? sportsSpecialty;
  final String? dob;
  final String? password;
  final String? bloodGroup;
  final String? nationality;
  final String? region;

  UserFormModel({
    this.id,
    this.name,
    this.registerNo,
    this.email,
    this.dept,
    this.gender,
    this.batch,
    this.address,
    this.phone,
    this.sportsSpecialty,
    this.dob,
    this.password,
    this.bloodGroup,
    this.nationality,
    this.region,
  });

  factory UserFormModel.fromJson(Map<String, dynamic> json) {
    return UserFormModel(
      id: json['id'] as int?,
      name: json['name'] as String?,
      registerNo: json['registerNo'] as String?,
      email: json['email'] as String?,
      dept: json['dept'] as String?,
      gender: json['gender'] as String?,
      batch: json['batch'] as String?,
      address: (json['address'] ?? json['permanentAddress']) as String?,
      phone: (json['phone'] ?? json['mobileNo']?.toString()) as String?,
      sportsSpecialty: (json['sportsSpecialty'] ?? json['specialization']) as String?,
      dob: json['dob'] as String?,
      password: json['password'] as String?,
      bloodGroup: json['bloodGroup'] as String?,
      nationality: json['nationality'] as String?,
      region: json['region'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    final mob = int.tryParse(phone?.replaceAll(RegExp(r'\D'), '') ?? '') ?? 9876543210;
    return {
      if (id != null) 'id': id,
      'name': name ?? '',
      if (registerNo != null) 'registerNo': registerNo,
      'email': email ?? '',
      'password': (password != null && password!.isNotEmpty) ? password! : 'password123',
      if (dept != null) 'dept': dept,
      'gender': gender ?? 'Male',
      'batch': (batch != null && batch!.isNotEmpty) ? batch! : '2024-2025',
      'dob': (dob != null && dob!.isNotEmpty) ? dob! : '2002-01-01',
      'mobileNo': mob,
      'phone': phone ?? mob.toString(),
      'permanentAddress': address ?? 'Campus',
      'address': address ?? 'Campus',
      'specialization': sportsSpecialty ?? 'Athletics',
      'sportsSpecialty': sportsSpecialty ?? 'Athletics',
      'nationality': nationality ?? 'Indian',
      'bloodGroup': bloodGroup ?? 'O+',
      'region': region ?? 'South',
    };
  }
}
