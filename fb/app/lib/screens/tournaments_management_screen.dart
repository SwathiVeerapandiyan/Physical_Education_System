import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_styles.dart';
import '../models/tournament.dart';
import '../providers/api_service.dart';
import '../providers/auth_provider.dart';
import '../providers/toast_provider.dart';
import '../widgets/glass_card.dart';
import '../widgets/main_layout.dart';
import '../widgets/spinner_widget.dart';

class TournamentsManagementScreen extends StatefulWidget {
  const TournamentsManagementScreen({super.key});

  @override
  State<TournamentsManagementScreen> createState() => _TournamentsManagementScreenState();
}

class _TournamentsManagementScreenState extends State<TournamentsManagementScreen> {
  List<TournamentModel> _tournaments = [];
  bool _loading = true;
  String? _statusFilter;

  @override
  void initState() {
    super.initState();
    _loadTournaments();
  }

  Future<void> _loadTournaments() async {
    setState(() => _loading = true);
    try {
      final list = await ApiService.getAllTournaments(status: _statusFilter);
      if (mounted) setState(() => _tournaments = list);
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  void _showAddDialog() {
    final titleCtrl = TextEditingController();
    final venueCtrl = TextEditingController();
    final statusCtrl = TextEditingController(text: 'UPCOMING');
    final descCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Create Tournament', style: TextStyle(color: AppColors.textPrimary)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: titleCtrl,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(hintText: 'Tournament Title', labelText: 'Title'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: venueCtrl,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(hintText: 'Venue / Court Location', labelText: 'Venue'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: statusCtrl,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(hintText: 'UPCOMING, ONGOING, COMPLETED', labelText: 'Status'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: descCtrl,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(hintText: 'Description & Prize Info', labelText: 'Description'),
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
            child: const Text('Save'),
            onPressed: () async {
              if (titleCtrl.text.isEmpty) return;
              final toast = Provider.of<ToastProvider>(context, listen: false);
              try {
                await ApiService.createTournament(TournamentModel(
                  title: titleCtrl.text.trim(),
                  venue: venueCtrl.text.trim(),
                  status: statusCtrl.text.trim(),
                  description: descCtrl.text.trim(),
                ));
                toast.showToast('Tournament created successfully', 'success');
                Navigator.pop(ctx);
                _loadTournaments();
              } catch (_) {
                toast.showToast('Failed to create tournament', 'error');
              }
            },
          ),
        ],
      ),
    );
  }

  void _showEditDialog(TournamentModel tournament) {
    final titleCtrl = TextEditingController(text: tournament.title);
    final venueCtrl = TextEditingController(text: tournament.venue ?? '');
    final descCtrl = TextEditingController(text: tournament.description ?? '');
    String status = tournament.status ?? 'UPCOMING';

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          backgroundColor: AppColors.bgSecondary,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Text('Edit Tournament', style: TextStyle(color: AppColors.textPrimary)),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: titleCtrl,
                  style: const TextStyle(color: AppColors.textPrimary),
                  decoration: AppStyles.inputDecoration(hintText: 'Tournament Title', labelText: 'Title'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: venueCtrl,
                  style: const TextStyle(color: AppColors.textPrimary),
                  decoration: AppStyles.inputDecoration(hintText: 'Venue', labelText: 'Venue'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: descCtrl,
                  style: const TextStyle(color: AppColors.textPrimary),
                  decoration: AppStyles.inputDecoration(hintText: 'Description', labelText: 'Description'),
                ),
                const SizedBox(height: 12),
                DropdownButtonFormField<String>(
                  value: status,
                  dropdownColor: AppColors.bgSecondary,
                  style: const TextStyle(color: AppColors.textPrimary),
                  decoration: AppStyles.inputDecoration(labelText: 'Status'),
                  items: const [
                    DropdownMenuItem(value: 'UPCOMING', child: Text('UPCOMING')),
                    DropdownMenuItem(value: 'ONGOING', child: Text('ONGOING')),
                    DropdownMenuItem(value: 'COMPLETED', child: Text('COMPLETED')),
                  ],
                  onChanged: (val) {
                    if (val != null) setDialogState(() => status = val);
                  },
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
              child: const Text('Save Changes'),
              onPressed: () async {
                if (titleCtrl.text.isEmpty || tournament.tournamentId == null) return;
                final toast = Provider.of<ToastProvider>(context, listen: false);
                try {
                  await ApiService.updateTournament(
                    tournament.tournamentId!,
                    TournamentModel(
                      tournamentId: tournament.tournamentId,
                      title: titleCtrl.text.trim(),
                      venue: venueCtrl.text.trim(),
                      description: descCtrl.text.trim(),
                      status: status,
                      startDate: tournament.startDate,
                      endDate: tournament.endDate,
                    ),
                  );
                  toast.showToast('Tournament updated in database', 'success');
                  Navigator.pop(ctx);
                  _loadTournaments();
                } catch (e) {
                  toast.showToast('Failed to update tournament', 'error');
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  void _confirmDeleteTournament(TournamentModel t) {
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
          'Are you sure you want to delete tournament "${t.title}"?\n\nThis will safely cascade and delete related matches and tournament registrations to maintain database integrity.',
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
              if (t.tournamentId == null) return;
              final toast = Provider.of<ToastProvider>(context, listen: false);
              try {
                await ApiService.deleteTournament(t.tournamentId!);
                toast.showToast('Tournament deleted successfully', 'info');
                _loadTournaments();
              } catch (_) {
                toast.showToast('Failed to delete tournament', 'error');
              }
            },
            child: const Text('Delete Tournament'),
          ),
        ],
      ),
    );
  }

  Color _getStatusColor(String? status) {
    switch (status?.toUpperCase()) {
      case 'ONGOING':
        return AppColors.success;
      case 'UPCOMING':
        return AppColors.primary;
      case 'COMPLETED':
        return AppColors.textMuted;
      default:
        return AppColors.accent;
    }
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final isAdmin = authProvider.isAdmin;

    return MainLayout(
      currentRoute: '/tournaments',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Tournaments & Competitions',
                style: TextStyle(color: AppColors.textPrimary, fontSize: 24, fontWeight: FontWeight.bold),
              ),
              if (isAdmin)
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
                  onPressed: _showAddDialog,
                  icon: const Icon(Icons.add, size: 18),
                  label: const Text('Create Tournament'),
                ),
            ],
          ),
          const SizedBox(height: 16),

          Row(
            children: [
              FilterChip(
                label: const Text('All'),
                selected: _statusFilter == null,
                onSelected: (_) {
                  setState(() => _statusFilter = null);
                  _loadTournaments();
                },
              ),
              const SizedBox(width: 8),
              FilterChip(
                label: const Text('Upcoming'),
                selected: _statusFilter == 'UPCOMING',
                onSelected: (_) {
                  setState(() => _statusFilter = 'UPCOMING');
                  _loadTournaments();
                },
              ),
              const SizedBox(width: 8),
              FilterChip(
                label: const Text('Ongoing'),
                selected: _statusFilter == 'ONGOING',
                onSelected: (_) {
                  setState(() => _statusFilter = 'ONGOING');
                  _loadTournaments();
                },
              ),
              const SizedBox(width: 8),
              FilterChip(
                label: const Text('Completed'),
                selected: _statusFilter == 'COMPLETED',
                onSelected: (_) {
                  setState(() => _statusFilter = 'COMPLETED');
                  _loadTournaments();
                },
              ),
            ],
          ),
          const SizedBox(height: 20),

          Expanded(
            child: _loading
                ? const SpinnerWidget(message: 'Loading tournament listings...')
                : _tournaments.isEmpty
                    ? const Center(child: Text('No tournaments found', style: TextStyle(color: AppColors.textMuted)))
                    : ListView.builder(
                        itemCount: _tournaments.length,
                        itemBuilder: (context, index) {
                          final t = _tournaments[index];
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: GlassCard(
                              padding: const EdgeInsets.all(20),
                              child: Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(12),
                                    decoration: BoxDecoration(color: AppColors.primaryGlow, borderRadius: BorderRadius.circular(10)),
                                    child: const Text('🏆', style: TextStyle(fontSize: 24)),
                                  ),
                                  const SizedBox(width: 16),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(t.title, style: const TextStyle(color: AppColors.textPrimary, fontSize: 18, fontWeight: FontWeight.bold)),
                                        const SizedBox(height: 4),
                                        Text('Venue: ${t.venue ?? 'Main Sports Complex'}', style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                                        if (t.description != null && t.description!.isNotEmpty)
                                          Text(t.description!, style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
                                      ],
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                    decoration: BoxDecoration(
                                      color: _getStatusColor(t.status).withOpacity(0.15),
                                      borderRadius: BorderRadius.circular(20),
                                      border: Border.all(color: _getStatusColor(t.status)),
                                    ),
                                    child: Text(
                                      t.status ?? 'UPCOMING',
                                      style: TextStyle(color: _getStatusColor(t.status), fontWeight: FontWeight.bold, fontSize: 12),
                                    ),
                                  ),
                                  if (isAdmin) ...[
                                    const SizedBox(width: 8),
                                    IconButton(
                                      icon: const Icon(Icons.edit_outlined, color: AppColors.primary, size: 18),
                                      tooltip: 'Edit Tournament',
                                      onPressed: () => _showEditDialog(t),
                                    ),
                                    IconButton(
                                      icon: const Icon(Icons.delete_outline, color: AppColors.error, size: 18),
                                      tooltip: 'Delete Tournament',
                                      onPressed: () => _confirmDeleteTournament(t),
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
