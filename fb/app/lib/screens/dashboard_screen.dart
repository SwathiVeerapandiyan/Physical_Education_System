import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/theme/app_colors.dart';
import '../models/dashboard_stats.dart';
import '../providers/auth_provider.dart';
import '../providers/api_service.dart';
import '../providers/toast_provider.dart';
import '../widgets/glass_card.dart';
import '../widgets/main_layout.dart';
import '../widgets/spinner_widget.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  DashboardStats _stats = DashboardStats();
  bool _loading = true;

  bool _profileCreated = false;
  bool _familyAdded = false;
  bool _documentsUploaded = false;

  @override
  void initState() {
    super.initState();
    _fetchDashboardData();
  }

  Future<void> _fetchDashboardData() async {
    setState(() => _loading = true);

    try {
      final stats = await ApiService.getDashboardStats();
      if (mounted) setState(() => _stats = stats);
    } catch (_) {}

    try {
      final user = Provider.of<AuthProvider>(context, listen: false).user;
      if (user?.email != null) {
        final forms = await ApiService.getAllUserForms();
        final myForm = forms.firstWhere(
          (f) => f.email?.toLowerCase() == user!.email?.toLowerCase(),
          orElse: () => throw Exception('Not found'),
        );

        _profileCreated = true;

        if (myForm.id != null) {
          final family = await ApiService.getFamilyByCandidateId(myForm.id!);
          if (family?.familyId != null) _familyAdded = true;

          final doc = await ApiService.getDocumentByCandidateId(myForm.id!);
          if (doc?.documentId != null) _documentsUploaded = true;
        }
      }
    } catch (_) {}

    if (mounted) setState(() => _loading = false);
  }

  int get _completionPercent {
    int count = 0;
    if (_profileCreated) count += 34;
    if (_familyAdded) count += 33;
    if (_documentsUploaded) count += 33;
    return count;
  }

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<AuthProvider>(context).user;

    if (_loading) {
      return const MainLayout(
        currentRoute: '/dashboard',
        child: SpinnerWidget(message: 'Loading dashboard statistics...'),
      );
    }

    return MainLayout(
      currentRoute: '/dashboard',
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Welcome Banner
            GlassCard(
              padding: const EdgeInsets.all(28),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Welcome Back, ${user?.name ?? 'Candidate'}!',
                          style: const TextStyle(
                            color: AppColors.textPrimary,
                            fontSize: 26,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Department of Physical Education & Sports Portal',
                          style: TextStyle(color: AppColors.textSecondary, fontSize: 14),
                        ),
                        const SizedBox(height: 16),
                        Wrap(
                          spacing: 12,
                          runSpacing: 8,
                          children: [
                            _InfoBadge(label: 'Reg No', value: user?.registerNo ?? 'N/A'),
                            _InfoBadge(label: 'Department', value: user?.dept ?? 'N/A'),
                            _InfoBadge(label: 'Email', value: user?.email ?? 'N/A'),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const Text('🏆', style: TextStyle(fontSize: 48)),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // KPI Grid
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
                    _KpiCard(title: 'Total Users', value: _stats.totalUsers, trend: 'System accounts', color: AppColors.success),
                    _KpiCard(title: 'Registered Candidates', value: _stats.totalCandidates, trend: 'Completed profile forms', color: AppColors.secondary),
                    _KpiCard(title: 'Male Students', value: _stats.totalMaleStudents, trend: 'Athletes', color: AppColors.primary),
                    _KpiCard(title: 'Female Students', value: _stats.totalFemaleStudents, trend: 'Athletes', color: Colors.pinkAccent),
                  ],
                );
              },
            ),
            const SizedBox(height: 24),

            // Main Dashboard Grid
            Wrap(
              spacing: 24,
              runSpacing: 24,
              children: [
                // Completion Tracker
                SizedBox(
                  width: 480,
                  child: GlassCard(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Profile Completion Status',
                          style: TextStyle(color: AppColors.textPrimary, fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 20),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text('Overall Progress', style: TextStyle(color: AppColors.textSecondary, fontSize: 14)),
                            Text('$_completionPercent%', style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 16)),
                          ],
                        ),
                        const SizedBox(height: 8),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: LinearProgressIndicator(
                            value: _completionPercent / 100,
                            minHeight: 10,
                            backgroundColor: AppColors.bgTertiary,
                            valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
                          ),
                        ),
                        const SizedBox(height: 24),

                        // Checklist items
                        _ChecklistItem(
                          completed: _profileCreated,
                          title: 'Complete Student Profile Form',
                          subtitle: 'Batch, address, and athletic specialty details',
                          actionText: _profileCreated ? 'View' : 'Fill',
                          onTap: () => Navigator.pushReplacementNamed(context, '/profile'),
                        ),
                        const SizedBox(height: 12),
                        _ChecklistItem(
                          completed: _familyAdded,
                          title: 'Associate Family Details',
                          subtitle: 'Emergency contacts and guardian info',
                          actionText: _profileCreated ? (_familyAdded ? 'View' : 'Add') : 'Locked',
                          onTap: () {
                            if (!_profileCreated) {
                              Provider.of<ToastProvider>(context, listen: false).showToast('Please complete Profile Form first', 'warning');
                              Navigator.pushReplacementNamed(context, '/profile');
                            } else {
                              Navigator.pushReplacementNamed(context, '/family');
                            }
                          },
                        ),
                        const SizedBox(height: 12),
                        _ChecklistItem(
                          completed: _documentsUploaded,
                          title: 'Upload Required Certificates',
                          subtitle: 'Aadhar card, medical fitness certificates, etc.',
                          actionText: _profileCreated ? (_documentsUploaded ? 'View' : 'Upload') : 'Locked',
                          onTap: () {
                            if (!_profileCreated) {
                              Provider.of<ToastProvider>(context, listen: false).showToast('Please complete Profile Form first', 'warning');
                              Navigator.pushReplacementNamed(context, '/profile');
                            } else {
                              Navigator.pushReplacementNamed(context, '/documents');
                            }
                          },
                        ),
                      ],
                    ),
                  ),
                ),

                // Quick Actions & Activity
                SizedBox(
                  width: 440,
                  child: Column(
                    children: [
                      GlassCard(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Quick Actions',
                              style: TextStyle(color: AppColors.textPrimary, fontSize: 18, fontWeight: FontWeight.bold),
                            ),
                            const SizedBox(height: 16),
                            GridView.count(
                              crossAxisCount: 2,
                              crossAxisSpacing: 12,
                              mainAxisSpacing: 12,
                              shrinkWrap: true,
                              physics: const NeverScrollableScrollPhysics(),
                              childAspectRatio: 2.2,
                              children: [
                                _ActionTile(icon: '📝', title: 'Edit Profile', onTap: () => Navigator.pushReplacementNamed(context, '/profile')),
                                _ActionTile(icon: '👨‍👩‍👧‍👦', title: 'Family Info', onTap: () => Navigator.pushReplacementNamed(context, '/family')),
                                _ActionTile(icon: '📂', title: 'Upload Docs', onTap: () => Navigator.pushReplacementNamed(context, '/documents')),
                                _ActionTile(icon: '👥', title: 'View Users', onTap: () => Navigator.pushReplacementNamed(context, '/users')),
                              ],
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),

                      GlassCard(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: const [
                            Text(
                              'Recent Activity',
                              style: TextStyle(color: AppColors.textPrimary, fontSize: 18, fontWeight: FontWeight.bold),
                            ),
                            SizedBox(height: 16),
                            _ActivityItem(text: 'Log in successful', time: 'Just now'),
                            SizedBox(height: 12),
                            _ActivityItem(text: 'Database sync complete', time: '5 mins ago'),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoBadge extends StatelessWidget {
  final String label;
  final String value;

  const _InfoBadge({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.bgTertiary,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.borderColor),
      ),
      child: Text.rich(
        TextSpan(
          children: [
            TextSpan(text: '$label: ', style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
            TextSpan(text: value, style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 12)),
          ],
        ),
      ),
    );
  }
}

class _KpiCard extends StatelessWidget {
  final String title;
  final int value;
  final String trend;
  final Color color;

  const _KpiCard({required this.title, required this.value, required this.trend, required this.color});

  @override
  Widget build(BuildContext context) {
    return GlassCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(title, style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
          const SizedBox(height: 6),
          Text(
            '$value',
            style: const TextStyle(color: AppColors.textPrimary, fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 4),
          Text(trend, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}

class _ChecklistItem extends StatelessWidget {
  final bool completed;
  final String title;
  final String subtitle;
  final String actionText;
  final VoidCallback onTap;

  const _ChecklistItem({
    required this.completed,
    required this.title,
    required this.subtitle,
    required this.actionText,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: AppColors.bgSecondary,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: completed ? AppColors.success : AppColors.borderColor),
        ),
        child: Row(
          children: [
            Icon(
              completed ? Icons.check_circle : Icons.radio_button_unchecked,
              color: completed ? AppColors.success : AppColors.textMuted,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.w600, fontSize: 14)),
                  Text(subtitle, style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: completed ? AppColors.primaryGlow : AppColors.bgTertiary,
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                actionText,
                style: TextStyle(
                  color: completed ? AppColors.primary : AppColors.textSecondary,
                  fontWeight: FontWeight.bold,
                  fontSize: 12,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ActionTile extends StatelessWidget {
  final String icon;
  final String title;
  final VoidCallback onTap;

  const _ActionTile({required this.icon, required this.title, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      style: ElevatedButton.styleFrom(
        backgroundColor: AppColors.bgTertiary,
        foregroundColor: AppColors.textPrimary,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        padding: const EdgeInsets.symmetric(horizontal: 12),
      ),
      onPressed: onTap,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(icon, style: const TextStyle(fontSize: 16)),
          const SizedBox(width: 8),
          Flexible(
            child: Text(
              title,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }
}

class _ActivityItem extends StatelessWidget {
  final String text;
  final String time;

  const _ActivityItem({required this.text, required this.time});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const CircleAvatar(radius: 4, backgroundColor: AppColors.primary),
        const SizedBox(width: 10),
        Expanded(child: Text(text, style: const TextStyle(color: AppColors.textPrimary, fontSize: 13))),
        Text(time, style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
      ],
    );
  }
}
