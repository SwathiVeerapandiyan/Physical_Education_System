import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_styles.dart';
import '../models/emergency_contact.dart';
import '../providers/api_service.dart';
import '../providers/auth_provider.dart';
import '../providers/toast_provider.dart';
import '../widgets/glass_card.dart';
import '../widgets/main_layout.dart';
import '../widgets/spinner_widget.dart';

class EmergencyContactScreen extends StatefulWidget {
  const EmergencyContactScreen({super.key});

  @override
  State<EmergencyContactScreen> createState() =>
      _EmergencyContactScreenState();
}

class _EmergencyContactScreenState extends State<EmergencyContactScreen> {
  List<EmergencyContactModel> _contacts = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadContacts();
  }

  Future<void> _loadContacts() async {
    setState(() => _loading = true);
    try {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      final userId = auth.user?.id;
      final list = await ApiService.getEmergencyContacts(userId: userId);
      if (mounted) setState(() => _contacts = list);
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  void _showAddDialog() {
    final nameCtrl = TextEditingController();
    final relCtrl = TextEditingController();
    final phoneCtrl = TextEditingController();
    final altPhoneCtrl = TextEditingController();
    final emailCtrl = TextEditingController();
    final addressCtrl = TextEditingController();
    final cityCtrl = TextEditingController();
    final stateCtrl = TextEditingController();
    final pincodeCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Add Emergency Contact',
            style: TextStyle(color: AppColors.textPrimary)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameCtrl,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(
                    hintText: 'Contact Name', labelText: 'Name'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: relCtrl,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(
                    hintText: 'e.g. Parent, Coach, Doctor',
                    labelText: 'Relationship'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: phoneCtrl,
                keyboardType: TextInputType.phone,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(
                    hintText: 'Phone Number', labelText: 'Phone'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: altPhoneCtrl,
                keyboardType: TextInputType.phone,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(
                    hintText: 'Alternate Phone (optional)',
                    labelText: 'Alt. Phone'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: emailCtrl,
                keyboardType: TextInputType.emailAddress,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(
                    hintText: 'Email (optional)', labelText: 'Email'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: addressCtrl,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(
                    hintText: 'Address (optional)', labelText: 'Address'),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: cityCtrl,
                      style: const TextStyle(color: AppColors.textPrimary),
                      decoration: AppStyles.inputDecoration(
                          hintText: 'City', labelText: 'City'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextField(
                      controller: stateCtrl,
                      style: const TextStyle(color: AppColors.textPrimary),
                      decoration: AppStyles.inputDecoration(
                          hintText: 'State', labelText: 'State'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              TextField(
                controller: pincodeCtrl,
                keyboardType: TextInputType.number,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(
                    hintText: 'PIN Code', labelText: 'PIN Code'),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            child: const Text('Cancel',
                style: TextStyle(color: AppColors.textMuted)),
            onPressed: () => Navigator.pop(ctx),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.error,
                foregroundColor: Colors.white),
            child: const Text('Add Contact'),
            onPressed: () async {
              if (nameCtrl.text.trim().isEmpty) return;
              final auth =
                  Provider.of<AuthProvider>(context, listen: false);
              final userId = auth.user?.id;
              final toast =
                  Provider.of<ToastProvider>(context, listen: false);
              try {
                await ApiService.createEmergencyContact(EmergencyContactModel(
                  userId: userId,
                  contactName: nameCtrl.text.trim(),
                  relationship: relCtrl.text.trim().isNotEmpty
                      ? relCtrl.text.trim()
                      : null,
                  phoneNumber: phoneCtrl.text.trim().isNotEmpty
                      ? phoneCtrl.text.trim()
                      : null,
                  alternatePhone: altPhoneCtrl.text.trim().isNotEmpty
                      ? altPhoneCtrl.text.trim()
                      : null,
                  email: emailCtrl.text.trim().isNotEmpty
                      ? emailCtrl.text.trim()
                      : null,
                  address: addressCtrl.text.trim().isNotEmpty
                      ? addressCtrl.text.trim()
                      : null,
                  city: cityCtrl.text.trim().isNotEmpty
                      ? cityCtrl.text.trim()
                      : null,
                  state: stateCtrl.text.trim().isNotEmpty
                      ? stateCtrl.text.trim()
                      : null,
                  pincode: pincodeCtrl.text.trim().isNotEmpty
                      ? pincodeCtrl.text.trim()
                      : null,
                ));
                toast.showToast('Emergency contact added', 'success');
                if (ctx.mounted) Navigator.pop(ctx);
                _loadContacts();
              } catch (e) {
                toast.showToast('Failed to add contact: $e', 'error');
              }
            },
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return MainLayout(
      currentRoute: '/emergency-contacts',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Emergency Contacts',
                style: TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 24,
                    fontWeight: FontWeight.bold),
              ),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.error,
                    foregroundColor: Colors.white),
                onPressed: _showAddDialog,
                icon: const Icon(Icons.phone_in_talk, size: 18),
                label: const Text('Add Contact'),
              ),
            ],
          ),
          const SizedBox(height: 20),

          Expanded(
            child: _loading
                ? const SpinnerWidget(
                    message: 'Loading emergency directory...')
                : _contacts.isEmpty
                    ? const Center(
                        child: Text('No emergency contacts saved',
                            style:
                                TextStyle(color: AppColors.textMuted)))
                    : ListView.builder(
                        itemCount: _contacts.length,
                        itemBuilder: (context, index) {
                          final c = _contacts[index];
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: GlassCard(
                              padding: const EdgeInsets.all(16),
                              child: Row(
                                children: [
                                  const Text('🚨',
                                      style: TextStyle(fontSize: 24)),
                                  const SizedBox(width: 16),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          c.contactName ?? 'Emergency Line',
                                          style: const TextStyle(
                                              color: AppColors.textPrimary,
                                              fontWeight: FontWeight.bold,
                                              fontSize: 16),
                                        ),
                                        Text(
                                          '${c.relationship ?? 'General'} | ${c.phoneNumber ?? '108'}',
                                          style: const TextStyle(
                                              color: AppColors.error,
                                              fontWeight: FontWeight.w600,
                                              fontSize: 14),
                                        ),
                                        if (c.email != null &&
                                            c.email!.isNotEmpty)
                                          Text(
                                            c.email!,
                                            style: const TextStyle(
                                                color: AppColors.textMuted,
                                                fontSize: 12),
                                          ),
                                        if (c.city != null ||
                                            c.state != null)
                                          Text(
                                            [c.city, c.state]
                                                .where((s) =>
                                                    s != null &&
                                                    s.isNotEmpty)
                                                .join(', '),
                                            style: const TextStyle(
                                                color: AppColors.textMuted,
                                                fontSize: 12),
                                          ),
                                      ],
                                    ),
                                  ),
                                  IconButton(
                                    icon: const Icon(Icons.call,
                                        color: AppColors.success),
                                    onPressed: () {
                                      Provider.of<ToastProvider>(context,
                                              listen: false)
                                          .showToast(
                                              'Dialing ${c.phoneNumber}...',
                                              'info');
                                    },
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}
