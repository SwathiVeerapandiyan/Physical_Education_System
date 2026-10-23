import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_styles.dart';
import '../models/live_score.dart';
import '../providers/api_service.dart';
import '../providers/toast_provider.dart';
import '../widgets/glass_card.dart';
import '../widgets/main_layout.dart';
import '../widgets/spinner_widget.dart';

class LiveScoreScreen extends StatefulWidget {
  const LiveScoreScreen({super.key});

  @override
  State<LiveScoreScreen> createState() => _LiveScoreScreenState();
}

class _LiveScoreScreenState extends State<LiveScoreScreen> {
  List<LiveScoreModel> _scores = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadScores();
  }

  Future<void> _loadScores() async {
    setState(() => _loading = true);
    try {
      final list = await ApiService.getLiveScores();
      if (mounted) setState(() => _scores = list);
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  void _showAddDialog() {
    final titleCtrl = TextEditingController();
    final sportCtrl = TextEditingController(text: 'Football');
    final scoreACtrl = TextEditingController(text: '2');
    final scoreBCtrl = TextEditingController(text: '1');

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Update Live Match Score', style: TextStyle(color: AppColors.textPrimary)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: titleCtrl,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(hintText: 'Match Title (e.g. MCA vs CSE Final)', labelText: 'Match Title'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: sportCtrl,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(hintText: 'Sport Type', labelText: 'Sport'),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: scoreACtrl,
                      style: const TextStyle(color: AppColors.textPrimary),
                      decoration: AppStyles.inputDecoration(hintText: 'Team A Score', labelText: 'Score A'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextField(
                      controller: scoreBCtrl,
                      style: const TextStyle(color: AppColors.textPrimary),
                      decoration: AppStyles.inputDecoration(hintText: 'Team B Score', labelText: 'Score B'),
                    ),
                  ),
                ],
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
            child: const Text('Publish Score'),
            onPressed: () async {
              if (titleCtrl.text.isEmpty) return;
              final toast = Provider.of<ToastProvider>(context, listen: false);
              try {
                await ApiService.createLiveScore(LiveScoreModel(
                  matchTitle: titleCtrl.text.trim(),
                  sportType: sportCtrl.text.trim(),
                  teamAScore: scoreACtrl.text.trim(),
                  teamBScore: scoreBCtrl.text.trim(),
                  currentStatus: 'LIVE',
                  commentary: 'High intensity action on field!',
                ));
                toast.showToast('Live score updated', 'success');
                if (ctx.mounted) Navigator.pop(ctx);
                _loadScores();
              } catch (_) {
                toast.showToast('Failed to update live score', 'error');
              }
            },
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return MainLayout(
      currentRoute: '/live-scores',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Live Scoreboard',
                style: TextStyle(color: AppColors.textPrimary, fontSize: 24, fontWeight: FontWeight.bold),
              ),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(backgroundColor: AppColors.accent, foregroundColor: Colors.black),
                onPressed: _showAddDialog,
                icon: const Icon(Icons.flash_on, size: 18),
                label: const Text('Update Score', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 20),

          Expanded(
            child: _loading
                ? const SpinnerWidget(message: 'Loading live score ticker...')
                : _scores.isEmpty
                    ? const Center(child: Text('No active live score updates', style: TextStyle(color: AppColors.textMuted)))
                    : ListView.builder(
                        itemCount: _scores.length,
                        itemBuilder: (context, index) {
                          final s = _scores[index];
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 16),
                            child: GlassCard(
                              padding: const EdgeInsets.all(20),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        s.matchTitle ?? 'Live Match',
                                        style: const TextStyle(color: AppColors.textPrimary, fontSize: 18, fontWeight: FontWeight.bold),
                                      ),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                        decoration: BoxDecoration(color: AppColors.error.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(20), border: Border.all(color: AppColors.error)),
                                        child: const Text('🔴 LIVE', style: TextStyle(color: AppColors.error, fontWeight: FontWeight.bold, fontSize: 11)),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 16),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Text(
                                        '${s.teamAScore ?? '0'} : ${s.teamBScore ?? '0'}',
                                        style: const TextStyle(color: AppColors.accent, fontSize: 32, fontWeight: FontWeight.w800),
                                      ),
                                    ],
                                  ),
                                  if (s.commentary != null) ...[
                                    const SizedBox(height: 12),
                                    Text('Commentary: ${s.commentary}', style: const TextStyle(color: AppColors.textMuted, fontSize: 13)),
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
