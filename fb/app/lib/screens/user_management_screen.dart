import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_styles.dart';
import '../models/user.dart';
import '../models/user_form.dart';
import '../models/family_details.dart';
import '../models/document_details.dart';
import '../providers/api_service.dart';
import '../providers/toast_provider.dart';
import '../widgets/glass_card.dart';
import '../widgets/main_layout.dart';
import '../widgets/spinner_widget.dart';

class UserManagementScreen extends StatefulWidget {
  const UserManagementScreen({super.key});

  @override
  State<UserManagementScreen> createState() => _UserManagementScreenState();
}

class _UserManagementScreenState extends State<UserManagementScreen> {
  List<User> _users = [];
  List<UserFormModel> _userForms = [];
  bool _loading = true;
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _loadUsers();
  }

  Future<void> _loadUsers() async {
    setState(() => _loading = true);
    try {
      final results = await Future.wait([
        ApiService.getAllUsers(),
        ApiService.getAllUserForms(),
      ]);
      if (mounted) {
        setState(() {
          _users = results[0] as List<User>;
          _userForms = results[1] as List<UserFormModel>;
        });
      }
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  void _openStudentDossier(UserFormModel form) {
    showDialog(
      context: context,
      builder: (ctx) => _StudentDossierModal(form: form),
    );
  }

  void _confirmDeleteUser(User user) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.bgSecondary,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.warning_amber_rounded, color: AppColors.error),
            SizedBox(width: 8),
            Text('Confirm Student Deletion', style: TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Text(
          'Are you sure you want to delete the student "${user.name ?? user.username}"?\n\nThis will safely cascade and delete associated student profile forms, family details, and document records to preserve database integrity.',
          style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: AppColors.textMuted)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error, foregroundColor: Colors.white),
            onPressed: () async {
              Navigator.pop(ctx);
              if (user.id == null) return;
              final toast = Provider.of<ToastProvider>(context, listen: false);
              try {
                await ApiService.deleteUser(user.id!);
                toast.showToast('Student deleted successfully', 'info');
                _loadUsers();
              } catch (e) {
                toast.showToast('Failed to delete student: $e', 'error');
              }
            },
            child: const Text('Delete Student'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _users.where((u) {
      final q = _searchQuery.toLowerCase();
      return (u.name?.toLowerCase().contains(q) ?? false) ||
          (u.username.toLowerCase().contains(q)) ||
          (u.email?.toLowerCase().contains(q) ?? false) ||
          (u.registerNo?.toLowerCase().contains(q) ?? false);
    }).toList();

    return MainLayout(
      currentRoute: '/users',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Student User Directory',
                    style: TextStyle(color: AppColors.textPrimary, fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Inspect student dossiers, personal details, family data, and uploaded documents',
                    style: TextStyle(color: AppColors.textMuted, fontSize: 13),
                  ),
                ],
              ),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
                onPressed: _loadUsers,
                icon: const Icon(Icons.refresh, size: 18),
                label: const Text('Refresh'),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Search input
          TextField(
            style: const TextStyle(color: AppColors.textPrimary),
            decoration: AppStyles.inputDecoration(
              hintText: 'Search by name, username, email or reg no...',
              prefixIcon: const Icon(Icons.search, color: AppColors.textMuted),
            ),
            onChanged: (val) => setState(() => _searchQuery = val),
          ),
          const SizedBox(height: 20),

          // Content
          Expanded(
            child: _loading
                ? const SpinnerWidget(message: 'Loading user accounts & dossiers...')
                : GlassCard(
                    padding: const EdgeInsets.all(16),
                    child: filtered.isEmpty
                        ? const Center(child: Text('No user accounts found', style: TextStyle(color: AppColors.textMuted)))
                        : SingleChildScrollView(
                            scrollDirection: Axis.vertical,
                            child: SingleChildScrollView(
                              scrollDirection: Axis.horizontal,
                              child: DataTable(
                                columns: const [
                                  DataColumn(label: Text('Name', style: TextStyle(color: AppColors.textSecondary, fontWeight: FontWeight.bold))),
                                  DataColumn(label: Text('Username', style: TextStyle(color: AppColors.textSecondary, fontWeight: FontWeight.bold))),
                                  DataColumn(label: Text('Reg No', style: TextStyle(color: AppColors.textSecondary, fontWeight: FontWeight.bold))),
                                  DataColumn(label: Text('Email', style: TextStyle(color: AppColors.textSecondary, fontWeight: FontWeight.bold))),
                                  DataColumn(label: Text('Department', style: TextStyle(color: AppColors.textSecondary, fontWeight: FontWeight.bold))),
                                  DataColumn(label: Text('Role', style: TextStyle(color: AppColors.textSecondary, fontWeight: FontWeight.bold))),
                                  DataColumn(label: Text('Actions', style: TextStyle(color: AppColors.textSecondary, fontWeight: FontWeight.bold))),
                                ],
                                rows: filtered.map((u) {
                                  final formMatch = _userForms.firstWhere(
                                    (f) => f.email?.toLowerCase() == u.email?.toLowerCase(),
                                    orElse: () => UserFormModel(
                                      name: u.name,
                                      email: u.email,
                                      registerNo: u.registerNo,
                                      dept: u.dept,
                                    ),
                                  );

                                  return DataRow(cells: [
                                    DataCell(Text(u.name ?? 'N/A', style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold))),
                                    DataCell(Text(u.username, style: const TextStyle(color: AppColors.textSecondary))),
                                    DataCell(Text(u.registerNo ?? 'N/A', style: const TextStyle(color: AppColors.textSecondary))),
                                    DataCell(Text(u.email ?? 'N/A', style: const TextStyle(color: AppColors.textSecondary))),
                                    DataCell(Text(u.dept ?? 'N/A', style: const TextStyle(color: AppColors.textSecondary))),
                                    DataCell(
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                        decoration: BoxDecoration(
                                          color: (u.role?.toUpperCase() == 'ADMIN') ? AppColors.primaryGlow : AppColors.bgTertiary,
                                          borderRadius: BorderRadius.circular(6),
                                        ),
                                        child: Text(
                                          u.role ?? 'STUDENT',
                                          style: TextStyle(
                                            color: (u.role?.toUpperCase() == 'ADMIN') ? AppColors.primary : AppColors.textSecondary,
                                            fontWeight: FontWeight.bold,
                                            fontSize: 11,
                                          ),
                                        ),
                                      ),
                                    ),
                                    DataCell(
                                      Row(
                                        children: [
                                          ElevatedButton.icon(
                                            style: ElevatedButton.styleFrom(
                                              backgroundColor: AppColors.primaryGlow,
                                              foregroundColor: AppColors.primary,
                                              elevation: 0,
                                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                            ),
                                            onPressed: () => _openStudentDossier(formMatch),
                                            icon: const Icon(Icons.folder_shared_outlined, size: 14),
                                            label: const Text('Dossier', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                          ),
                                          const SizedBox(width: 8),
                                          IconButton(
                                            icon: const Icon(Icons.delete_outline, color: AppColors.error, size: 18),
                                            tooltip: 'Delete Student',
                                            onPressed: () => _confirmDeleteUser(u),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ]);
                                }).toList(),
                              ),
                            ),
                          ),
                  ),
          ),
        ],
      ),
    );
  }
}

class _StudentDossierModal extends StatefulWidget {
  final UserFormModel form;

  const _StudentDossierModal({required this.form});

  @override
  State<_StudentDossierModal> createState() => _StudentDossierModalState();
}

class _StudentDossierModalState extends State<_StudentDossierModal> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  FamilyDetailsModel? _family;
  DocumentDetailsModel? _doc;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadDossier();
  }

  Future<void> _loadDossier() async {
    if (widget.form.id != null) {
      try {
        final f = await ApiService.getFamilyByCandidateId(widget.form.id!);
        if (mounted) setState(() => _family = f);
      } catch (_) {}

      try {
        final d = await ApiService.getDocumentByCandidateId(widget.form.id!);
        if (mounted) setState(() => _doc = d);
      } catch (_) {}
    }
    if (mounted) setState(() => _loading = false);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: AppColors.bgSecondary,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      insetPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 620, maxHeight: 600),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: const BoxDecoration(
                border: Border(bottom: BorderSide(color: AppColors.borderColor)),
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    backgroundColor: AppColors.primary,
                    radius: 20,
                    child: Text(
                      widget.form.name != null && widget.form.name!.isNotEmpty
                          ? widget.form.name![0].toUpperCase()
                          : 'S',
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.form.name ?? 'Student Dossier',
                          style: const TextStyle(color: AppColors.textPrimary, fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                        Text(
                          '${widget.form.registerNo ?? 'N/A'} • ${widget.form.dept ?? 'General'}',
                          style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: AppColors.textMuted),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
            ),
            TabBar(
              controller: _tabController,
              labelColor: AppColors.primary,
              unselectedLabelColor: AppColors.textSecondary,
              indicatorColor: AppColors.primary,
              tabs: const [
                Tab(icon: Icon(Icons.person, size: 18), text: 'Personal Details'),
                Tab(icon: Icon(Icons.family_restroom, size: 18), text: 'Family Details'),
                Tab(icon: Icon(Icons.description, size: 18), text: 'Uploaded Documents'),
              ],
            ),
            Expanded(
              child: _loading
                  ? const SpinnerWidget(message: 'Loading dossier records...')
                  : TabBarView(
                      controller: _tabController,
                      children: [
                        Padding(
                          padding: const EdgeInsets.all(20),
                          child: ListView(
                            children: [
                              _item('Full Name', widget.form.name),
                              _item('Register Number', widget.form.registerNo),
                              _item('Email Address', widget.form.email),
                              _item('Department', widget.form.dept),
                              _item('Batch', widget.form.batch),
                              _item('Gender', widget.form.gender),
                              _item('Date of Birth', widget.form.dob),
                              _item('Phone Number', widget.form.phone),
                              _item('Sports Specialty', widget.form.sportsSpecialty),
                              _item('Permanent Address', widget.form.address),
                            ],
                          ),
                        ),
                        Padding(
                          padding: const EdgeInsets.all(20),
                          child: _family == null || _family?.familyId == null
                              ? const Center(child: Text('No family details recorded yet.', style: TextStyle(color: AppColors.textMuted)))
                              : ListView(
                                  children: [
                                    _item('Father Name', _family?.fatherName),
                                    _item('Father Occupation', _family?.fatherOccupation),
                                    _item('Mother Name', _family?.motherName),
                                    _item('Mother Occupation', _family?.motherOccupation),
                                    _item('Guardian Phone', _family?.guardianPhone),
                                  ],
                                ),
                        ),
                        Padding(
                          padding: const EdgeInsets.all(20),
                          child: _doc == null || _doc?.documentId == null
                              ? const Center(child: Text('No documents uploaded yet.', style: TextStyle(color: AppColors.textMuted)))
                              : ListView(
                                  children: [
                                    _item('Aadhar Card Number', _doc?.aadharNo),
                                    _item('Medical Certificate URL', _doc?.medicalCertificateUrl),
                                    _item('Photo URL', _doc?.photoUrl),
                                  ],
                                ),
                        ),
                      ],
                    ),
            ),
          ],
        ),
      ),
    );
  }

  static Widget _item(String label, String? value) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.bgTertiary,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.borderColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
          const SizedBox(height: 4),
          Text(
            value != null && value.isNotEmpty ? value : 'Not provided',
            style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.w600, fontSize: 13),
          ),
        ],
      ),
    );
  }
}
