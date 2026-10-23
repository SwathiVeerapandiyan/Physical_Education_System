import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_styles.dart';
import '../models/family_details.dart';
import '../models/user_form.dart';
import '../providers/auth_provider.dart';
import '../providers/api_service.dart';
import '../providers/toast_provider.dart';
import '../widgets/glass_card.dart';
import '../widgets/main_layout.dart';
import '../widgets/spinner_widget.dart';

class FamilyDetailsScreen extends StatefulWidget {
  const FamilyDetailsScreen({super.key});

  @override
  State<FamilyDetailsScreen> createState() => _FamilyDetailsScreenState();
}

class _FamilyDetailsScreenState extends State<FamilyDetailsScreen> {
  final _formKey = GlobalKey<FormState>();
  UserFormModel? _myUserForm;
  FamilyDetailsModel? _familyModel;

  bool _loading = true;
  bool _saving = false;

  final _fatherNameCtrl = TextEditingController();
  final _fatherOccCtrl = TextEditingController();
  final _motherNameCtrl = TextEditingController();
  final _motherOccCtrl = TextEditingController();
  final _guardianPhoneCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);
    final user = Provider.of<AuthProvider>(context, listen: false).user;

    if (user != null) {
      try {
        _myUserForm = await ApiService.getMyProfile();

        if (_myUserForm == null) {
          // Initialize base form for the logged-in user if not created yet
          _myUserForm = await ApiService.createUserForm(UserFormModel(
            name: user.name ?? 'Student',
            email: user.email ?? '',
            registerNo: user.registerNo ?? '',
            dept: user.dept ?? 'General',
            phone: user.mobileNo?.toString() ?? '9876543210',
            gender: 'Male',
            batch: '2024-2025',
            address: 'Campus',
            sportsSpecialty: 'Athletics',
          ));
        }

        // Fetch strictly the authenticated user's own family details
        final family = await ApiService.getMyFamily();
        if (family?.familyId != null) {
          _familyModel = family;
          _fatherNameCtrl.text = family!.fatherName ?? '';
          _fatherOccCtrl.text = family.fatherOccupation ?? '';
          _motherNameCtrl.text = family.motherName ?? '';
          _motherOccCtrl.text = family.motherOccupation ?? '';
          _guardianPhoneCtrl.text = family.guardianPhone ?? '';
        }
      } catch (_) {}
    }

    if (mounted) setState(() => _loading = false);
  }

  void _saveFamily() async {
    if (!_formKey.currentState!.validate()) return;
    final toast = Provider.of<ToastProvider>(context, listen: false);

    if (_myUserForm?.id == null) {
      toast.showToast('Please complete your Student Profile Form first', 'warning');
      Navigator.pushReplacementNamed(context, '/profile');
      return;
    }

    setState(() => _saving = true);

    final model = FamilyDetailsModel(
      familyId: _familyModel?.familyId,
      candidateId: _myUserForm!.id,
      fatherName: _fatherNameCtrl.text.trim(),
      fatherOccupation: _fatherOccCtrl.text.trim(),
      motherName: _motherNameCtrl.text.trim(),
      motherOccupation: _motherOccCtrl.text.trim(),
      guardianPhone: _guardianPhoneCtrl.text.trim(),
    );

    try {
      if (_familyModel?.familyId != null) {
        await ApiService.updateFamilyDetails(_familyModel!.familyId!, model);
        toast.showToast('Family details updated successfully!', 'success');
      } else {
        await ApiService.createFamilyDetails(model);
        toast.showToast('Family details saved successfully!', 'success');
      }
      _loadData();
    } catch (e) {
      toast.showToast('Failed to save family details: ${e.toString()}', 'error');
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return MainLayout(
      currentRoute: '/family',
      child: _loading
          ? const SpinnerWidget(message: 'Loading family details...')
          : SingleChildScrollView(
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 680),
                  child: GlassCard(
                    child: Form(
                      key: _formKey,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Family Details',
                            style: TextStyle(color: AppColors.textPrimary, fontSize: 22, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'Emergency contacts and guardian occupational records',
                            style: TextStyle(color: AppColors.textSecondary, fontSize: 14),
                          ),
                          const SizedBox(height: 24),

                          TextFormField(
                            controller: _fatherNameCtrl,
                            style: const TextStyle(color: AppColors.textPrimary),
                            decoration: AppStyles.inputDecoration(hintText: "Father's Full Name", labelText: "Father's Name"),
                            validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                          ),
                          const SizedBox(height: 16),

                          TextFormField(
                            controller: _fatherOccCtrl,
                            style: const TextStyle(color: AppColors.textPrimary),
                            decoration: AppStyles.inputDecoration(hintText: "Father's Occupation", labelText: "Father's Occupation"),
                          ),
                          const SizedBox(height: 16),

                          TextFormField(
                            controller: _motherNameCtrl,
                            style: const TextStyle(color: AppColors.textPrimary),
                            decoration: AppStyles.inputDecoration(hintText: "Mother's Full Name", labelText: "Mother's Name"),
                            validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                          ),
                          const SizedBox(height: 16),

                          TextFormField(
                            controller: _motherOccCtrl,
                            style: const TextStyle(color: AppColors.textPrimary),
                            decoration: AppStyles.inputDecoration(hintText: "Mother's Occupation", labelText: "Mother's Occupation"),
                          ),
                          const SizedBox(height: 16),

                          TextFormField(
                            controller: _guardianPhoneCtrl,
                            style: const TextStyle(color: AppColors.textPrimary),
                            decoration: AppStyles.inputDecoration(hintText: 'Guardian Phone Number', labelText: 'Guardian Phone'),
                            validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                          ),
                          const SizedBox(height: 28),

                          ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                            onPressed: _saving ? null : _saveFamily,
                            icon: const Icon(Icons.save),
                            label: Text(
                              _saving ? 'Saving...' : 'Save Family Details',
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
