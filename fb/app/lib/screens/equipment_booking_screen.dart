import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_styles.dart';
import '../models/equipment_booking.dart';
import '../providers/api_service.dart';
import '../providers/auth_provider.dart';
import '../providers/toast_provider.dart';
import '../widgets/glass_card.dart';
import '../widgets/main_layout.dart';
import '../widgets/spinner_widget.dart';

class EquipmentBookingScreen extends StatefulWidget {
  const EquipmentBookingScreen({super.key});

  @override
  State<EquipmentBookingScreen> createState() => _EquipmentBookingScreenState();
}

class _EquipmentBookingScreenState extends State<EquipmentBookingScreen> {
  List<EquipmentBookingModel> _bookings = [];
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
      final list = await ApiService.getEquipmentBookings(userId: userId);
      if (mounted) setState(() => _bookings = list);
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  void _showAddDialog() {
    final eqCtrl = TextEditingController();
    final categoryCtrl = TextEditingController();
    final qtyCtrl = TextEditingController(text: '1');
    final dateCtrl = TextEditingController(
        text: DateTime.now().toIso8601String().split('T')[0]);
    final returnDateCtrl = TextEditingController();
    final remarksCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Request Equipment',
            style: TextStyle(color: AppColors.textPrimary)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Equipment Name
              TextField(
                controller: eqCtrl,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(
                    hintText: 'e.g. Basketball, Cricket Bat',
                    labelText: 'Item Name'),
              ),
              const SizedBox(height: 12),
              // Equipment Category
              TextField(
                controller: categoryCtrl,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(
                    hintText: 'e.g. Ball Sports, Racket Sports',
                    labelText: 'Category (optional)'),
              ),
              const SizedBox(height: 12),
              // Quantity
              TextField(
                controller: qtyCtrl,
                keyboardType: TextInputType.number,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(
                    hintText: 'How many?', labelText: 'Quantity'),
              ),
              const SizedBox(height: 12),
              // Booking Date (NOT NULL in DB)
              TextField(
                controller: dateCtrl,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(
                    hintText: 'yyyy-MM-dd', labelText: 'Booking Date *'),
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
              // Return Date (optional)
              TextField(
                controller: returnDateCtrl,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(
                    hintText: 'yyyy-MM-dd', labelText: 'Return Date (optional)'),
                readOnly: true,
                onTap: () async {
                  final picked = await showDatePicker(
                    context: ctx,
                    initialDate: DateTime.now().add(const Duration(days: 1)),
                    firstDate: DateTime.now(),
                    lastDate: DateTime.now().add(const Duration(days: 365)),
                  );
                  if (picked != null) {
                    returnDateCtrl.text =
                        picked.toIso8601String().split('T')[0];
                  }
                },
              ),
              const SizedBox(height: 12),
              // Remarks
              TextField(
                controller: remarksCtrl,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(
                    hintText: 'Purpose or additional notes',
                    labelText: 'Remarks (optional)'),
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
            child: const Text('Submit Request'),
            onPressed: () async {
              if (eqCtrl.text.trim().isEmpty) return;
              if (dateCtrl.text.trim().isEmpty) {
                Provider.of<ToastProvider>(context, listen: false)
                    .showToast('Please select a booking date', 'error');
                return;
              }
              final auth = Provider.of<AuthProvider>(context, listen: false);
              final userId = auth.user?.id;
              final toast =
                  Provider.of<ToastProvider>(context, listen: false);
              try {
                await ApiService.createEquipmentBooking(EquipmentBookingModel(
                  userId: userId,
                  equipmentName: eqCtrl.text.trim(),
                  equipmentCategory: categoryCtrl.text.trim().isNotEmpty
                      ? categoryCtrl.text.trim()
                      : null,
                  quantity: int.tryParse(qtyCtrl.text.trim()) ?? 1,
                  bookingDate: dateCtrl.text.trim(),
                  returnDate: returnDateCtrl.text.trim().isNotEmpty
                      ? returnDateCtrl.text.trim()
                      : null,
                  remarks: remarksCtrl.text.trim().isNotEmpty
                      ? remarksCtrl.text.trim()
                      : null,
                  bookingStatus: 'Pending',
                ));
                toast.showToast('Equipment request submitted', 'success');
                if (ctx.mounted) Navigator.pop(ctx);
                _loadBookings();
              } catch (e) {
                toast.showToast('Failed to submit request: $e', 'error');
              }
            },
          ),
        ],
      ),
    );
  }

  Color _statusColor(String? status) {
    switch ((status ?? '').toLowerCase()) {
      case 'approved':
        return AppColors.success;
      case 'rejected':
        return AppColors.error;
      case 'returned':
        return AppColors.textMuted;
      default:
        return AppColors.primary;
    }
  }

  Color _statusBg(String? status) {
    switch ((status ?? '').toLowerCase()) {
      case 'approved':
        return AppColors.success.withOpacity(0.15);
      case 'rejected':
        return AppColors.error.withOpacity(0.15);
      case 'returned':
        return AppColors.textMuted.withOpacity(0.15);
      default:
        return AppColors.primaryGlow;
    }
  }

  @override
  Widget build(BuildContext context) {
    return MainLayout(
      currentRoute: '/equipment-bookings',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Equipment Bookings',
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
                label: const Text('Request Equipment'),
              ),
            ],
          ),
          const SizedBox(height: 20),

          Expanded(
            child: _loading
                ? const SpinnerWidget(
                    message: 'Loading equipment requests...')
                : _bookings.isEmpty
                    ? const Center(
                        child: Text(
                          'No active equipment bookings',
                          style: TextStyle(color: AppColors.textMuted),
                        ),
                      )
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
                                  const Text('🏀',
                                      style: TextStyle(fontSize: 24)),
                                  const SizedBox(width: 16),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          b.equipmentName ?? 'Sports Equipment',
                                          style: const TextStyle(
                                              color: AppColors.textPrimary,
                                              fontWeight: FontWeight.bold,
                                              fontSize: 16),
                                        ),
                                        Text(
                                          'Qty: ${b.quantity ?? 1}'
                                          '${b.equipmentCategory != null ? ' | ${b.equipmentCategory}' : ''}'
                                          '${b.bookingDate != null ? ' | ${b.bookingDate}' : ''}',
                                          style: const TextStyle(
                                              color: AppColors.textSecondary,
                                              fontSize: 13),
                                        ),
                                        if (b.remarks != null &&
                                            b.remarks!.isNotEmpty)
                                          Text(
                                            b.remarks!,
                                            style: const TextStyle(
                                                color: AppColors.textMuted,
                                                fontSize: 12),
                                          ),
                                      ],
                                    ),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                        color: _statusBg(b.bookingStatus),
                                        borderRadius:
                                            BorderRadius.circular(20)),
                                    child: Text(
                                      b.bookingStatus ?? 'Pending',
                                      style: TextStyle(
                                          color: _statusColor(b.bookingStatus),
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
