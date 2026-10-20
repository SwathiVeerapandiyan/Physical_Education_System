import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_styles.dart';
import '../models/health_fitness.dart';
import '../providers/api_service.dart';
import '../providers/auth_provider.dart';
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
      final auth = Provider.of<AuthProvider>(context, listen: false);
      final userId = auth.user?.id;
      final list = await ApiService.getHealthFitness(userId: userId);
      if (mounted) setState(() => _records = list);
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  void _showAddDialog() {
    final hCtrl = TextEditingController(text: '175');
    final wCtrl = TextEditingController(text: '70');
    final bloodGrpCtrl = TextEditingController();
    final heartRateCtrl = TextEditingController();
    final levelCtrl = TextEditingController(text: 'Good');
    final medCtrl = TextEditingController();
    final allergyCtrl = TextEditingController();
    final notesCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Add Health Metric Record',
            style: TextStyle(color: AppColors.textPrimary)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: hCtrl,
                      keyboardType: TextInputType.number,
                      style: const TextStyle(color: AppColors.textPrimary),
                      decoration: AppStyles.inputDecoration(
                          hintText: 'cm', labelText: 'Height (cm)'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextField(
                      controller: wCtrl,
                      keyboardType: TextInputType.number,
                      style: const TextStyle(color: AppColors.textPrimary),
                      decoration: AppStyles.inputDecoration(
                          hintText: 'kg', labelText: 'Weight (kg)'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: bloodGrpCtrl,
                      style: const TextStyle(color: AppColors.textPrimary),
                      decoration: AppStyles.inputDecoration(
                          hintText: 'e.g. O+', labelText: 'Blood Group'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextField(
                      controller: heartRateCtrl,
                      keyboardType: TextInputType.number,
                      style: const TextStyle(color: AppColors.textPrimary),
                      decoration: AppStyles.inputDecoration(
                          hintText: 'bpm', labelText: 'Heart Rate'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              TextField(
                controller: levelCtrl,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(
                    hintText: 'Excellent / Good / Average',
                    labelText: 'Fitness Level'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: medCtrl,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(
                    hintText: 'Any medical conditions',
                    labelText: 'Medical Conditions'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: allergyCtrl,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(
                    hintText: 'Any allergies', labelText: 'Allergies'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: notesCtrl,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(
                    hintText: 'Emergency notes', labelText: 'Emergency Notes'),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            child: const Text('Cancel',
                style: TextStyle(color: AppColors.textMuted)),
            onPressed: () => Navigator.pop(ctx),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white),
            child: const Text('Save Record'),
            onPressed: () async {
              final h = double.tryParse(hCtrl.text) ?? 175;
              final w = double.tryParse(wCtrl.text) ?? 70;
              // BMI calculated server-side; send raw values
              final auth =
                  Provider.of<AuthProvider>(context, listen: false);
              final userId = auth.user?.id;
              final toast =
                  Provider.of<ToastProvider>(context, listen: false);
              try {
                await ApiService.createHealthFitness(HealthFitnessModel(
                  userId: userId,
                  heightCm: h,
                  weightKg: w,
                  bloodGroup: bloodGrpCtrl.text.trim().isNotEmpty
                      ? bloodGrpCtrl.text.trim()
                      : null,
                  heartRate: int.tryParse(heartRateCtrl.text.trim()),
                  fitnessLevel: levelCtrl.text.trim().isNotEmpty
                      ? levelCtrl.text.trim()
                      : null,
                  medicalConditions: medCtrl.text.trim().isNotEmpty
                      ? medCtrl.text.trim()
                      : null,
                  allergies: allergyCtrl.text.trim().isNotEmpty
                      ? allergyCtrl.text.trim()
                      : null,
                  emergencyNotes: notesCtrl.text.trim().isNotEmpty
                      ? notesCtrl.text.trim()
                      : null,
                  lastCheckup: DateTime.now().toIso8601String().split('T')[0],
                ));
                toast.showToast('Health metric recorded', 'success');
                if (ctx.mounted) Navigator.pop(ctx);
                _loadData();
              } catch (e) {
                toast.showToast('Failed to save record: $e', 'error');
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
                style: TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 24,
                    fontWeight: FontWeight.bold),
              ),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white),
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
                    ? const Center(
                        child: Text('No health records logged yet',
                            style:
                                TextStyle(color: AppColors.textMuted)))
                    : ListView.builder(
                        itemCount: _records.length,
                        itemBuilder: (context, index) {
                          final r = _records[index];
                          final bmiDisplay = r.bmi != null
                              ? r.bmi!.toStringAsFixed(1)
                              : '—';
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: GlassCard(
                              padding: const EdgeInsets.all(16),
                              child: Row(
                                children: [
                                  const Text('🩺',
                                      style: TextStyle(fontSize: 28)),
                                  const SizedBox(width: 16),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          'BMI: $bmiDisplay (${r.fitnessLevel ?? 'FIT'})',
                                          style: const TextStyle(
                                              color: AppColors.textPrimary,
                                              fontWeight: FontWeight.bold,
                                              fontSize: 16),
                                        ),
                                        Text(
                                          'Height: ${r.heightCm ?? 0} cm | Weight: ${r.weightKg ?? 0} kg'
                                          '${r.bloodGroup != null ? ' | Blood: ${r.bloodGroup}' : ''}',
                                          style: const TextStyle(
                                              color: AppColors.textSecondary,
                                              fontSize: 13),
                                        ),
                                        if (r.medicalConditions != null &&
                                            r.medicalConditions!.isNotEmpty)
                                          Text(
                                            'Medical: ${r.medicalConditions}',
                                            style: const TextStyle(
                                                color: AppColors.textMuted,
                                                fontSize: 12),
                                          ),
                                      ],
                                    ),
                                  ),
                                  Text(
                                    r.lastCheckup ?? '',
                                    style: const TextStyle(
                                        color: AppColors.textMuted,
                                        fontSize: 12),
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
