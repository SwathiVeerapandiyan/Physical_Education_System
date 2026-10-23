import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_styles.dart';
import '../models/match_fixture.dart';
import '../providers/api_service.dart';
import '../providers/toast_provider.dart';
import '../widgets/glass_card.dart';
import '../widgets/main_layout.dart';
import '../widgets/spinner_widget.dart';

class MatchesManagementScreen extends StatefulWidget {
  const MatchesManagementScreen({super.key});

  @override
  State<MatchesManagementScreen> createState() => _MatchesManagementScreenState();
}

class _MatchesManagementScreenState extends State<MatchesManagementScreen> {
  List<MatchFixtureModel> _matches = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadMatches();
  }

  Future<void> _loadMatches() async {
    setState(() => _loading = true);
    try {
      final list = await ApiService.getAllMatches();
      if (mounted) setState(() => _matches = list);
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  void _showAddDialog() {
    final teamACtrl = TextEditingController();
    final teamBCtrl = TextEditingController();
    DateTime scheduledTime = DateTime.now().add(const Duration(hours: 4));
    final dateCtrl = TextEditingController(
      text: '${scheduledTime.year}-${scheduledTime.month.toString().padLeft(2, '0')}-${scheduledTime.day.toString().padLeft(2, '0')} ${scheduledTime.hour.toString().padLeft(2, '0')}:${scheduledTime.minute.toString().padLeft(2, '0')}',
    );
    final venueCtrl = TextEditingController(text: 'Main Field');

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (dialogCtx, setDialogState) => AlertDialog(
          title: const Text('Schedule Match Fixture', style: TextStyle(color: AppColors.textPrimary)),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: teamACtrl,
                  style: const TextStyle(color: AppColors.textPrimary),
                  decoration: AppStyles.inputDecoration(hintText: 'Team A Name', labelText: 'Team A'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: teamBCtrl,
                  style: const TextStyle(color: AppColors.textPrimary),
                  decoration: AppStyles.inputDecoration(hintText: 'Team B Name', labelText: 'Team B'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: dateCtrl,
                  readOnly: true,
                  onTap: () async {
                    final d = await showDatePicker(
                      context: dialogCtx,
                      initialDate: scheduledTime,
                      firstDate: DateTime.now(),
                      lastDate: DateTime.now().add(const Duration(days: 365)),
                    );
                    if (d != null && dialogCtx.mounted) {
                      final t = await showTimePicker(
                        context: dialogCtx,
                        initialTime: TimeOfDay.fromDateTime(scheduledTime),
                      );
                      if (t != null) {
                        scheduledTime = DateTime(d.year, d.month, d.day, t.hour, t.minute);
                        setDialogState(() {
                          dateCtrl.text = '${scheduledTime.year}-${scheduledTime.month.toString().padLeft(2, '0')}-${scheduledTime.day.toString().padLeft(2, '0')} ${scheduledTime.hour.toString().padLeft(2, '0')}:${scheduledTime.minute.toString().padLeft(2, '0')}';
                        });
                      }
                    }
                  },
                  style: const TextStyle(color: AppColors.textPrimary),
                  decoration: AppStyles.inputDecoration(
                    hintText: 'Select Match Date & Time',
                    labelText: 'Match Date',
                    prefixIcon: const Icon(Icons.calendar_month, color: AppColors.textMuted),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: venueCtrl,
                  style: const TextStyle(color: AppColors.textPrimary),
                  decoration: AppStyles.inputDecoration(hintText: 'Stadium / Field Location', labelText: 'Venue'),
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
              child: const Text('Schedule'),
              onPressed: () async {
                if (teamACtrl.text.isEmpty || teamBCtrl.text.isEmpty) return;
                final toast = Provider.of<ToastProvider>(context, listen: false);
                try {
                  await ApiService.createMatch(MatchFixtureModel(
                    teamA: teamACtrl.text.trim(),
                    teamB: teamBCtrl.text.trim(),
                    matchDate: scheduledTime.toIso8601String(),
                    venue: venueCtrl.text.trim(),
                    status: 'SCHEDULED',
                  ));
                  toast.showToast('Match scheduled successfully', 'success');
                  if (ctx.mounted) Navigator.pop(ctx);
                  _loadMatches();
                } catch (_) {
                  toast.showToast('Failed to schedule match', 'error');
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
      currentRoute: '/matches',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Match Fixtures & Schedule',
                style: TextStyle(color: AppColors.textPrimary, fontSize: 24, fontWeight: FontWeight.bold),
              ),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
                onPressed: _showAddDialog,
                icon: const Icon(Icons.add, size: 18),
                label: const Text('Schedule Match'),
              ),
            ],
          ),
          const SizedBox(height: 20),

          Expanded(
            child: _loading
                ? const SpinnerWidget(message: 'Loading match schedule...')
                : _matches.isEmpty
                    ? const Center(child: Text('No match fixtures scheduled', style: TextStyle(color: AppColors.textMuted)))
                    : ListView.builder(
                        itemCount: _matches.length,
                        itemBuilder: (context, index) {
                          final m = _matches[index];
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: GlassCard(
                              padding: const EdgeInsets.all(20),
                              child: Row(
                                children: [
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.end,
                                      children: [
                                        Text(m.teamA ?? 'Team A', style: const TextStyle(color: AppColors.textPrimary, fontSize: 16, fontWeight: FontWeight.bold)),
                                      ],
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                    margin: const EdgeInsets.symmetric(horizontal: 20),
                                    decoration: BoxDecoration(color: AppColors.bgTertiary, borderRadius: BorderRadius.circular(8)),
                                    child: Text(
                                      m.score != null && m.score!.isNotEmpty ? m.score! : 'VS',
                                      style: const TextStyle(color: AppColors.accent, fontWeight: FontWeight.w800, fontSize: 16),
                                    ),
                                  ),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(m.teamB ?? 'Team B', style: const TextStyle(color: AppColors.textPrimary, fontSize: 16, fontWeight: FontWeight.bold)),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(width: 20),
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.end,
                                    children: [
                                      Text(
                                        m.matchDate != null && m.matchDate!.contains('T')
                                            ? m.matchDate!.replaceAll('T', ' ').substring(0, m.matchDate!.length > 16 ? 16 : m.matchDate!.length)
                                            : (m.matchDate ?? 'TBD'),
                                        style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                                      ),
                                      Text(m.venue ?? 'Main Court', style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
                                    ],
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
