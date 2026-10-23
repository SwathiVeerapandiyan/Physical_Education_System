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
      final list = await ApiService.getGroundBookings();
      if (mounted) setState(() => _bookings = list);
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  void _showAddDialog() {
    final groundCtrl = TextEditingController();
    final slotCtrl = TextEditingController(text: '08:00 AM - 10:00 AM');
    final purposeCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Book Sports Ground', style: TextStyle(color: AppColors.textPrimary)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: groundCtrl,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(hintText: 'Ground Name (e.g. Football Turf, Tennis Court)', labelText: 'Facility / Ground'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: slotCtrl,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(hintText: 'Time Slot (e.g. 08:00 AM - 10:00 AM)', labelText: 'Time Slot'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: purposeCtrl,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(hintText: 'Purpose (e.g. Team Practice)', labelText: 'Purpose'),
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
            child: const Text('Reserve Ground'),
            onPressed: () async {
              if (groundCtrl.text.isEmpty) return;
              final toast = Provider.of<ToastProvider>(context, listen: false);
              final user = Provider.of<AuthProvider>(context, listen: false).user;
              try {
                await ApiService.createGroundBooking(GroundBookingModel(
                  userId: user?.id ?? 1,
                  groundName: groundCtrl.text.trim(),
                  bookingDate: DateTime.now().toIso8601String().substring(0, 10),
                  timeSlot: slotCtrl.text.trim(),
                  purpose: purposeCtrl.text.trim(),
                  status: 'PENDING',
                ));
                toast.showToast('Ground reservation requested', 'success');
                if (ctx.mounted) Navigator.pop(ctx);
                _loadBookings();
              } catch (_) {
                toast.showToast('Failed to submit reservation', 'error');
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
                style: TextStyle(color: AppColors.textPrimary, fontSize: 24, fontWeight: FontWeight.bold),
              ),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
                onPressed: _showAddDialog,
                icon: const Icon(Icons.add, size: 18),
                label: const Text('Book Ground'),
              ),
            ],
          ),
          const SizedBox(height: 20),

          Expanded(
            child: _loading
                ? const SpinnerWidget(message: 'Loading ground reservations...')
                : _bookings.isEmpty
                    ? const Center(child: Text('No ground reservations found', style: TextStyle(color: AppColors.textMuted)))
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
                                  const Text('🏟️', style: TextStyle(fontSize: 24)),
                                  const SizedBox(width: 16),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(b.groundName ?? 'Sports Facility', style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 16)),
                                        Text('Time Slot: ${b.timeSlot ?? 'TBD'} | Purpose: ${b.purpose ?? 'Practice'}', style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                                      ],
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(color: AppColors.primaryGlow, borderRadius: BorderRadius.circular(20)),
                                    child: Text(b.status ?? 'PENDING', style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 12)),
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
