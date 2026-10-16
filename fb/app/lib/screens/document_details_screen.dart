import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_styles.dart';
import '../models/document_details.dart';
import '../models/user_form.dart';
import '../providers/auth_provider.dart';
import '../providers/api_service.dart';
import '../providers/toast_provider.dart';
import '../widgets/glass_card.dart';
import '../widgets/main_layout.dart';
import '../widgets/spinner_widget.dart';

class DocumentDetailsScreen extends StatefulWidget {
  const DocumentDetailsScreen({super.key});

  @override
  State<DocumentDetailsScreen> createState() => _DocumentDetailsScreenState();
}

class _DocumentDetailsScreenState extends State<DocumentDetailsScreen> {
  final _formKey = GlobalKey<FormState>();
  UserFormModel? _myUserForm;
  DocumentDetailsModel? _docModel;

  bool _loading = true;
  bool _saving = false;

  final _aadharCtrl = TextEditingController();
  final _medCertCtrl = TextEditingController();
  final _photoUrlCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);
    final user = Provider.of<AuthProvider>(context, listen: false).user;

    if (user?.email != null) {
      try {
        final forms = await ApiService.getAllUserForms();
        final match = forms.where(
          (f) => f.email?.toLowerCase() == user!.email?.toLowerCase(),
        ).toList();

        if (match.isNotEmpty) {
          _myUserForm = match.first;
        } else {
          // Initialize base form for the logged-in user if not created yet
          _myUserForm = await ApiService.createUserForm(UserFormModel(
            name: user!.name ?? 'Student',
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

        if (_myUserForm?.id != null) {
          final doc = await ApiService.getDocumentByCandidateId(_myUserForm!.id!);
          if (doc?.documentId != null) {
            _docModel = doc;
            _aadharCtrl.text = doc!.aadharNo ?? '';
            _medCertCtrl.text = doc.medicalCertificateUrl ?? '';
            _photoUrlCtrl.text = doc.photoUrl ?? '';
          }
        }
      } catch (_) {}
    }

    if (mounted) setState(() => _loading = false);
  }

  void _saveDoc() async {
    if (!_formKey.currentState!.validate()) return;
    final toast = Provider.of<ToastProvider>(context, listen: false);

    if (_myUserForm?.id == null) {
      toast.showToast('Please complete your Student Profile Form first', 'warning');
      Navigator.pushReplacementNamed(context, '/profile');
      return;
    }

    setState(() => _saving = true);

    final model = DocumentDetailsModel(
      documentId: _docModel?.documentId,
      candidateId: _myUserForm!.id,
      aadharNo: _aadharCtrl.text.trim(),
      medicalCertificateUrl: _medCertCtrl.text.trim(),
      photoUrl: _photoUrlCtrl.text.trim(),
    );

    try {
      if (_docModel?.documentId != null) {
        await ApiService.updateDocumentDetails(_docModel!.documentId!, model);
        toast.showToast('Documents updated successfully!', 'success');
      } else {
        await ApiService.createDocumentDetails(model);
        toast.showToast('Documents saved successfully!', 'success');
      }
      _loadData();
    } catch (e) {
      toast.showToast('Failed to save document details: ${e.toString()}', 'error');
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return MainLayout(
      currentRoute: '/documents',
      child: _loading
          ? const SpinnerWidget(message: 'Loading document details...')
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
                            'Document Details',
                            style: TextStyle(color: AppColors.textPrimary, fontSize: 22, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 8),
                          const Text(
                            'Identification & Medical Fitness Verification Records',
                            style: TextStyle(color: AppColors.textSecondary, fontSize: 14),
                          ),
                          const SizedBox(height: 24),

                          TextFormField(
                            controller: _aadharCtrl,
                            style: const TextStyle(color: AppColors.textPrimary),
                            decoration: AppStyles.inputDecoration(hintText: 'Aadhar Card / Gov ID Number', labelText: 'Aadhar No'),
                            validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                          ),
                          const SizedBox(height: 16),

                          TextFormField(
                            controller: _medCertCtrl,
                            style: const TextStyle(color: AppColors.textPrimary),
                            decoration: AppStyles.inputDecoration(hintText: 'Medical Certificate Document Link / Reference', labelText: 'Medical Certificate'),
                          ),
                          const SizedBox(height: 16),

                          TextFormField(
                            controller: _photoUrlCtrl,
                            style: const TextStyle(color: AppColors.textPrimary),
                            decoration: AppStyles.inputDecoration(hintText: 'Passport Photo URL / Asset Link', labelText: 'Photo URL'),
                          ),
                          const SizedBox(height: 28),

                          ElevatedButton.icon(
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.primary,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                            onPressed: _saving ? null : _saveDoc,
                            icon: const Icon(Icons.cloud_upload),
                            label: Text(
                              _saving ? 'Saving...' : 'Save Documents',
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
