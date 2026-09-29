import 'package:flutter/material.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_styles.dart';
import '../models/user.dart';
import '../providers/api_service.dart';
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
      final users = await ApiService.getAllUsers();
      if (mounted) setState(() => _users = users);
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
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
              const Text(
                'User Directory',
                style: TextStyle(color: AppColors.textPrimary, fontSize: 24, fontWeight: FontWeight.bold),
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
                ? const SpinnerWidget(message: 'Loading user accounts...')
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
                                  DataColumn(label: Text('Name', style: TextStyle(color: AppColors.textSecondary))),
                                  DataColumn(label: Text('Username', style: TextStyle(color: AppColors.textSecondary))),
                                  DataColumn(label: Text('Reg No', style: TextStyle(color: AppColors.textSecondary))),
                                  DataColumn(label: Text('Email', style: TextStyle(color: AppColors.textSecondary))),
                                  DataColumn(label: Text('Department', style: TextStyle(color: AppColors.textSecondary))),
                                  DataColumn(label: Text('Role', style: TextStyle(color: AppColors.textSecondary))),
                                ],
                                rows: filtered.map((u) {
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
                                          color: AppColors.primaryGlow,
                                          borderRadius: BorderRadius.circular(6),
                                        ),
                                        child: Text(
                                          u.role ?? 'STUDENT',
                                          style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 11),
                                        ),
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
