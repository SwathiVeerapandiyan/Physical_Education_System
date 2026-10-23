import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_styles.dart';
import '../models/sport.dart';
import '../models/team.dart';
import '../providers/api_service.dart';
import '../providers/toast_provider.dart';
import '../widgets/glass_card.dart';
import '../widgets/main_layout.dart';
import '../widgets/spinner_widget.dart';

class TeamsManagementScreen extends StatefulWidget {
  const TeamsManagementScreen({super.key});

  @override
  State<TeamsManagementScreen> createState() => _TeamsManagementScreenState();
}

class _TeamsManagementScreenState extends State<TeamsManagementScreen> {
  List<TeamModel> _teams = [];
  List<SportModel> _sports = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadTeams();
  }

  Future<void> _loadTeams() async {
    setState(() => _loading = true);
    try {
      final list = await ApiService.getAllTeams();
      if (mounted) setState(() => _teams = list);
    } catch (_) {}
    try {
      final sports = await ApiService.getAllSports();
      if (mounted) setState(() => _sports = sports);
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  void _showAddDialog() {
    final nameCtrl = TextEditingController();
    final captCtrl = TextEditingController();
    final deptCtrl = TextEditingController();
    int? selectedSportId = _sports.isNotEmpty ? _sports.first.sportId : 1;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (dialogCtx, setDialogState) => AlertDialog(
          title: const Text('Create Team / Squad', style: TextStyle(color: AppColors.textPrimary)),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: nameCtrl,
                  style: const TextStyle(color: AppColors.textPrimary),
                  decoration: AppStyles.inputDecoration(hintText: 'Team Name (e.g. MCA Strikers)', labelText: 'Team Name'),
                ),
                const SizedBox(height: 12),
                if (_sports.isNotEmpty) ...[
                  DropdownButtonFormField<int>(
                    initialValue: selectedSportId,
                    dropdownColor: AppColors.bgSecondary,
                    style: const TextStyle(color: AppColors.textPrimary),
                    decoration: AppStyles.inputDecoration(hintText: 'Select Sport', labelText: 'Sport'),
                    items: _sports.map((s) => DropdownMenuItem(
                      value: s.sportId,
                      child: Text(s.sportName),
                    )).toList(),
                    onChanged: (val) {
                      setDialogState(() => selectedSportId = val);
                    },
                  ),
                  const SizedBox(height: 12),
                ],
                TextField(
                  controller: captCtrl,
                  style: const TextStyle(color: AppColors.textPrimary),
                  decoration: AppStyles.inputDecoration(hintText: 'Captain Name', labelText: 'Captain'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: deptCtrl,
                  style: const TextStyle(color: AppColors.textPrimary),
                  decoration: AppStyles.inputDecoration(hintText: 'Department / Division', labelText: 'Department'),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              child: const Text('Cancel', style: TextStyle(color: AppColors.textMuted)),
              onPressed: () => Navigator.pop(ctx),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
              child: const Text('Create'),
              onPressed: () async {
                if (nameCtrl.text.isEmpty) return;
                final toast = Provider.of<ToastProvider>(context, listen: false);
                try {
                  await ApiService.createTeam(TeamModel(
                    teamName: nameCtrl.text.trim(),
                    sportId: selectedSportId ?? 1,
                    captainName: captCtrl.text.trim(),
                    department: deptCtrl.text.trim(),
                  ));
                  toast.showToast('Team created successfully', 'success');
                  if (ctx.mounted) Navigator.pop(ctx);
                  _loadTeams();
                } catch (_) {
                  toast.showToast('Failed to create team', 'error');
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return MainLayout(
      currentRoute: '/teams',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Teams & Squads',
                style: TextStyle(color: AppColors.textPrimary, fontSize: 24, fontWeight: FontWeight.bold),
              ),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
                onPressed: _showAddDialog,
                icon: const Icon(Icons.add, size: 18),
                label: const Text('Create Team'),
              ),
            ],
          ),
          const SizedBox(height: 20),

          Expanded(
            child: _loading
                ? const SpinnerWidget(message: 'Loading team rosters...')
                : _teams.isEmpty
                    ? const Center(child: Text('No registered teams yet', style: TextStyle(color: AppColors.textMuted)))
                    : GridView.builder(
                        gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                          maxCrossAxisExtent: 320,
                          crossAxisSpacing: 16,
                          mainAxisSpacing: 16,
                          childAspectRatio: 1.2,
                        ),
                        itemCount: _teams.length,
                        itemBuilder: (context, index) {
                          final team = _teams[index];
                          return GlassCard(
                            padding: const EdgeInsets.all(20),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    const Text('🛡️', style: TextStyle(fontSize: 24)),
                                    const SizedBox(width: 10),
                                    Expanded(
                                      child: Text(
                                        team.teamName,
                                        style: const TextStyle(color: AppColors.textPrimary, fontSize: 18, fontWeight: FontWeight.bold),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                Text('Captain: ${team.captainName ?? 'TBD'}', style: const TextStyle(color: AppColors.textSecondary, fontSize: 14)),
                                const SizedBox(height: 4),
                                Text('Department: ${team.department ?? 'Physical Education'}', style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
                                const Spacer(),
                                OutlinedButton(
                                  style: OutlinedButton.styleFrom(
                                    foregroundColor: AppColors.primary,
                                    side: const BorderSide(color: AppColors.primary),
                                  ),
                                  onPressed: () {
                                    Provider.of<ToastProvider>(context, listen: false).showToast('Roster view active for ${team.teamName}', 'info');
                                  },
                                  child: const Text('View Player Roster'),
                                ),
                              ],
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
