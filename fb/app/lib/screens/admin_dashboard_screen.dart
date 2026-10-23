import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_styles.dart';
import '../models/dashboard_stats.dart';
import '../models/user.dart';
import '../models/user_form.dart';
import '../models/family_details.dart';
import '../models/document_details.dart';
import '../models/registration_notification.dart';
import '../providers/auth_provider.dart';
import '../providers/notification_provider.dart';
import '../providers/api_service.dart';
import '../providers/toast_provider.dart';
import '../widgets/glass_card.dart';
import '../widgets/main_layout.dart';
import '../widgets/spinner_widget.dart';

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
  DashboardStats _stats = DashboardStats();
  List<User> _users = [];
  List<UserFormModel> _userForms = [];
  bool _loading = true;
  String _searchQuery = '';
  RegistrationNotification? _handledPopup;
  int _pendingEquipmentCount = 0;
  int _pendingGroundCount = 0;

  @override
  void initState() {
    super.initState();
    _loadAdminData();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<NotificationProvider>(context, listen: false).startListening();
    });
  }

  Future<void> _loadAdminData() async {
    setState(() => _loading = true);
    try {
      final stats = await ApiService.getDashboardStats();
      if (mounted) setState(() => _stats = stats);
    } catch (_) {}

    try {
      final users = await ApiService.getAllUsers();
      if (mounted) setState(() => _users = users);
    } catch (_) {}

    try {
      final forms = await ApiService.getAllUserForms();
      if (mounted) setState(() => _userForms = forms);
    } catch (_) {}

    try {
      final eq = await ApiService.getEquipmentBookings(status: 'Pending');
      if (mounted) setState(() => _pendingEquipmentCount = eq.length);
    } catch (_) {}

    try {
      final grounds = await ApiService.getGroundBookings(status: 'Pending');
      if (mounted) setState(() => _pendingGroundCount = grounds.length);
    } catch (_) {}

    if (mounted) setState(() => _loading = false);
  }

  void _checkAndTriggerNewStudentPopup(RegistrationNotification notification) {
    if (_handledPopup?.notificationId == notification.notificationId) return;
    _handledPopup = notification;

    // Refresh data automatically
    _loadAdminData();

    final isBooking = notification.isEquipmentBooking || notification.isGroundBooking;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.bgSecondary,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(
            color: isBooking ? AppColors.warning : AppColors.primary,
            width: 1.5,
          ),
        ),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: isBooking ? AppColors.warning.withValues(alpha: 0.2) : AppColors.primaryGlow,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(notification.iconEmoji, style: const TextStyle(fontSize: 22)),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                notification.titleText,
                style: const TextStyle(color: AppColors.textPrimary, fontSize: 18, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              isBooking
                  ? 'A student has submitted a new reservation request awaiting administrative approval.'
                  : 'A new student account has registered successfully and was saved to the database.',
              style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.bgTertiary,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.borderColor),
              ),
              child: Column(
                children: [
                  _dossierRow('Student Name', notification.studentName),
                  if (notification.registerNo.isNotEmpty) ...[
                    const Divider(height: 12, color: AppColors.borderColor),
                    _dossierRow('Register No', notification.registerNo),
                  ],
                  if (isBooking) ...[
                    const Divider(height: 12, color: AppColors.borderColor),
                    _dossierRow('Details', notification.dept),
                  ] else ...[
                    const Divider(height: 12, color: AppColors.borderColor),
                    _dossierRow('Department', notification.dept),
                    const Divider(height: 12, color: AppColors.borderColor),
                    _dossierRow('Email', notification.email),
                  ],
                  if (notification.mobileNo != null) ...[
                    const Divider(height: 12, color: AppColors.borderColor),
                    _dossierRow('Mobile No', notification.mobileNo.toString()),
                  ],
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              Provider.of<NotificationProvider>(context, listen: false).dismissLatestPopup();
            },
            child: const Text('Dismiss', style: TextStyle(color: AppColors.textMuted)),
          ),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: isBooking ? AppColors.warning : AppColors.primary,
              foregroundColor: isBooking ? Colors.black : Colors.white,
            ),
            onPressed: () {
              Navigator.pop(ctx);
              Provider.of<NotificationProvider>(context, listen: false).dismissLatestPopup();
              if (isBooking) {
                Navigator.pushNamed(context, notification.routeTarget).then((_) => _loadAdminData());
              } else {
                _inspectStudentByEmail(notification.email);
              }
            },
            icon: Icon(isBooking ? Icons.arrow_forward : Icons.visibility, size: 16),
            label: Text(
              notification.isEquipmentBooking
                  ? 'Review Equipment'
                  : (notification.isGroundBooking ? 'Review Grounds' : 'Inspect Dossier'),
            ),
          ),
        ],
      ),
    );
  }

  void _showNotificationsSheet() {
    final notifProvider = Provider.of<NotificationProvider>(context, listen: false);
    showModalBottomSheet(
      context: context,
      backgroundColor: AppColors.bgSecondary,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => Consumer<NotificationProvider>(
        builder: (context, np, _) {
          return Container(
            height: MediaQuery.of(context).size.height * 0.7,
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.notifications_outlined, color: AppColors.primary),
                        const SizedBox(width: 8),
                        const Text(
                          'Department Notifications',
                          style: TextStyle(color: AppColors.textPrimary, fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(width: 8),
                        if (np.unreadCount > 0)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(10)),
                            child: Text('${np.unreadCount} new', style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                          ),
                      ],
                    ),
                    TextButton(
                      onPressed: () => np.markAllAsRead(),
                      child: const Text('Mark all read', style: TextStyle(color: AppColors.primary, fontSize: 12)),
                    ),
                  ],
                ),
                const Divider(color: AppColors.borderColor),
                Expanded(
                  child: np.notifications.isEmpty
                      ? const Center(
                          child: Text('No department notifications recorded yet.', style: TextStyle(color: AppColors.textMuted)),
                        )
                      : ListView.separated(
                          itemCount: np.notifications.length,
                          separatorBuilder: (_, __) => const Divider(color: AppColors.borderColor, height: 1),
                          itemBuilder: (context, idx) {
                            final n = np.notifications[idx];
                            return ListTile(
                              leading: CircleAvatar(
                                backgroundColor: n.isRead ? AppColors.bgTertiary : AppColors.primaryGlow,
                                child: Text(n.iconEmoji, style: const TextStyle(fontSize: 16)),
                              ),
                              title: Text(
                                '${n.titleText}: ${n.studentName}',
                                style: TextStyle(
                                  color: AppColors.textPrimary,
                                  fontWeight: n.isRead ? FontWeight.normal : FontWeight.bold,
                                  fontSize: 14,
                                ),
                              ),
                              subtitle: Text(
                                n.isStudentRegistration
                                    ? '${n.registerNo} • ${n.dept} • ${n.email}'
                                    : '${n.registerNo.isNotEmpty ? n.registerNo + ' • ' : ''}${n.dept}',
                                style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                              ),
                              trailing: IconButton(
                                icon: const Icon(Icons.arrow_forward_ios, size: 14, color: AppColors.textMuted),
                                onPressed: () {
                                  if (n.notificationId != null) np.markAsRead(n.notificationId!);
                                  Navigator.pop(ctx);
                                  if (n.isStudentRegistration) {
                                    _inspectStudentByEmail(n.email);
                                  } else {
                                    Navigator.pushNamed(context, n.routeTarget).then((_) => _loadAdminData());
                                  }
                                },
                              ),
                            );
                          },
                        ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  void _inspectStudentByEmail(String email) async {
    final form = _userForms.firstWhere(
      (f) => f.email?.toLowerCase() == email.toLowerCase(),
      orElse: () => UserFormModel(name: 'Student', email: email),
    );
    _openStudentDossier(form);
  }

  void _openStudentDossier(UserFormModel form) async {
    showDialog(
      context: context,
      builder: (ctx) => _StudentDossierDialog(form: form),
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
            Text('Confirm Deletion', style: TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Text(
          'Are you sure you want to delete the student record for "${user.name ?? user.username}"?\n\nThis will safely cascade and remove related student profile forms, family details, and document records to preserve database integrity.',
          style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: AppColors.textMuted)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
              foregroundColor: Colors.white,
            ),
            onPressed: () async {
              Navigator.pop(ctx);
              if (user.id == null) return;
              final toast = Provider.of<ToastProvider>(context, listen: false);
              try {
                await ApiService.deleteUser(user.id!);
                toast.showToast('Student deleted successfully', 'success');
                _loadAdminData();
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

  static Widget _dossierRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
        Text(
          value.isNotEmpty ? value : 'N/A',
          style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 13),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final notifProvider = Provider.of<NotificationProvider>(context);

    // Check if new registration popup was emitted
    if (notifProvider.latestPopupNotification != null &&
        _handledPopup?.notificationId != notifProvider.latestPopupNotification!.notificationId) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _checkAndTriggerNewStudentPopup(notifProvider.latestPopupNotification!);
      });
    }

    final filteredUsers = _users.where((u) {
      final q = _searchQuery.toLowerCase();
      return (u.name?.toLowerCase().contains(q) ?? false) ||
          (u.username.toLowerCase().contains(q)) ||
          (u.email?.toLowerCase().contains(q) ?? false) ||
          (u.registerNo?.toLowerCase().contains(q) ?? false);
    }).toList();

    return MainLayout(
      currentRoute: '/admin/dashboard',
      child: _loading
          ? const SpinnerWidget(message: 'Loading Administrator Command Center...')
          : SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Top Banner with Notification Center
                  GlassCard(
                    padding: const EdgeInsets.all(24),
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: AppColors.primaryGlow,
                                      borderRadius: BorderRadius.circular(6),
                                      border: Border.all(color: AppColors.primary),
                                    ),
                                    child: const Text(
                                      'ADMINISTRATOR CONSOLE',
                                      style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 11),
                                    ),
                                  ),
                                  const SizedBox(width: 10),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: Colors.green.withOpacity(0.15),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: const Row(
                                      children: [
                                        CircleAvatar(radius: 3, backgroundColor: Colors.green),
                                        SizedBox(width: 5),
                                        Text('Real-Time Sync Active', style: TextStyle(color: Colors.green, fontSize: 10, fontWeight: FontWeight.bold)),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),
                              const Text(
                                'Physical Education Management Dashboard',
                                style: TextStyle(
                                  color: AppColors.textPrimary,
                                  fontSize: 24,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const SizedBox(height: 4),
                              const Text(
                                'Madras Christian College • Full administrative controls, registration monitors & student dossiers',
                                style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                              ),
                            ],
                          ),
                        ),
                        // Real-time Notification Bell
                        Stack(
                          clipBehavior: Clip.none,
                          children: [
                            IconButton.filledTonal(
                              style: IconButton.styleFrom(
                                backgroundColor: AppColors.bgTertiary,
                                foregroundColor: AppColors.primary,
                                padding: const EdgeInsets.all(14),
                              ),
                              icon: const Icon(Icons.notifications_active_outlined, size: 24),
                              tooltip: 'Registration Notifications',
                              onPressed: _showNotificationsSheet,
                            ),
                            if (notifProvider.unreadCount > 0)
                              Positioned(
                                right: -4,
                                top: -4,
                                child: Container(
                                  padding: const EdgeInsets.all(5),
                                  decoration: const BoxDecoration(
                                    color: AppColors.error,
                                    shape: BoxShape.circle,
                                  ),
                                  child: Text(
                                    '${notifProvider.unreadCount}',
                                    style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                                  ),
                                ),
                              ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Pending Booking Approvals Alert Banner (if any)
                  if (_pendingEquipmentCount > 0 || _pendingGroundCount > 0)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 20),
                      child: GlassCard(
                        padding: const EdgeInsets.all(16),
                        child: Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: AppColors.warning.withValues(alpha: 0.2),
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: AppColors.warning),
                              ),
                              child: const Icon(Icons.pending_actions, color: AppColors.warning, size: 28),
                            ),
                            const SizedBox(width: 14),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    'Pending Student Booking Approvals',
                                    style: TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 16),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    '${_pendingEquipmentCount > 0 ? '$_pendingEquipmentCount Equipment request(s) ' : ''}'
                                    '${_pendingEquipmentCount > 0 && _pendingGroundCount > 0 ? '• ' : ''}'
                                    '${_pendingGroundCount > 0 ? '$_pendingGroundCount Ground reservation(s) ' : ''}'
                                    'awaiting administrative review.',
                                    style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 12),
                            Wrap(
                              spacing: 8,
                              runSpacing: 6,
                              children: [
                                if (_pendingEquipmentCount > 0)
                                  ElevatedButton.icon(
                                    style: ElevatedButton.styleFrom(backgroundColor: AppColors.warning, foregroundColor: Colors.black),
                                    onPressed: () => Navigator.pushNamed(context, '/equipment-bookings').then((_) => _loadAdminData()),
                                    icon: const Icon(Icons.sports_basketball, size: 14),
                                    label: Text('Equipment ($_pendingEquipmentCount)'),
                                  ),
                                if (_pendingGroundCount > 0)
                                  ElevatedButton.icon(
                                    style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
                                    onPressed: () => Navigator.pushNamed(context, '/ground-bookings').then((_) => _loadAdminData()),
                                    icon: const Icon(Icons.stadium, size: 14),
                                    label: Text('Grounds ($_pendingGroundCount)'),
                                  ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ),

                  // Admin KPI Cards
                  LayoutBuilder(
                    builder: (context, constraints) {
                      final isWide = constraints.maxWidth > 768;
                      return GridView.count(
                        crossAxisCount: isWide ? 4 : 2,
                        crossAxisSpacing: 16,
                        mainAxisSpacing: 16,
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        childAspectRatio: isWide ? 1.6 : 1.3,
                        children: [
                          _KpiTile(title: 'Total Students', value: _users.length, subtitle: 'Active users in DB', color: AppColors.primary, icon: Icons.people),
                          _KpiTile(title: 'Completed Profiles', value: _stats.totalCandidates, subtitle: 'UserForm records', color: AppColors.success, icon: Icons.how_to_reg),
                          _KpiTile(
                            title: 'Pending Equipment',
                            value: _pendingEquipmentCount,
                            subtitle: _pendingEquipmentCount > 0 ? 'Action required' : 'All clear',
                            color: _pendingEquipmentCount > 0 ? AppColors.warning : AppColors.textMuted,
                            icon: Icons.sports_basketball,
                          ),
                          _KpiTile(
                            title: 'Pending Grounds',
                            value: _pendingGroundCount,
                            subtitle: _pendingGroundCount > 0 ? 'Action required' : 'All clear',
                            color: _pendingGroundCount > 0 ? AppColors.accent : AppColors.textMuted,
                            icon: Icons.stadium,
                          ),
                        ],
                      );
                    },
                  ),
                  const SizedBox(height: 24),

                  // ==========================================
                  // STUDENT DIRECTORY & DOSSIER INSPECTOR
                  // ==========================================
                  GlassCard(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Row(
                              children: [
                                Text('👥 ', style: TextStyle(fontSize: 20)),
                                Text(
                                  'Registered Students & Dossiers',
                                  style: TextStyle(color: AppColors.textPrimary, fontSize: 18, fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                            ElevatedButton.icon(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.primary,
                                foregroundColor: Colors.white,
                              ),
                              onPressed: _loadAdminData,
                              icon: const Icon(Icons.refresh, size: 16),
                              label: const Text('Refresh List'),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        const Text(
                          'View comprehensive student profiles, family contact details, and uploaded certificates. Real-time updates automatically append newly registered students.',
                          style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                        ),
                        const SizedBox(height: 16),

                        // Search Input
                        TextField(
                          style: const TextStyle(color: AppColors.textPrimary),
                          decoration: AppStyles.inputDecoration(
                            hintText: 'Search students by name, reg no, department or email...',
                            prefixIcon: const Icon(Icons.search, color: AppColors.textMuted),
                          ),
                          onChanged: (val) => setState(() => _searchQuery = val),
                        ),
                        const SizedBox(height: 16),

                        // Students Table
                        filteredUsers.isEmpty
                            ? const Padding(
                                padding: EdgeInsets.all(24),
                                child: Center(child: Text('No students matching your criteria.', style: TextStyle(color: AppColors.textMuted))),
                              )
                            : SingleChildScrollView(
                                scrollDirection: Axis.horizontal,
                                child: DataTable(
                                  columnSpacing: 24,
                                  columns: const [
                                    DataColumn(label: Text('Student Name', style: TextStyle(color: AppColors.textSecondary, fontWeight: FontWeight.bold))),
                                    DataColumn(label: Text('Reg No', style: TextStyle(color: AppColors.textSecondary, fontWeight: FontWeight.bold))),
                                    DataColumn(label: Text('Department', style: TextStyle(color: AppColors.textSecondary, fontWeight: FontWeight.bold))),
                                    DataColumn(label: Text('Email', style: TextStyle(color: AppColors.textSecondary, fontWeight: FontWeight.bold))),
                                    DataColumn(label: Text('Role', style: TextStyle(color: AppColors.textSecondary, fontWeight: FontWeight.bold))),
                                    DataColumn(label: Text('Actions', style: TextStyle(color: AppColors.textSecondary, fontWeight: FontWeight.bold))),
                                  ],
                                  rows: filteredUsers.map((u) {
                                    final formMatch = _userForms.firstWhere(
                                      (f) => f.email?.toLowerCase() == u.email?.toLowerCase(),
                                      orElse: () => UserFormModel(
                                        name: u.name,
                                        email: u.email,
                                        registerNo: u.registerNo,
                                        dept: u.dept,
                                      ),
                                    );

                                    return DataRow(
                                      cells: [
                                        DataCell(Text(u.name ?? u.username, style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold))),
                                        DataCell(Text(u.registerNo ?? 'N/A', style: const TextStyle(color: AppColors.textSecondary))),
                                        DataCell(Text(u.dept ?? 'N/A', style: const TextStyle(color: AppColors.textSecondary))),
                                        DataCell(Text(u.email ?? 'N/A', style: const TextStyle(color: AppColors.textSecondary))),
                                        DataCell(
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                            decoration: BoxDecoration(
                                              color: (u.role?.toUpperCase() == 'ADMIN') ? AppColors.primaryGlow : AppColors.bgTertiary,
                                              borderRadius: BorderRadius.circular(4),
                                            ),
                                            child: Text(
                                              u.role ?? 'STUDENT',
                                              style: TextStyle(
                                                color: (u.role?.toUpperCase() == 'ADMIN') ? AppColors.primary : AppColors.textMuted,
                                                fontSize: 10,
                                                fontWeight: FontWeight.bold,
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
                                                icon: const Icon(Icons.folder_open, size: 14),
                                                label: const Text('Inspect Dossier', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
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
                                      ],
                                    );
                                  }).toList(),
                                ),
                              ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // ==========================================
                  // MODULE MANAGEMENT NAVIGATION CARDS
                  // ==========================================
                  const Row(
                    children: [
                      Text('⚙️ ', style: TextStyle(fontSize: 20)),
                      Text(
                        'Management Modules',
                        style: TextStyle(color: AppColors.textPrimary, fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  LayoutBuilder(
                    builder: (context, constraints) {
                      return GridView.count(
                        crossAxisCount: constraints.maxWidth > 900 ? 4 : (constraints.maxWidth > 600 ? 3 : 2),
                        crossAxisSpacing: 14,
                        mainAxisSpacing: 14,
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        childAspectRatio: constraints.maxWidth > 600 ? 1.4 : 1.2,
                        children: [
                          _ModuleCard(icon: '🏀', title: 'Sports Directory', desc: 'Create, edit & manage sports', route: '/sports'),
                          _ModuleCard(icon: '🏆', title: 'Tournaments', desc: 'Schedules & tournament CRUD', route: '/tournaments'),
                          _ModuleCard(icon: '🛡️', title: 'Teams & Squads', desc: 'Rosters & team members', route: '/teams'),
                          _ModuleCard(icon: '⚽', title: 'Match Fixtures', desc: 'Fixtures, dates & venues', route: '/matches'),
                          _ModuleCard(icon: '⚡', title: 'Live Scoreboard', desc: 'Update match points & sets', route: '/live-scores'),
                          _ModuleCard(
                            icon: '🏀',
                            title: 'Equipment Bookings',
                            desc: 'Gear reservation requests',
                            route: '/equipment-bookings',
                            badgeText: _pendingEquipmentCount > 0 ? '$_pendingEquipmentCount Pending' : null,
                          ),
                          _ModuleCard(
                            icon: '🏟️',
                            title: 'Ground Bookings',
                            desc: 'Field reservation approvals',
                            route: '/ground-bookings',
                            badgeText: _pendingGroundCount > 0 ? '$_pendingGroundCount Pending' : null,
                          ),
                          _ModuleCard(icon: '📢', title: 'Notice Board', desc: 'Post bulletins & alerts', route: '/notices'),
                          _ModuleCard(icon: '💬', title: 'Feedback & Reviews', desc: 'Student inquiries & feedback', route: '/feedback'),
                          _ModuleCard(icon: '🩺', title: 'Health & Fitness', desc: 'BMI & medical records', route: '/health-fitness'),
                          _ModuleCard(icon: '🚨', title: 'Emergency Contacts', desc: 'Campus safety directory', route: '/emergency-contacts'),
                          _ModuleCard(icon: '🖼️', title: 'Gallery & Media', desc: 'Athletics event media', route: '/gallery'),
                        ],
                      );
                    },
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
    );
  }
}

class _KpiTile extends StatelessWidget {
  final String title;
  final int value;
  final String subtitle;
  final Color color;
  final IconData icon;

  const _KpiTile({required this.title, required this.value, required this.subtitle, required this.color, required this.icon});

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
              Icon(icon, color: color, size: 20),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            '$value',
            style: const TextStyle(color: AppColors.textPrimary, fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Text(subtitle, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}

class _ModuleCard extends StatelessWidget {
  final String icon;
  final String title;
  final String desc;
  final String route;
  final String? badgeText;

  const _ModuleCard({required this.icon, required this.title, required this.desc, required this.route, this.badgeText});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: () => Navigator.pushReplacementNamed(context, route),
      borderRadius: BorderRadius.circular(12),
      child: GlassCard(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(icon, style: const TextStyle(fontSize: 26)),
                if (badgeText != null)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: AppColors.warning.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.warning),
                    ),
                    child: Text(
                      badgeText!,
                      style: const TextStyle(color: AppColors.warning, fontSize: 10, fontWeight: FontWeight.bold),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              title,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 14),
            ),
            const SizedBox(height: 4),
            Expanded(
              child: Text(
                desc,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
              ),
            ),
            const Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Icon(Icons.arrow_forward, size: 14, color: AppColors.primary),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _StudentDossierDialog extends StatefulWidget {
  final UserFormModel form;

  const _StudentDossierDialog({required this.form});

  @override
  State<_StudentDossierDialog> createState() => _StudentDossierDialogState();
}

class _StudentDossierDialogState extends State<_StudentDossierDialog> with SingleTickerProviderStateMixin {
  late TabController _tabController;
  FamilyDetailsModel? _family;
  DocumentDetailsModel? _doc;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _loadDossierData();
  }

  Future<void> _loadDossierData() async {
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
            // Modal Header
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

            // Tabs
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

            // Tab Views
            Expanded(
              child: _loading
                  ? const SpinnerWidget(message: 'Loading dossier records...')
                  : TabBarView(
                      controller: _tabController,
                      children: [
                        // Tab 1: Personal Details
                        Padding(
                          padding: const EdgeInsets.all(20),
                          child: ListView(
                            children: [
                              _dossierItem('Full Name', widget.form.name),
                              _dossierItem('Register Number', widget.form.registerNo),
                              _dossierItem('Email Address', widget.form.email),
                              _dossierItem('Department', widget.form.dept),
                              _dossierItem('Batch', widget.form.batch),
                              _dossierItem('Gender', widget.form.gender),
                              _dossierItem('Date of Birth', widget.form.dob),
                              _dossierItem('Phone Number', widget.form.phone),
                              _dossierItem('Sports Specialty', widget.form.sportsSpecialty),
                              _dossierItem('Permanent Address', widget.form.address),
                            ],
                          ),
                        ),

                        // Tab 2: Family Details
                        Padding(
                          padding: const EdgeInsets.all(20),
                          child: _family == null || _family?.familyId == null
                              ? const Center(child: Text('No family details recorded yet.', style: TextStyle(color: AppColors.textMuted)))
                              : ListView(
                                  children: [
                                    _dossierItem('Father Name', _family?.fatherName),
                                    _dossierItem('Father Occupation', _family?.fatherOccupation),
                                    _dossierItem('Mother Name', _family?.motherName),
                                    _dossierItem('Mother Occupation', _family?.motherOccupation),
                                    _dossierItem('Guardian Contact Phone', _family?.guardianPhone),
                                  ],
                                ),
                        ),

                        // Tab 3: Uploaded Documents
                        Padding(
                          padding: const EdgeInsets.all(20),
                          child: _doc == null || _doc?.documentId == null
                              ? const Center(child: Text('No documents uploaded yet.', style: TextStyle(color: AppColors.textMuted)))
                              : ListView(
                                  children: [
                                    _dossierItem('Aadhar Card Number', _doc?.aadharNo),
                                    _dossierItem('Medical Certificate URL / Reference', _doc?.medicalCertificateUrl),
                                    _dossierItem('Photo URL / File Name', _doc?.photoUrl),
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

  static Widget _dossierItem(String label, String? value) {
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
