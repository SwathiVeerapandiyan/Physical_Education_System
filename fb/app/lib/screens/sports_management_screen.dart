import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_styles.dart';
import '../models/sport.dart';
import '../providers/api_service.dart';
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

  void _deleteSport(int id) async {
    final toast = Provider.of<ToastProvider>(context, listen: false);
    try {
      await ApiService.deleteSport(id);
      toast.showToast('Sport deleted', 'info');
      _loadSports();
    } catch (_) {
      toast.showToast('Failed to delete sport', 'error');
    }
  }

  @override
  Widget build(BuildContext context) {
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
                          childAspectRatio: 1.2,
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
                                    Text(
                                      sport.sportName,
                                      style: const TextStyle(color: AppColors.textPrimary, fontSize: 18, fontWeight: FontWeight.bold),
                                    ),
                                    IconButton(
                                      icon: const Icon(Icons.delete_outline, color: AppColors.error, size: 20),
                                      onPressed: () => sport.sportId != null ? _deleteSport(sport.sportId!) : null,
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 6),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(color: AppColors.primaryGlow, borderRadius: BorderRadius.circular(6)),
                                  child: Text(sport.category ?? 'General', style: const TextStyle(color: AppColors.primary, fontSize: 11, fontWeight: FontWeight.bold)),
                                ),
                                const SizedBox(height: 12),
                                Text(
                                  sport.description ?? 'Official department sport discipline.',
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                                ),
                                const Spacer(),
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
