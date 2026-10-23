import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_styles.dart';
import '../models/match_fixture.dart';
import '../models/team.dart';
import '../models/tournament.dart';
import '../providers/api_service.dart';
import '../providers/auth_provider.dart';
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
  List<TeamModel> _teams = [];
  List<TournamentModel> _tournaments = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);
    try {
      final results = await Future.wait([
        ApiService.getAllMatches(),
        ApiService.getAllTeams(),
        ApiService.getAllTournaments(),
      ]);
      if (mounted) {
        setState(() {
          _matches = results[0] as List<MatchFixtureModel>;
          _teams = results[1] as List<TeamModel>;
          _tournaments = results[2] as List<TournamentModel>;
        });
      }
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  void _showAddDialog() {
    final teamACtrl = TextEditingController();
    final teamBCtrl = TextEditingController();
    final venueCtrl = TextEditingController(text: 'Main University Stadium');
    
    DateTime selectedDateTime = DateTime.now().add(const Duration(hours: 3));
    final dateDisplayCtrl = TextEditingController(
      text: '${selectedDateTime.year}-${selectedDateTime.month.toString().padLeft(2, '0')}-${selectedDateTime.day.toString().padLeft(2, '0')} ${selectedDateTime.hour.toString().padLeft(2, '0')}:${selectedDateTime.minute.toString().padLeft(2, '0')}',
    );

    int? selectedTeamOne;
    int? selectedTeamTwo;
    int? selectedTournamentId = _tournaments.isNotEmpty ? _tournaments.first.tournamentId : null;
    String selectedStatus = 'SCHEDULED';

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          backgroundColor: AppColors.cardSurface,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Text('Schedule Match Fixture', style: TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold)),
          content: SizedBox(
            width: 440,
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (_teams.isNotEmpty) ...[
                    const Text('Select Registered Teams (or type below):', style: TextStyle(color: AppColors.textSecondary, fontSize: 12)),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          child: DropdownButtonFormField<int>(
                            value: selectedTeamOne,
                            isExpanded: true,
                            dropdownColor: AppColors.cardSurface,
                            style: const TextStyle(color: AppColors.textPrimary, fontSize: 13),
                            decoration: AppStyles.inputDecoration(labelText: 'Team A Roster'),
                            items: _teams.map((t) => DropdownMenuItem(value: t.teamId, child: Text(t.teamName, overflow: TextOverflow.ellipsis))).toList(),
                            onChanged: (val) {
                              setDialogState(() {
                                selectedTeamOne = val;
                                final t = _teams.firstWhere((e) => e.teamId == val);
                                teamACtrl.text = t.teamName;
                              });
                            },
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: DropdownButtonFormField<int>(
                            value: selectedTeamTwo,
                            isExpanded: true,
                            dropdownColor: AppColors.cardSurface,
                            style: const TextStyle(color: AppColors.textPrimary, fontSize: 13),
                            decoration: AppStyles.inputDecoration(labelText: 'Team B Roster'),
                            items: _teams.map((t) => DropdownMenuItem(value: t.teamId, child: Text(t.teamName, overflow: TextOverflow.ellipsis))).toList(),
                            onChanged: (val) {
                              setDialogState(() {
                                selectedTeamTwo = val;
                                final t = _teams.firstWhere((e) => e.teamId == val);
                                teamBCtrl.text = t.teamName;
                              });
                            },
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                  ],

                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: teamACtrl,
                          style: const TextStyle(color: AppColors.textPrimary),
                          decoration: AppStyles.inputDecoration(hintText: 'Team A (e.g. MCA Strikers)', labelText: 'Team A Name'),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: TextField(
                          controller: teamBCtrl,
                          style: const TextStyle(color: AppColors.textPrimary),
                          decoration: AppStyles.inputDecoration(hintText: 'Team B (e.g. MBA Lions)', labelText: 'Team B Name'),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Date & Time Picker field
                  TextField(
                    controller: dateDisplayCtrl,
                    readOnly: true,
                    style: const TextStyle(color: AppColors.textPrimary),
                    decoration: AppStyles.inputDecoration(
                      labelText: 'Match Date & Time',
                      suffixIcon: const Icon(Icons.calendar_today, color: AppColors.primary, size: 18),
                    ),
                    onTap: () async {
                      final pickedDate = await showDatePicker(
                        context: context,
                        initialDate: selectedDateTime,
                        firstDate: DateTime.now().subtract(const Duration(days: 30)),
                        lastDate: DateTime.now().add(const Duration(days: 365)),
                      );
                      if (pickedDate != null && ctx.mounted) {
                        final pickedTime = await showTimePicker(
                          context: ctx,
                          initialTime: TimeOfDay.fromDateTime(selectedDateTime),
                        );
                        if (pickedTime != null) {
                          setDialogState(() {
                            selectedDateTime = DateTime(
                              pickedDate.year,
                              pickedDate.month,
                              pickedDate.day,
                              pickedTime.hour,
                              pickedTime.minute,
                            );
                            dateDisplayCtrl.text =
                                '${selectedDateTime.year}-${selectedDateTime.month.toString().padLeft(2, '0')}-${selectedDateTime.day.toString().padLeft(2, '0')} ${selectedDateTime.hour.toString().padLeft(2, '0')}:${selectedDateTime.minute.toString().padLeft(2, '0')}';
                          });
                        }
                      }
                    },
                  ),
                  const SizedBox(height: 12),

                  TextField(
                    controller: venueCtrl,
                    style: const TextStyle(color: AppColors.textPrimary),
                    decoration: AppStyles.inputDecoration(hintText: 'Stadium / Court / Ground', labelText: 'Venue'),
                  ),
                  const SizedBox(height: 12),

                  Row(
                    children: [
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          value: selectedStatus,
                          dropdownColor: AppColors.cardSurface,
                          style: const TextStyle(color: AppColors.textPrimary),
                          decoration: AppStyles.inputDecoration(labelText: 'Status'),
                          items: const [
                            DropdownMenuItem(value: 'SCHEDULED', child: Text('SCHEDULED')),
                            DropdownMenuItem(value: 'LIVE', child: Text('LIVE')),
                            DropdownMenuItem(value: 'COMPLETED', child: Text('COMPLETED')),
                          ],
                          onChanged: (val) {
                            if (val != null) setDialogState(() => selectedStatus = val);
                          },
                        ),
                      ),
                      if (_tournaments.isNotEmpty) ...[
                        const SizedBox(width: 8),
                        Expanded(
                          child: DropdownButtonFormField<int>(
                            value: selectedTournamentId,
                            isExpanded: true,
                            dropdownColor: AppColors.cardSurface,
                            style: const TextStyle(color: AppColors.textPrimary),
                            decoration: AppStyles.inputDecoration(labelText: 'Tournament'),
                            items: _tournaments.map((t) => DropdownMenuItem(value: t.tournamentId, child: Text(t.title.isNotEmpty ? t.title : 'Tournament', overflow: TextOverflow.ellipsis))).toList(),
                            onChanged: (val) => setDialogState(() => selectedTournamentId = val),
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ),
          actions: [
            TextButton(
              child: const Text('Cancel', style: TextStyle(color: AppColors.textMuted)),
              onPressed: () => Navigator.pop(ctx),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              child: const Text('Schedule Fixture'),
              onPressed: () async {
                final teamA = teamACtrl.text.trim();
                final teamB = teamBCtrl.text.trim();
                if (teamA.isEmpty || teamB.isEmpty) return;

                final toast = Provider.of<ToastProvider>(context, listen: false);
                try {
                  // Format as ISO string for backend
                  final isoDate = '${selectedDateTime.year.toString().padLeft(4, '0')}-${selectedDateTime.month.toString().padLeft(2, '0')}-${selectedDateTime.day.toString().padLeft(2, '0')}T${selectedDateTime.hour.toString().padLeft(2, '0')}:${selectedDateTime.minute.toString().padLeft(2, '0')}:00';

                  await ApiService.createMatch(MatchFixtureModel(
                    teamA: teamA,
                    teamB: teamB,
                    teamOne: selectedTeamOne,
                    teamTwo: selectedTeamTwo,
                    tournamentId: selectedTournamentId,
                    matchDate: isoDate,
                    venue: venueCtrl.text.trim(),
                    status: selectedStatus,
                  ));
                  toast.showToast('Match fixture scheduled successfully', 'success');
                  if (ctx.mounted) Navigator.pop(ctx);
                  _loadData();
                } catch (e) {
                  toast.showToast('Failed to schedule match: $e', 'error');
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showEditDialog(MatchFixtureModel match) {
    final scoreCtrl = TextEditingController(text: match.score ?? '');
    final venueCtrl = TextEditingController(text: match.venue ?? '');
    String selectedStatus = match.status ?? 'SCHEDULED';

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          backgroundColor: AppColors.cardSurface,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Text('Edit Match: ${match.teamA} vs ${match.teamB}',
              style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 16)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              TextField(
                controller: scoreCtrl,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(hintText: 'e.g. 2 - 1 or 78 - 65', labelText: 'Score / Result'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: venueCtrl,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(hintText: 'Stadium / Field name', labelText: 'Venue'),
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: selectedStatus,
                dropdownColor: AppColors.cardSurface,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(labelText: 'Match Status'),
                items: const [
                  DropdownMenuItem(value: 'SCHEDULED', child: Text('SCHEDULED')),
                  DropdownMenuItem(value: 'LIVE', child: Text('LIVE')),
                  DropdownMenuItem(value: 'COMPLETED', child: Text('COMPLETED')),
                  DropdownMenuItem(value: 'POSTPONED', child: Text('POSTPONED')),
                ],
                onChanged: (val) {
                  if (val != null) setDialogState(() => selectedStatus = val);
                },
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancel', style: TextStyle(color: AppColors.textMuted)),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
              onPressed: () async {
                if (match.matchId == null) return;
                final toast = Provider.of<ToastProvider>(context, listen: false);
                try {
                  await ApiService.updateMatch(
                    match.matchId!,
                    MatchFixtureModel(
                      matchId: match.matchId,
                      teamA: match.teamA,
                      teamB: match.teamB,
                      teamOne: match.teamOne,
                      teamTwo: match.teamTwo,
                      tournamentId: match.tournamentId,
                      matchDate: match.matchDate,
                      venue: venueCtrl.text.trim(),
                      status: selectedStatus,
                      score: scoreCtrl.text.trim(),
                    ),
                  );
                  toast.showToast('Match fixture updated in database', 'success');
                  Navigator.pop(ctx);
                  _loadData();
                } catch (e) {
                  toast.showToast('Failed to update match', 'error');
                }
              },
              child: const Text('Save Changes'),
            ),
          ],
        ),
      ),
    );
  }

  void _confirmDeleteMatch(MatchFixtureModel match) {
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
          'Are you sure you want to delete match fixture "${match.teamA} vs ${match.teamB}"?\n\nThis will remove the fixture and its scoring record permanently.',
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
              if (match.matchId == null) return;
              final toast = Provider.of<ToastProvider>(context, listen: false);
              try {
                await ApiService.deleteMatch(match.matchId!);
                toast.showToast('Match fixture deleted successfully', 'info');
                _loadData();
              } catch (_) {
                toast.showToast('Failed to delete match fixture', 'error');
              }
            },
            child: const Text('Delete Fixture'),
          ),
        ],
      ),
    );
  }

  Color _getStatusColor(String? status) {
    switch (status?.toUpperCase()) {
      case 'LIVE':
        return Colors.redAccent;
      case 'COMPLETED':
        return Colors.green;
      case 'SCHEDULED':
      default:
        return AppColors.accentGold;
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final isAdmin = authProvider.isAdmin;

    return MainLayout(
      currentRoute: '/matches',
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
                    'Match Fixtures & Schedule',
                    style: TextStyle(color: AppColors.textPrimary, fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Schedule match encounters, update live scores and manage tournament fixtures',
                    style: TextStyle(color: AppColors.textMuted, fontSize: 13),
                  ),
                ],
              ),
              if (isAdmin)
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
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
                    ? Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Text('⚽', style: TextStyle(fontSize: 48)),
                            const SizedBox(height: 12),
                            const Text('No match fixtures scheduled yet', style: TextStyle(color: AppColors.textMuted, fontSize: 16)),
                            if (isAdmin) ...[
                              const SizedBox(height: 12),
                              ElevatedButton(
                                style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
                                onPressed: _showAddDialog,
                                child: const Text('Schedule First Match'),
                              ),
                            ],
                          ],
                        ),
                      )
                    : ListView.builder(
                        itemCount: _matches.length,
                        itemBuilder: (context, index) {
                          final m = _matches[index];
                          final statusColor = _getStatusColor(m.status);
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 14),
                            child: GlassCard(
                              padding: const EdgeInsets.all(20),
                              child: Row(
                                children: [
                                  Expanded(
                                    flex: 3,
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.end,
                                      children: [
                                        Text(
                                          m.teamA ?? 'Team A',
                                          style: const TextStyle(color: AppColors.textPrimary, fontSize: 16, fontWeight: FontWeight.bold),
                                          textAlign: TextAlign.end,
                                        ),
                                        if (m.teamOne != null)
                                          Text('Roster #${m.teamOne}', style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
                                      ],
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                    margin: const EdgeInsets.symmetric(horizontal: 16),
                                    decoration: BoxDecoration(
                                      color: AppColors.bgTertiary,
                                      borderRadius: BorderRadius.circular(8),
                                      border: Border.all(color: AppColors.cardBorder),
                                    ),
                                    child: Text(
                                      m.score != null && m.score!.isNotEmpty ? m.score! : 'VS',
                                      style: const TextStyle(color: AppColors.accent, fontWeight: FontWeight.w800, fontSize: 15),
                                    ),
                                  ),
                                  Expanded(
                                    flex: 3,
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          m.teamB ?? 'Team B',
                                          style: const TextStyle(color: AppColors.textPrimary, fontSize: 16, fontWeight: FontWeight.bold),
                                        ),
                                        if (m.teamTwo != null)
                                          Text('Roster #${m.teamTwo}', style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
                                      ],
                                    ),
                                  ),
                                  const SizedBox(width: 16),
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.end,
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                        decoration: BoxDecoration(
                                          color: statusColor.withAlpha(40),
                                          borderRadius: BorderRadius.circular(6),
                                          border: Border.all(color: statusColor.withAlpha(120)),
                                        ),
                                        child: Text(
                                          m.status ?? 'SCHEDULED',
                                          style: TextStyle(color: statusColor, fontSize: 11, fontWeight: FontWeight.bold),
                                        ),
                                      ),
                                      const SizedBox(height: 6),
                                      Text(
                                        m.matchDate != null ? m.matchDate!.replaceAll('T', ' ') : 'TBD',
                                        style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                                      ),
                                      Text(
                                        m.venue ?? 'Main Court',
                                        style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                                      ),
                                    ],
                                  ),
                                  if (isAdmin) ...[
                                    const SizedBox(width: 12),
                                    IconButton(
                                      icon: const Icon(Icons.edit_outlined, color: AppColors.primary, size: 20),
                                      tooltip: 'Edit Match Fixture',
                                      onPressed: () => _showEditDialog(m),
                                    ),
                                    IconButton(
                                      icon: const Icon(Icons.delete_outline, color: AppColors.error, size: 20),
                                      tooltip: 'Delete Match Fixture',
                                      onPressed: () => _confirmDeleteMatch(m),
                                    ),
                                  ],
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
