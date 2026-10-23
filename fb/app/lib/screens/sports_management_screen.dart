import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_styles.dart';
import '../models/sport.dart';
import '../providers/api_service.dart';
import '../providers/auth_provider.dart';
import '../providers/toast_provider.dart';
import '../widgets/glass_card.dart';
import '../widgets/main_layout.dart';
import '../widgets/spinner_widget.dart';

class SportsManagementScreen extends StatefulWidget {
  const SportsManagementScreen({super.key});

  @override
  State<SportsManagementScreen> createState() => _SportsManagementScreenState();
}

class _SportsManagementScreenState extends State<SportsManagementScreen> {
  List<SportModel> _sports = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadSports();
  }

  Future<void> _loadSports() async {
    setState(() => _loading = true);
    try {
      final sports = await ApiService.getAllSports();
      if (mounted) setState(() => _sports = sports);
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  void _showAddSportDialog() {
    final nameCtrl = TextEditingController();
    final catCtrl = TextEditingController(text: 'Outdoor');
    final minCtrl = TextEditingController(text: '5');
    final maxCtrl = TextEditingController(text: '11');
    final descCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Add New Sport Catalog', style: TextStyle(color: AppColors.textPrimary)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameCtrl,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(hintText: 'Sport Name (e.g. Football)', labelText: 'Sport Name'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: catCtrl,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(hintText: 'Category (Indoor/Outdoor)', labelText: 'Category'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: minCtrl,
                keyboardType: TextInputType.number,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(hintText: 'Min Players per Team', labelText: 'Min Players'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: maxCtrl,
                keyboardType: TextInputType.number,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(hintText: 'Max Players per Team', labelText: 'Max Players'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: descCtrl,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(hintText: 'Description / Rules overview', labelText: 'Description'),
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
                await ApiService.createSport(SportModel(
                  sportName: nameCtrl.text.trim(),
                  category: catCtrl.text.trim(),
                  minPlayers: int.tryParse(minCtrl.text),
                  maxPlayers: int.tryParse(maxCtrl.text),
                  description: descCtrl.text.trim(),
                ));
                toast.showToast('Sport added successfully', 'success');
                Navigator.pop(ctx);
                _loadSports();
              } catch (e) {
                toast.showToast('Failed to create sport', 'error');
              }
            },
          ),
        ],
      ),
    );
  }

  void _showEditSportDialog(SportModel sport) {
    final nameCtrl = TextEditingController(text: sport.sportName);
    final catCtrl = TextEditingController(text: sport.category ?? 'Outdoor');
    final minCtrl = TextEditingController(text: '${sport.minPlayers ?? 5}');
    final maxCtrl = TextEditingController(text: '${sport.maxPlayers ?? 11}');
    final descCtrl = TextEditingController(text: sport.description ?? '');

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.bgSecondary,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Edit Sport Catalog Entry', style: TextStyle(color: AppColors.textPrimary)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameCtrl,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(hintText: 'Sport Name', labelText: 'Sport Name'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: catCtrl,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(hintText: 'Category', labelText: 'Category'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: minCtrl,
                keyboardType: TextInputType.number,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(hintText: 'Min Players', labelText: 'Min Players'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: maxCtrl,
                keyboardType: TextInputType.number,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(hintText: 'Max Players', labelText: 'Max Players'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: descCtrl,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(hintText: 'Description', labelText: 'Description'),
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
              if (nameCtrl.text.isEmpty || sport.sportId == null) return;
              final toast = Provider.of<ToastProvider>(context, listen: false);
              try {
                await ApiService.updateSport(
                  sport.sportId!,
                  SportModel(
                    sportId: sport.sportId,
                    sportName: nameCtrl.text.trim(),
                    category: catCtrl.text.trim(),
                    minPlayers: int.tryParse(minCtrl.text),
                    maxPlayers: int.tryParse(maxCtrl.text),
                    description: descCtrl.text.trim(),
                  ),
                );
                toast.showToast('Sport updated successfully in database', 'success');
                Navigator.pop(ctx);
                _loadSports();
              } catch (e) {
                toast.showToast('Failed to update sport', 'error');
              }
            },
          ),
        ],
      ),
    );
  }

  void _confirmDeleteSport(SportModel sport) {
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
          'Are you sure you want to delete "${sport.sportName}" from the sports catalog?\n\nThis will remove the sport permanently from the database.',
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
              if (sport.sportId == null) return;
              final toast = Provider.of<ToastProvider>(context, listen: false);
              try {
                await ApiService.deleteSport(sport.sportId!);
                toast.showToast('Sport deleted successfully', 'info');
                _loadSports();
              } catch (_) {
                toast.showToast('Failed to delete sport. Check for dependent tournaments or teams.', 'error');
              }
            },
            child: const Text('Delete Sport'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final isAdmin = authProvider.isAdmin;

    return MainLayout(
      currentRoute: '/sports',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Sports Directory',
                style: TextStyle(color: AppColors.textPrimary, fontSize: 24, fontWeight: FontWeight.bold),
              ),
              if (isAdmin)
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
                  onPressed: _showAddSportDialog,
                  icon: const Icon(Icons.add, size: 18),
                  label: const Text('Add Sport'),
                ),
            ],
          ),
          const SizedBox(height: 20),

          Expanded(
            child: _loading
                ? const SpinnerWidget(message: 'Loading sports catalog...')
                : _sports.isEmpty
                    ? const Center(child: Text('No sports listed in catalog yet', style: TextStyle(color: AppColors.textMuted)))
                    : GridView.builder(
                        gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                          maxCrossAxisExtent: 320,
                          crossAxisSpacing: 16,
                          mainAxisSpacing: 16,
                          childAspectRatio: 1.15,
                        ),
                        itemCount: _sports.length,
                        itemBuilder: (context, index) {
                          final sport = _sports[index];
                          return GlassCard(
                            padding: const EdgeInsets.all(20),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Expanded(
                                      child: Text(
                                        sport.sportName,
                                        style: const TextStyle(color: AppColors.textPrimary, fontSize: 17, fontWeight: FontWeight.bold),
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                    if (isAdmin) ...[
                                      IconButton(
                                        icon: const Icon(Icons.edit_outlined, color: AppColors.primary, size: 18),
                                        tooltip: 'Edit Sport',
                                        onPressed: () => _showEditSportDialog(sport),
                                      ),
                                      IconButton(
                                        icon: const Icon(Icons.delete_outline, color: AppColors.error, size: 18),
                                        tooltip: 'Delete Sport',
                                        onPressed: () => _confirmDeleteSport(sport),
                                      ),
                                    ],
                                  ],
                                ),
                                const SizedBox(height: 6),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(color: AppColors.primaryGlow, borderRadius: BorderRadius.circular(6)),
                                  child: Text(sport.category ?? 'General', style: const TextStyle(color: AppColors.primary, fontSize: 11, fontWeight: FontWeight.bold)),
                                ),
                                const SizedBox(height: 12),
                                Expanded(
                                  child: Text(
                                    sport.description ?? 'Official department sport discipline.',
                                    maxLines: 2,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'Team size: ${sport.minPlayers ?? 1} - ${sport.maxPlayers ?? 11} players',
                                  style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
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
