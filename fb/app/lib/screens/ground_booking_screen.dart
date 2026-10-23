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
  String _selectedStatusFilter = 'ALL';

  @override
  void initState() {
    super.initState();
    _loadBookings();
  }

  Future<void> _loadBookings() async {
    setState(() => _loading = true);
    try {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      // For Admin, userId is null to view all student ground reservations
      final userId = auth.isAdmin ? null : auth.user?.id;
      final list = await ApiService.getGroundBookings(userId: userId);
      if (mounted) setState(() => _bookings = list);
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _updateStatus(GroundBookingModel booking, String newStatus) async {
    if (booking.bookingId == null) return;
    final toast = Provider.of<ToastProvider>(context, listen: false);
    final auth = Provider.of<AuthProvider>(context, listen: false);
    try {
      final updated = GroundBookingModel(
        bookingId: booking.bookingId,
        userId: booking.userId,
        groundName: booking.groundName,
        sportType: booking.sportType,
        bookingDate: booking.bookingDate,
        startTime: booking.startTime,
        endTime: booking.endTime,
        durationHours: booking.durationHours,
        bookingStatus: newStatus,
        paymentAmount: booking.paymentAmount,
        paymentStatus: booking.paymentStatus,
        approvedBy: auth.user?.username ?? 'Admin',
        remarks: booking.remarks,
        studentName: booking.studentName,
        studentRegisterNo: booking.studentRegisterNo,
        studentDept: booking.studentDept,
      );
      await ApiService.updateGroundBooking(booking.bookingId!, updated);
      toast.showToast('Ground reservation marked as $newStatus', 'success');
      _loadBookings();
    } catch (e) {
      toast.showToast('Failed to update reservation: $e', 'error');
    }
  }

  void _confirmDeleteBooking(GroundBookingModel booking) {
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
          'Are you sure you want to delete the reservation for "${booking.groundName ?? 'Facility'}" on ${booking.bookingDate ?? 'TBD'}?\nThis action cannot be undone.',
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
              if (booking.bookingId == null) return;
              final toast = Provider.of<ToastProvider>(context, listen: false);
              try {
                await ApiService.deleteGroundBooking(booking.bookingId!);
                toast.showToast('Ground reservation deleted', 'success');
                _loadBookings();
              } catch (e) {
                toast.showToast('Failed to delete reservation: $e', 'error');
              }
            },
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }

  void _showAddDialog() {
    final groundCtrl = TextEditingController(text: 'Main Football Turf');
    final sportCtrl = TextEditingController(text: 'Football');
    final dateCtrl = TextEditingController(
        text: DateTime.now().toIso8601String().split('T')[0]);
    final startCtrl = TextEditingController(text: '08:00');
    final endCtrl = TextEditingController(text: '10:00');
    final remarksCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.bgSecondary,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Book Sports Ground / Facility',
            style: TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: groundCtrl,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(
                    hintText: 'e.g. Main Football Turf, Indoor Basketball Court',
                    labelText: 'Ground / Facility *'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: sportCtrl,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(
                    hintText: 'e.g. Football, Basketball, Cricket, Athletics',
                    labelText: 'Sport Type'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: dateCtrl,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(
                    hintText: 'yyyy-MM-dd', labelText: 'Reservation Date *'),
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
                          hintText: '08:00', labelText: 'Start Time (HH:mm)'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextField(
                      controller: endCtrl,
                      style: const TextStyle(color: AppColors.textPrimary),
                      decoration: AppStyles.inputDecoration(
                          hintText: '10:00', labelText: 'End Time (HH:mm)'),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              TextField(
                controller: remarksCtrl,
                maxLines: 2,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(
                    hintText: 'e.g. Tournament practice or inter-class match',
                    labelText: 'Purpose / Remarks'),
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
                foregroundColor: Colors.white),
            child: const Text('Submit Reservation'),
            onPressed: () async {
              if (groundCtrl.text.trim().isEmpty) return;
              if (dateCtrl.text.trim().isEmpty) {
                Provider.of<ToastProvider>(context, listen: false)
                    .showToast('Please select reservation date', 'error');
                return;
              }
              final auth = Provider.of<AuthProvider>(context, listen: false);
              final userId = auth.user?.id;
              final toast = Provider.of<ToastProvider>(context, listen: false);
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
                toast.showToast('Ground reservation requested successfully', 'success');
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

  Color _statusColor(String? status) {
    switch ((status ?? '').toLowerCase()) {
      case 'approved':
        return AppColors.success;
      case 'rejected':
        return AppColors.error;
      default:
        return AppColors.warning;
    }
  }

  Color _statusBg(String? status) {
    switch ((status ?? '').toLowerCase()) {
      case 'approved':
        return AppColors.success.withValues(alpha: 0.15);
      case 'rejected':
        return AppColors.error.withValues(alpha: 0.15);
      default:
        return AppColors.warning.withValues(alpha: 0.15);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final isAdmin = auth.isAdmin;

    final filteredBookings = _bookings.where((b) {
      if (_selectedStatusFilter == 'ALL') return true;
      return (b.bookingStatus ?? 'Pending').toUpperCase() == _selectedStatusFilter;
    }).toList();

    return MainLayout(
      currentRoute: '/ground-bookings',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Text(
                        'Ground Bookings',
                        style: TextStyle(
                            color: AppColors.textPrimary,
                            fontSize: 24,
                            fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(width: 10),
                      if (isAdmin)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.primaryGlow,
                            borderRadius: BorderRadius.circular(6),
                            border: Border.all(color: AppColors.primary),
                          ),
                          child: const Text('Admin View • All Reservations',
                              style: TextStyle(color: AppColors.primary, fontSize: 11, fontWeight: FontWeight.bold)),
                        ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    isAdmin
                        ? 'Approve or reject sports facility and ground reservation requests'
                        : 'Book sports fields and courts for matches and practice sessions',
                    style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                  ),
                ],
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
          const SizedBox(height: 16),

          // Filter chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildFilterChip('ALL', 'All Grounds (${_bookings.length})'),
                const SizedBox(width: 8),
                _buildFilterChip(
                  'PENDING',
                  'Pending (${_bookings.where((b) => (b.bookingStatus ?? 'Pending').toUpperCase() == 'PENDING').length})',
                  color: AppColors.warning,
                ),
                const SizedBox(width: 8),
                _buildFilterChip(
                  'APPROVED',
                  'Approved (${_bookings.where((b) => (b.bookingStatus ?? '').toUpperCase() == 'APPROVED').length})',
                  color: AppColors.success,
                ),
                const SizedBox(width: 8),
                _buildFilterChip(
                  'REJECTED',
                  'Rejected (${_bookings.where((b) => (b.bookingStatus ?? '').toUpperCase() == 'REJECTED').length})',
                  color: AppColors.error,
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          Expanded(
            child: _loading
                ? const SpinnerWidget(
                    message: 'Loading ground reservations...')
                : filteredBookings.isEmpty
                    ? Center(
                        child: GlassCard(
                          padding: const EdgeInsets.all(32),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Text('🏟️', style: TextStyle(fontSize: 40)),
                              const SizedBox(height: 12),
                              Text(
                                _selectedStatusFilter == 'ALL'
                                    ? 'No ground reservations found.'
                                    : 'No $_selectedStatusFilter reservations found.',
                                style: const TextStyle(color: AppColors.textMuted, fontSize: 15),
                              ),
                            ],
                          ),
                        ),
                      )
                    : ListView.builder(
                        itemCount: filteredBookings.length,
                        itemBuilder: (context, index) {
                          final b = filteredBookings[index];
                          final status = b.bookingStatus ?? 'Pending';
                          final isPending = status.toLowerCase() == 'pending';

                          return Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: GlassCard(
                              padding: const EdgeInsets.all(16),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(12),
                                    decoration: BoxDecoration(
                                      color: _statusBg(status),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: const Text('🏟️', style: TextStyle(fontSize: 26)),
                                  ),
                                  const SizedBox(width: 16),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          children: [
                                            Expanded(
                                              child: Text(
                                                b.groundName ?? 'Sports Facility',
                                                style: const TextStyle(
                                                    color: AppColors.textPrimary,
                                                    fontWeight: FontWeight.bold,
                                                    fontSize: 16),
                                              ),
                                            ),
                                            Container(
                                              padding: const EdgeInsets.symmetric(
                                                  horizontal: 10, vertical: 4),
                                              decoration: BoxDecoration(
                                                color: _statusBg(status),
                                                borderRadius: BorderRadius.circular(20),
                                                border: Border.all(color: _statusColor(status).withValues(alpha: 0.5)),
                                              ),
                                              child: Text(
                                                status,
                                                style: TextStyle(
                                                    color: _statusColor(status),
                                                    fontWeight: FontWeight.bold,
                                                    fontSize: 12),
                                              ),
                                            ),
                                          ],
                                        ),
                                        const SizedBox(height: 6),
                                        // Student info banner if admin
                                        if (isAdmin || b.studentName != null) ...[
                                          Row(
                                            children: [
                                              const Icon(Icons.person_outline, size: 14, color: AppColors.primary),
                                              const SizedBox(width: 4),
                                              Text(
                                                'Requested by: ${b.studentName ?? 'Student #${b.userId ?? 'N/A'}'}',
                                                style: const TextStyle(
                                                  color: AppColors.textPrimary,
                                                  fontWeight: FontWeight.w600,
                                                  fontSize: 13,
                                                ),
                                              ),
                                              if (b.studentRegisterNo != null) ...[
                                                const SizedBox(width: 6),
                                                Container(
                                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                                                  decoration: BoxDecoration(
                                                    color: AppColors.bgTertiary,
                                                    borderRadius: BorderRadius.circular(4),
                                                  ),
                                                  child: Text(
                                                    b.studentRegisterNo!,
                                                    style: const TextStyle(color: AppColors.textSecondary, fontSize: 11),
                                                  ),
                                                ),
                                              ],
                                              if (b.studentDept != null) ...[
                                                const SizedBox(width: 6),
                                                Text('• ${b.studentDept}', style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
                                              ],
                                            ],
                                          ),
                                          const SizedBox(height: 6),
                                        ],
                                        Wrap(
                                          spacing: 12,
                                          runSpacing: 4,
                                          children: [
                                            Text(
                                              'Date: ${b.bookingDate ?? 'TBD'}',
                                              style: const TextStyle(color: AppColors.textSecondary, fontSize: 13, fontWeight: FontWeight.bold),
                                            ),
                                            Text(
                                              'Slot: ${b.timeSlotDisplay}',
                                              style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                                            ),
                                            if (b.sportType != null)
                                              Text('Sport: ${b.sportType}', style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
                                            if (b.approvedBy != null && b.approvedBy!.isNotEmpty)
                                              Text('Approved by: ${b.approvedBy}', style: const TextStyle(color: AppColors.success, fontSize: 12)),
                                          ],
                                        ),
                                        if (b.remarks != null && b.remarks!.isNotEmpty) ...[
                                          const SizedBox(height: 6),
                                          Text(
                                            'Purpose: ${b.remarks!}',
                                            style: const TextStyle(color: AppColors.textMuted, fontSize: 12, fontStyle: FontStyle.italic),
                                          ),
                                        ],
                                        // Admin Action Buttons
                                        if (isAdmin) ...[
                                          const SizedBox(height: 12),
                                          Wrap(
                                            spacing: 8,
                                            runSpacing: 6,
                                            children: [
                                              if (isPending) ...[
                                                ElevatedButton.icon(
                                                  style: ElevatedButton.styleFrom(
                                                    backgroundColor: AppColors.success,
                                                    foregroundColor: Colors.white,
                                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                                    minimumSize: Size.zero,
                                                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                                  ),
                                                  onPressed: () => _updateStatus(b, 'Approved'),
                                                  icon: const Icon(Icons.check, size: 14),
                                                  label: const Text('Approve', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                                ),
                                                OutlinedButton.icon(
                                                  style: OutlinedButton.styleFrom(
                                                    foregroundColor: AppColors.error,
                                                    side: const BorderSide(color: AppColors.error),
                                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                                    minimumSize: Size.zero,
                                                    tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                                  ),
                                                  onPressed: () => _updateStatus(b, 'Rejected'),
                                                  icon: const Icon(Icons.close, size: 14),
                                                  label: const Text('Reject', style: TextStyle(fontSize: 12)),
                                                ),
                                              ],
                                              IconButton(
                                                icon: const Icon(Icons.delete_outline, color: AppColors.error, size: 18),
                                                tooltip: 'Delete Reservation',
                                                padding: EdgeInsets.zero,
                                                constraints: const BoxConstraints(),
                                                onPressed: () => _confirmDeleteBooking(b),
                                              ),
                                            ],
                                          ),
                                        ],
                                      ],
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

  Widget _buildFilterChip(String filterKey, String label, {Color? color}) {
    final isSelected = _selectedStatusFilter == filterKey;
    final chipColor = color ?? AppColors.primary;

    return InkWell(
      onTap: () => setState(() => _selectedStatusFilter = filterKey),
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? chipColor.withValues(alpha: 0.25) : AppColors.cardSurface,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? chipColor : AppColors.glassBorder,
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : AppColors.textSecondary,
            fontSize: 12,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ),
    );
  }
}
