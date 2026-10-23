import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_styles.dart';
import '../models/user_form.dart';
import '../providers/auth_provider.dart';
import '../providers/api_service.dart';
import '../providers/toast_provider.dart';
import '../widgets/glass_card.dart';
import '../widgets/main_layout.dart';
import '../widgets/spinner_widget.dart';

class UserFormScreen extends StatefulWidget {
  const UserFormScreen({super.key});

  @override
  State<UserFormScreen> createState() => _UserFormScreenState();
}

class _UserFormScreenState extends State<UserFormScreen> {
  final _formKey = GlobalKey<FormState>();
  UserFormModel? _existingForm;
  bool _loading = true;
  bool _saving = false;

  final _nameCtrl = TextEditingController();
  final _regNoCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _deptCtrl = TextEditingController();
  final _batchCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _addressCtrl = TextEditingController();
  final _specialtyCtrl = TextEditingController();
  String _gender = 'MALE';

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    setState(() => _loading = true);
    final user = Provider.of<AuthProvider>(context, listen: false).user;

    if (user != null) {
      _nameCtrl.text = user.name ?? '';
      _regNoCtrl.text = user.registerNo ?? '';
      _emailCtrl.text = user.email ?? '';
      _deptCtrl.text = user.dept ?? '';

      try {
        // Fetch strictly the authenticated user's own profile
        final myForm = await ApiService.getMyProfile();

        if (myForm != null && myForm.id != null) {
          _existingForm = myForm;
          _nameCtrl.text = myForm.name ?? _nameCtrl.text;
          _regNoCtrl.text = myForm.registerNo ?? _regNoCtrl.text;
          _emailCtrl.text = myForm.email ?? _emailCtrl.text;
          _deptCtrl.text = myForm.dept ?? _deptCtrl.text;
          _batchCtrl.text = myForm.batch ?? '';
          _phoneCtrl.text = myForm.phone ?? '';
          _addressCtrl.text = myForm.address ?? '';
          _specialtyCtrl.text = myForm.sportsSpecialty ?? '';
          if (myForm.gender != null && myForm.gender!.isNotEmpty) {
            _gender = myForm.gender!;
          }
        }
      } catch (_) {}
    }

    if (mounted) setState(() => _loading = false);
  }

  void _saveProfile() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);

    final toast = Provider.of<ToastProvider>(context, listen: false);

    final model = UserFormModel(
      id: _existingForm?.id,
      name: _nameCtrl.text.trim(),
      registerNo: _regNoCtrl.text.trim(),
      email: _emailCtrl.text.trim(),
      dept: _deptCtrl.text.trim(),
      gender: _gender,
      batch: _batchCtrl.text.trim(),
      phone: _phoneCtrl.text.trim(),
      address: _addressCtrl.text.trim(),
      sportsSpecialty: _specialtyCtrl.text.trim(),
    );

    try {
      final updated = await ApiService.updateMyProfile(model);
      _existingForm = updated;
      toast.showToast('Profile updated successfully in database!', 'success');
      _loadProfile();
    } catch (e) {
      // Fallback if not created yet
      try {
        final created = await ApiService.createUserForm(model);
        _existingForm = created;
        toast.showToast('Profile saved successfully!', 'success');
        _loadProfile();
      } catch (err) {
        toast.showToast('Failed to save profile: ${err.toString()}', 'error');
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return MainLayout(
      currentRoute: '/profile',
      child: _loading
          ? const SpinnerWidget(message: 'Loading student profile form...')
          : SingleChildScrollView(
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 720),
                  child: GlassCard(
                    child: Form(
                      key: _formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                _existingForm?.id != null ? 'Edit Student Profile' : 'Complete Student Profile',
                                style: const TextStyle(color: AppColors.textPrimary, fontSize: 22, fontWeight: FontWeight.bold),
                              ),
                              if (_existingForm?.id != null)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                  decoration: BoxDecoration(color: AppColors.primaryGlow, borderRadius: BorderRadius.circular(20)),
                                  child: const Text('Profile Active ✓', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 12)),
                                ),
                            ],
                          ),
                          const SizedBox(height: 24),

                          Wrap(
                            spacing: 16,
                            runSpacing: 16,
                            children: [
                              SizedBox(
                                width: 330,
                                child: TextFormField(
                                  controller: _nameCtrl,
                                  style: const TextStyle(color: AppColors.textPrimary),
                                  decoration: AppStyles.inputDecoration(hintText: 'Full Name', labelText: 'Name'),
                                  validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                                ),
                              ),
                              SizedBox(
                                width: 330,
                                child: TextFormField(
                                  controller: _regNoCtrl,
                                  style: const TextStyle(color: AppColors.textPrimary),
                                  decoration: AppStyles.inputDecoration(hintText: 'Register Number', labelText: 'Reg No'),
                                  validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                                ),
                              ),
                              SizedBox(
                                width: 330,
                                child: TextFormField(
                                  controller: _emailCtrl,
                                  style: const TextStyle(color: AppColors.textPrimary),
                                  decoration: AppStyles.inputDecoration(hintText: 'Email Address', labelText: 'Email'),
                                  validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                                ),
                              ),
                              SizedBox(
                                width: 330,
                                child: TextFormField(
                                  controller: _deptCtrl,
                                  style: const TextStyle(color: AppColors.textPrimary),
                                  decoration: AppStyles.inputDecoration(hintText: 'Department', labelText: 'Dept'),
                                ),
                              ),
                              SizedBox(
                                width: 330,
                                child: DropdownButtonFormField<String>(
                                  value: _gender,
                                  dropdownColor: AppColors.bgSecondary,
                                  style: const TextStyle(color: AppColors.textPrimary),
                                  decoration: AppStyles.inputDecoration(hintText: 'Select Gender', labelText: 'Gender'),
                                  items: const [
                                    DropdownMenuItem(value: 'MALE', child: Text('Male')),
                                    DropdownMenuItem(value: 'FEMALE', child: Text('Female')),
                                    DropdownMenuItem(value: 'OTHER', child: Text('Other')),
                                  ],
                                  onChanged: (v) => setState(() => _gender = v!),
                                ),
                              ),
                              SizedBox(
                                width: 330,
                                child: TextFormField(
                                  controller: _batchCtrl,
                                  style: const TextStyle(color: AppColors.textPrimary),
                                  decoration: AppStyles.inputDecoration(hintText: 'Batch Year (e.g. 2024-2026)', labelText: 'Batch'),
                                ),
                              ),
                              SizedBox(
                                width: 330,
                                child: TextFormField(
                                  controller: _phoneCtrl,
                                  style: const TextStyle(color: AppColors.textPrimary),
                                  decoration: AppStyles.inputDecoration(hintText: 'Contact Phone Number', labelText: 'Phone'),
                                ),
                              ),
                              SizedBox(
                                width: 330,
                                child: TextFormField(
                                  controller: _specialtyCtrl,
                                  style: const TextStyle(color: AppColors.textPrimary),
                                  decoration: AppStyles.inputDecoration(hintText: 'Sports Specialty (e.g. Basketball, Sprinting)', labelText: 'Sports Specialty'),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),

                          TextFormField(
                            controller: _addressCtrl,
                            maxLines: 3,
                            style: const TextStyle(color: AppColors.textPrimary),
                            decoration: AppStyles.inputDecoration(hintText: 'Full Residential Address', labelText: 'Address'),
                          ),
                          const SizedBox(height: 28),

                          ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                            onPressed: _saving ? null : _saveProfile,
                            icon: const Icon(Icons.save),
                            label: Text(
                              _saving ? 'Saving...' : 'Save Profile',
                              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
    );
  }
}
