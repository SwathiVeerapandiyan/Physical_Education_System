import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_styles.dart';
import '../models/health_fitness.dart';
import '../providers/api_service.dart';
import '../providers/toast_provider.dart';
import '../widgets/glass_card.dart';
import '../widgets/main_layout.dart';
import '../widgets/spinner_widget.dart';

class HealthFitnessScreen extends StatefulWidget {
  const HealthFitnessScreen({super.key});

  @override
  State<HealthFitnessScreen> createState() => _HealthFitnessScreenState();
}

class _HealthFitnessScreenState extends State<HealthFitnessScreen> {
  List<HealthFitnessModel> _records = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);
    try {
      final list = await ApiService.getHealthFitness();
      if (mounted) setState(() => _records = list);
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  void _showAddDialog() {
    final hCtrl = TextEditingController(text: '175');
    final wCtrl = TextEditingController(text: '70');
    final levelCtrl = TextEditingController(text: 'EXCELLENT');

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Add Health Metric Record', style: TextStyle(color: AppColors.textPrimary)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: hCtrl,
                keyboardType: TextInputType.number,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(hintText: 'Height in cm', labelText: 'Height (cm)'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: wCtrl,
                keyboardType: TextInputType.number,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(hintText: 'Weight in kg', labelText: 'Weight (kg)'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: levelCtrl,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(hintText: 'Fitness Level (EXCELLENT/GOOD)', labelText: 'Fitness Level'),
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
            child: const Text('Save Record'),
            onPressed: () async {
              final h = double.tryParse(hCtrl.text) ?? 175;
              final w = double.tryParse(wCtrl.text) ?? 70;
              final bmiVal = (w / ((h / 100) * (h / 100))).toStringAsFixed(1);
              final toast = Provider.of<ToastProvider>(context, listen: false);

              try {
                await ApiService.createHealthFitness(HealthFitnessModel(
                  height: h,
                  weight: w,
                  bmi: bmiVal,
                  fitnessLevel: levelCtrl.text.trim(),
                  lastCheckupDate: DateTime.now().toString().split(' ')[0],
                ));
                toast.showToast('Health metric recorded', 'success');
                Navigator.pop(ctx);
                _loadData();
              } catch (_) {
                toast.showToast('Failed to save record', 'error');
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
      currentRoute: '/health-fitness',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Health & Fitness Metrics',
                style: TextStyle(color: AppColors.textPrimary, fontSize: 24, fontWeight: FontWeight.bold),
              ),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
                onPressed: _showAddDialog,
                icon: const Icon(Icons.favorite_outline, size: 18),
                label: const Text('Record Metrics'),
              ),
            ],
          ),
          const SizedBox(height: 20),

          Expanded(
            child: _loading
                ? const SpinnerWidget(message: 'Loading health records...')
                : _records.isEmpty
                    ? const Center(child: Text('No health records logged yet', style: TextStyle(color: AppColors.textMuted)))
                    : ListView.builder(
                        itemCount: _records.length,
                        itemBuilder: (context, index) {
                          final r = _records[index];
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: GlassCard(
                              padding: const EdgeInsets.all(16),
                              child: Row(
                                children: [
                                  const Text('🩺', style: TextStyle(fontSize: 28)),
                                  const SizedBox(width: 16),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text('BMI Score: ${r.bmi ?? '22.5'} (${r.fitnessLevel ?? 'FIT'})', style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 16)),
                                        Text('Height: ${r.height ?? 0} cm | Weight: ${r.weight ?? 0} kg', style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                                      ],
                                    ),
                                  ),
                                  Text(r.lastCheckupDate ?? 'Recently Checked', style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
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
