import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_styles.dart';
import '../models/ground_booking.dart';
import '../providers/api_service.dart';
import '../providers/auth_provider.dart';
import '../providers/toast_provider.dart';
import '../widgets/glass_card.dart';
import '../widgets/main_layout.dart';
import '../widgets/spinner_widget.dart';

class GroundBookingScreen extends StatefulWidget {
  const GroundBookingScreen({super.key});

  @override
  State<GroundBookingScreen> createState() => _GroundBookingScreenState();
}

class _GroundBookingScreenState extends State<GroundBookingScreen> {
  List<GroundBookingModel> _bookings = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadBookings();
  }

  Future<void> _loadBookings() async {
    setState(() => _loading = true);
    try {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      final userId = auth.user?.id;
      final list = await ApiService.getGroundBookings(
        userId: userId,
      );
      if (mounted) setState(() => _bookings = list);
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  void _showAddDialog() {
    final groundCtrl = TextEditingController();
    final sportCtrl = TextEditingController();
    final dateCtrl = TextEditingController(
        text: DateTime.now().toIso8601String().split('T')[0]);
    final startCtrl = TextEditingController(text: '08:00');
    final endCtrl = TextEditingController(text: '10:00');
    final remarksCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Book Sports Ground',
            style: TextStyle(color: AppColors.textPrimary)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: groundCtrl,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(
                    hintText: 'e.g. Football Turf, Tennis Court',
                    labelText: 'Ground Name'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: sportCtrl,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(
                    hintText: 'e.g. Football, Cricket',
                    labelText: 'Sport Type'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: dateCtrl,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(
                    hintText: 'yyyy-MM-dd', labelText: 'Booking Date'),
                readOnly: true,
                onTap: () async {
                  final picked = await showDatePicker(
                    context: ctx,
                    initialDate: DateTime.now(),
                    firstDate: DateTime.now(),
                    lastDate: DateTime.now().add(const Duration(days: 90)),
                  );
                  if (picked != null) {
                    dateCtrl.text = picked.toIso8601String().split('T')[0];
                  }
                },
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: startCtrl,
                      style: const TextStyle(color: AppColors.textPrimary),
                      decoration: AppStyles.inputDecoration(
                          hintText: 'HH:mm', labelText: 'Start Time'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextField(
                      controller: endCtrl,
                      style: const TextStyle(color: AppColors.textPrimary),
                      decoration: AppStyles.inputDecoration(
                          hintText: 'HH:mm', labelText: 'End Time'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              TextField(
                controller: remarksCtrl,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(
                    hintText: 'e.g. Team Practice', labelText: 'Remarks / Purpose'),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            child:
                const Text('Cancel', style: TextStyle(color: AppColors.textMuted)),
            onPressed: () => Navigator.pop(ctx),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary, foregroundColor: Colors.white),
            child: const Text('Reserve Ground'),
            onPressed: () async {
              if (groundCtrl.text.trim().isEmpty) return;
              final auth = Provider.of<AuthProvider>(context, listen: false);
              final userId = auth.user?.id;
              final toast =
                  Provider.of<ToastProvider>(context, listen: false);
              try {
                await ApiService.createGroundBooking(GroundBookingModel(
                  userId: userId,
                  groundName: groundCtrl.text.trim(),
                  sportType: sportCtrl.text.trim().isNotEmpty
                      ? sportCtrl.text.trim()
                      : null,
                  bookingDate: dateCtrl.text.trim(),
                  startTime: startCtrl.text.trim().isNotEmpty
                      ? '${startCtrl.text.trim()}:00'
                      : null,
                  endTime: endCtrl.text.trim().isNotEmpty
                      ? '${endCtrl.text.trim()}:00'
                      : null,
                  remarks: remarksCtrl.text.trim().isNotEmpty
                      ? remarksCtrl.text.trim()
                      : null,
                  bookingStatus: 'Pending',
                ));
                toast.showToast('Ground reservation requested', 'success');
                if (ctx.mounted) Navigator.pop(ctx);
                _loadBookings();
              } catch (e) {
                toast.showToast('Failed to submit reservation: $e', 'error');
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
      currentRoute: '/ground-bookings',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Ground Bookings',
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
                icon: const Icon(Icons.add, size: 18),
                label: const Text('Book Ground'),
              ),
            ],
          ),
          const SizedBox(height: 20),

          Expanded(
            child: _loading
                ? const SpinnerWidget(
                    message: 'Loading ground reservations...')
                : _bookings.isEmpty
                    ? const Center(
                        child: Text('No ground reservations found',
                            style:
                                TextStyle(color: AppColors.textMuted)))
                    : ListView.builder(
                        itemCount: _bookings.length,
                        itemBuilder: (context, index) {
                          final b = _bookings[index];
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: GlassCard(
                              padding: const EdgeInsets.all(16),
                              child: Row(
                                children: [
                                  const Text('🏟️',
                                      style: TextStyle(fontSize: 24)),
                                  const SizedBox(width: 16),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          b.groundName ?? 'Sports Facility',
                                          style: const TextStyle(
                                              color: AppColors.textPrimary,
                                              fontWeight: FontWeight.bold,
                                              fontSize: 16),
                                        ),
                                        Text(
                                          '${b.bookingDate ?? 'TBD'} | ${b.timeSlotDisplay}'
                                          '${b.sportType != null ? ' | ${b.sportType}' : ''}'
                                          '${b.remarks != null ? ' | ${b.remarks}' : ''}',
                                          style: const TextStyle(
                                              color: AppColors.textSecondary,
                                              fontSize: 13),
                                        ),
                                      ],
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                        color: AppColors.primaryGlow,
                                        borderRadius:
                                            BorderRadius.circular(20)),
                                    child: Text(
                                      b.bookingStatus ?? 'Pending',
                                      style: const TextStyle(
                                          color: AppColors.primary,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 12),
                                    ),
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
