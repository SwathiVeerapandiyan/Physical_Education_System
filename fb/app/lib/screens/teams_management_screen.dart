import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_styles.dart';
import '../models/sport.dart';
import '../models/team.dart';
import '../models/team_member.dart';
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
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);
    try {
      final results = await Future.wait([
        ApiService.getAllTeams(),
        ApiService.getAllSports(),
      ]);
      if (mounted) {
        setState(() {
          _teams = results[0] as List<TeamModel>;
          _sports = results[1] as List<SportModel>;
        });
      }
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  void _showAddDialog() {
    final nameCtrl = TextEditingController();
    final captCtrl = TextEditingController();
    final deptCtrl = TextEditingController(text: 'Physical Education');
    int? selectedSportId = _sports.isNotEmpty ? _sports.first.sportId : null;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          backgroundColor: AppColors.cardSurface,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Text('Create Team / Squad', style: TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold)),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                TextField(
                  controller: nameCtrl,
                  style: const TextStyle(color: AppColors.textPrimary),
                  decoration: AppStyles.inputDecoration(hintText: 'Team Name (e.g. MCA Strikers)', labelText: 'Team Name'),
                ),
                const SizedBox(height: 14),
                if (_sports.isNotEmpty) ...[
                  DropdownButtonFormField<int>(
                    value: selectedSportId,
                    dropdownColor: AppColors.cardSurface,
                    style: const TextStyle(color: AppColors.textPrimary),
                    decoration: AppStyles.inputDecoration(labelText: 'Sport / Discipline'),
                    items: _sports.map((s) {
                      return DropdownMenuItem<int>(
                        value: s.sportId,
                        child: Text(s.sportName, style: const TextStyle(color: AppColors.textPrimary)),
                      );
                    }).toList(),
                    onChanged: (val) {
                      setDialogState(() => selectedSportId = val);
                    },
                  ),
                  const SizedBox(height: 14),
                ],
                TextField(
                  controller: captCtrl,
                  style: const TextStyle(color: AppColors.textPrimary),
                  decoration: AppStyles.inputDecoration(hintText: 'Captain Name', labelText: 'Captain'),
                ),
                const SizedBox(height: 14),
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
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              child: const Text('Create Team'),
              onPressed: () async {
                if (nameCtrl.text.trim().isEmpty) return;
                final toast = Provider.of<ToastProvider>(context, listen: false);
                try {
                  await ApiService.createTeam(TeamModel(
                    teamName: nameCtrl.text.trim(),
                    sportId: selectedSportId,
                    captainName: captCtrl.text.trim().isNotEmpty ? captCtrl.text.trim() : null,
                    department: deptCtrl.text.trim().isNotEmpty ? deptCtrl.text.trim() : null,
                  ));
                  toast.showToast('Team created successfully', 'success');
                  if (ctx.mounted) Navigator.pop(ctx);
                  _loadData();
                } catch (e) {
                  toast.showToast('Failed to create team: $e', 'error');
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showSquadRosterDialog(TeamModel team) {
    showDialog(
      context: context,
      builder: (ctx) => _SquadRosterDialog(team: team),
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
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Teams & Squads',
                    style: TextStyle(color: AppColors.textPrimary, fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Manage varsity squads, team captains, and player rosters',
                    style: TextStyle(color: AppColors.textMuted, fontSize: 13),
                  ),
                ],
              ),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
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
                    ? Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Text('🛡️', style: TextStyle(fontSize: 48)),
                            const SizedBox(height: 12),
                            const Text('No registered teams yet', style: TextStyle(color: AppColors.textMuted, fontSize: 16)),
                            const SizedBox(height: 12),
                            ElevatedButton(
                              style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
                              onPressed: _showAddDialog,
                              child: const Text('Create First Team'),
                            ),
                          ],
                        ),
                      )
                    : GridView.builder(
                        gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                          maxCrossAxisExtent: 340,
                          crossAxisSpacing: 16,
                          mainAxisSpacing: 16,
                          childAspectRatio: 1.15,
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
                                    Container(
                                      padding: const EdgeInsets.all(8),
                                      decoration: BoxDecoration(
                                        color: AppColors.primary.withAlpha(40),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: const Text('🛡️', style: TextStyle(fontSize: 22)),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            team.teamName,
                                            style: const TextStyle(color: AppColors.textPrimary, fontSize: 17, fontWeight: FontWeight.bold),
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                          Text(
                                            'Team ID: #${team.teamId ?? 'N/A'}',
                                            style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 14),
                                Row(
                                  children: [
                                    const Icon(Icons.person, size: 14, color: AppColors.accentGold),
                                    const SizedBox(width: 6),
                                    Expanded(
                                      child: Text(
                                        'Captain: ${team.captainName ?? 'TBD'}',
                                        style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 6),
                                Row(
                                  children: [
                                    const Icon(Icons.apartment, size: 14, color: AppColors.textMuted),
                                    const SizedBox(width: 6),
                                    Expanded(
                                      child: Text(
                                        'Dept: ${team.department ?? 'Physical Education'}',
                                        style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                  ],
                                ),
                                const Spacer(),
                                SizedBox(
                                  width: double.infinity,
                                  child: OutlinedButton.icon(
                                    style: OutlinedButton.styleFrom(
                                      foregroundColor: AppColors.primary,
                                      side: const BorderSide(color: AppColors.primary),
                                      padding: const EdgeInsets.symmetric(vertical: 10),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                    ),
                                    onPressed: () => _showSquadRosterDialog(team),
                                    icon: const Icon(Icons.group, size: 16),
                                    label: const Text('Manage Squad Roster'),
                                  ),
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

class _SquadRosterDialog extends StatefulWidget {
  final TeamModel team;

  const _SquadRosterDialog({required this.team});

  @override
  State<_SquadRosterDialog> createState() => _SquadRosterDialogState();
}

class _SquadRosterDialogState extends State<_SquadRosterDialog> {
  List<TeamMemberModel> _members = [];
  bool _loading = true;
  bool _adding = false;

  final _nameCtrl = TextEditingController();
  String _selectedRole = 'Striker / Forward';

  final List<String> _roles = [
    'Captain',
    'Vice Captain',
    'Striker / Forward',
    'Midfielder',
    'Defender',
    'Goalkeeper / Wicketkeeper',
    'All-Rounder',
    'Bowler',
    'Batsman',
    'Player / Member',
  ];

  @override
  void initState() {
    super.initState();
    _loadMembers();
  }

  Future<void> _loadMembers() async {
    if (widget.team.teamId == null) return;
    setState(() => _loading = true);
    try {
      final list = await ApiService.getTeamMembersByTeamId(widget.team.teamId!);
      if (mounted) setState(() => _members = list);
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _addMember() async {
    if (_nameCtrl.text.trim().isEmpty) return;
    final toast = Provider.of<ToastProvider>(context, listen: false);
    setState(() => _adding = true);
    try {
      await ApiService.createTeamMember(TeamMemberModel(
        teamId: widget.team.teamId,
        studentName: _nameCtrl.text.trim(),
        role: _selectedRole,
      ));
      _nameCtrl.clear();
      toast.showToast('Squad player added successfully', 'success');
      await _loadMembers();
    } catch (e) {
      toast.showToast('Failed to add player: $e', 'error');
    }
    if (mounted) setState(() => _adding = false);
  }

  Future<void> _deleteMember(int memberId) async {
    final toast = Provider.of<ToastProvider>(context, listen: false);
    try {
      await ApiService.deleteTeamMember(memberId);
      toast.showToast('Squad player removed', 'info');
      await _loadMembers();
    } catch (e) {
      toast.showToast('Failed to remove player: $e', 'error');
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      backgroundColor: AppColors.cardSurface,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      title: Row(
        children: [
          const Text('🛡️', style: TextStyle(fontSize: 22)),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              '${widget.team.teamName} - Squad Roster',
              style: const TextStyle(color: AppColors.textPrimary, fontSize: 18, fontWeight: FontWeight.bold),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
      content: SizedBox(
        width: 480,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Add Player Section
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.background.withAlpha(120),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.cardBorder),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Add Squad Player', style: TextStyle(color: AppColors.textPrimary, fontSize: 13, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Expanded(
                        flex: 3,
                        child: TextField(
                          controller: _nameCtrl,
                          style: const TextStyle(color: AppColors.textPrimary, fontSize: 13),
                          decoration: AppStyles.inputDecoration(hintText: 'Player Name', labelText: 'Player Name'),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        flex: 3,
                        child: DropdownButtonFormField<String>(
                          value: _selectedRole,
                          dropdownColor: AppColors.cardSurface,
                          style: const TextStyle(color: AppColors.textPrimary, fontSize: 12),
                          decoration: AppStyles.inputDecoration(labelText: 'Role'),
                          items: _roles.map((r) {
                            return DropdownMenuItem<String>(
                              value: r,
                              child: Text(r, style: const TextStyle(color: AppColors.textPrimary, fontSize: 12), overflow: TextOverflow.ellipsis),
                            );
                          }).toList(),
                          onChanged: (val) {
                            if (val != null) setState(() => _selectedRole = val);
                          },
                        ),
                      ),
                      const SizedBox(width: 8),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        onPressed: _adding ? null : _addMember,
                        child: _adding
                            ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                            : const Text('Add'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Members List
            const Text('Current Squad Players', style: TextStyle(color: AppColors.textSecondary, fontSize: 13, fontWeight: FontWeight.w600)),
            const SizedBox(height: 8),

            SizedBox(
              height: 220,
              child: _loading
                  ? const Center(child: CircularProgressIndicator())
                  : _members.isEmpty
                      ? const Center(
                          child: Text(
                            'No players added to this squad yet.\nEnter player name above to add.',
                            textAlign: TextAlign.center,
                            style: TextStyle(color: AppColors.textMuted, fontSize: 13),
                          ),
                        )
                      : ListView.separated(
                          itemCount: _members.length,
                          separatorBuilder: (context, index) => const Divider(color: AppColors.cardBorder, height: 8),
                          itemBuilder: (context, index) {
                            final m = _members[index];
                            final name = m.studentName ?? (m.studentId != null ? 'Student #${m.studentId}' : 'Player');
                            return ListTile(
                              dense: true,
                              contentPadding: const EdgeInsets.symmetric(horizontal: 4, vertical: 0),
                              leading: CircleAvatar(
                                radius: 16,
                                backgroundColor: AppColors.primary.withAlpha(40),
                                child: Text(
                                  name.isNotEmpty ? name[0].toUpperCase() : 'P',
                                  style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 12),
                                ),
                              ),
                              title: Text(name, style: const TextStyle(color: AppColors.textPrimary, fontSize: 14, fontWeight: FontWeight.w500)),
                              subtitle: Text(
                                '${m.role ?? 'Player'} • Joined ${m.joinedDate ?? 'Recently'}',
                                style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                              ),
                              trailing: IconButton(
                                icon: const Icon(Icons.remove_circle_outline, color: AppColors.error, size: 18),
                                tooltip: 'Remove from squad',
                                onPressed: m.id != null ? () => _deleteMember(m.id!) : null,
                              ),
                            );
                          },
                        ),
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          child: const Text('Close', style: TextStyle(color: AppColors.primary)),
          onPressed: () => Navigator.pop(context),
        ),
      ],
    );
  }
}
