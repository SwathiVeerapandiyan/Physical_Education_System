import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_styles.dart';
import '../models/notice_item.dart';
import '../providers/api_service.dart';
import '../providers/auth_provider.dart';
import '../providers/toast_provider.dart';
import '../widgets/glass_card.dart';
import '../widgets/main_layout.dart';
import '../widgets/spinner_widget.dart';

class NoticeBoardScreen extends StatefulWidget {
  const NoticeBoardScreen({super.key});

  @override
  State<NoticeBoardScreen> createState() => _NoticeBoardScreenState();
}

class _NoticeBoardScreenState extends State<NoticeBoardScreen> {
  List<NoticeItemModel> _notices = [];
  bool _loading = true;
  String _selectedCategory = 'ALL';
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _loadNotices();
  }

  Future<void> _loadNotices() async {
    setState(() => _loading = true);
    try {
      final list = await ApiService.getNoticeBoard();
      if (mounted) setState(() => _notices = list);
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  void _showAddNoticeDialog() {
    final titleCtrl = TextEditingController();
    final contentCtrl = TextEditingController();
    final catCtrl = TextEditingController(text: 'GENERAL');
    bool isActive = true;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          backgroundColor: AppColors.bgSecondary,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Row(
            children: [
              Icon(Icons.campaign_outlined, color: AppColors.primary),
              SizedBox(width: 8),
              Text('Post Official Notice', style: TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold)),
            ],
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: titleCtrl,
                  style: const TextStyle(color: AppColors.textPrimary),
                  decoration: AppStyles.inputDecoration(
                    hintText: 'e.g. Inter-Department Football Trials',
                    labelText: 'Notice Title *',
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: catCtrl,
                  style: const TextStyle(color: AppColors.textPrimary),
                  decoration: AppStyles.inputDecoration(
                    hintText: 'e.g. TOURNAMENTS, GENERAL, SELECTION, URGENT',
                    labelText: 'Category',
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: contentCtrl,
                  maxLines: 4,
                  style: const TextStyle(color: AppColors.textPrimary),
                  decoration: AppStyles.inputDecoration(
                    hintText: 'Detailed announcement body content...',
                    labelText: 'Notice Content *',
                  ),
                ),
                const SizedBox(height: 12),
                SwitchListTile(
                  title: const Text('Mark as Active', style: TextStyle(color: AppColors.textPrimary, fontSize: 13)),
                  subtitle: const Text('Visible to students immediately', style: TextStyle(color: AppColors.textMuted, fontSize: 11)),
                  value: isActive,
                  activeColor: AppColors.primary,
                  onChanged: (val) => setDialogState(() => isActive = val),
                  contentPadding: EdgeInsets.zero,
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
              child: const Text('Publish Notice'),
              onPressed: () async {
                if (titleCtrl.text.trim().isEmpty) return;
                final toast = Provider.of<ToastProvider>(context, listen: false);
                try {
                  await ApiService.createNotice(NoticeItemModel(
                    title: titleCtrl.text.trim(),
                    content: contentCtrl.text.trim(),
                    category: catCtrl.text.trim().isNotEmpty ? catCtrl.text.trim().toUpperCase() : 'GENERAL',
                    active: isActive,
                  ));
                  toast.showToast('Official notice published successfully', 'success');
                  if (ctx.mounted) Navigator.pop(ctx);
                  _loadNotices();
                } catch (e) {
                  toast.showToast('Failed to publish notice: $e', 'error');
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showEditNoticeDialog(NoticeItemModel notice) {
    final titleCtrl = TextEditingController(text: notice.title);
    final contentCtrl = TextEditingController(text: notice.content);
    final catCtrl = TextEditingController(text: notice.category ?? 'GENERAL');
    bool isActive = notice.active ?? true;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          backgroundColor: AppColors.bgSecondary,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Row(
            children: [
              Icon(Icons.edit_note, color: AppColors.primary),
              SizedBox(width: 8),
              Text('Edit Notice', style: TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold)),
            ],
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: titleCtrl,
                  style: const TextStyle(color: AppColors.textPrimary),
                  decoration: AppStyles.inputDecoration(labelText: 'Notice Title *'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: catCtrl,
                  style: const TextStyle(color: AppColors.textPrimary),
                  decoration: AppStyles.inputDecoration(labelText: 'Category'),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: contentCtrl,
                  maxLines: 4,
                  style: const TextStyle(color: AppColors.textPrimary),
                  decoration: AppStyles.inputDecoration(labelText: 'Content *'),
                ),
                const SizedBox(height: 12),
                SwitchListTile(
                  title: const Text('Active Status', style: TextStyle(color: AppColors.textPrimary, fontSize: 13)),
                  subtitle: const Text('Toggle notice visibility', style: TextStyle(color: AppColors.textMuted, fontSize: 11)),
                  value: isActive,
                  activeColor: AppColors.primary,
                  onChanged: (val) => setDialogState(() => isActive = val),
                  contentPadding: EdgeInsets.zero,
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
                if (notice.noticeId == null) return;
                final toast = Provider.of<ToastProvider>(context, listen: false);
                try {
                  await ApiService.updateNotice(
                    notice.noticeId!,
                    NoticeItemModel(
                      noticeId: notice.noticeId,
                      title: titleCtrl.text.trim(),
                      content: contentCtrl.text.trim(),
                      category: catCtrl.text.trim().toUpperCase(),
                      publishDate: notice.publishDate,
                      active: isActive,
                    ),
                  );
                  toast.showToast('Notice updated successfully', 'success');
                  if (ctx.mounted) Navigator.pop(ctx);
                  _loadNotices();
                } catch (e) {
                  toast.showToast('Failed to update notice: $e', 'error');
                }
              },
            ),
          ],
        ),
      ),
    );
  }

  void _confirmDeleteNotice(NoticeItemModel notice) {
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
          'Are you sure you want to delete notice "${notice.title ?? 'Announcement'}"?\nThis cannot be undone.',
          style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
        ),
        actions: [
          TextButton(
            child: const Text('Cancel', style: TextStyle(color: AppColors.textMuted)),
            onPressed: () => Navigator.pop(ctx),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.error, foregroundColor: Colors.white),
            child: const Text('Delete'),
            onPressed: () async {
              Navigator.pop(ctx);
              if (notice.noticeId == null) return;
              final toast = Provider.of<ToastProvider>(context, listen: false);
              try {
                await ApiService.deleteNotice(notice.noticeId!);
                toast.showToast('Notice deleted from board', 'success');
                _loadNotices();
              } catch (e) {
                toast.showToast('Failed to delete notice: $e', 'error');
              }
            },
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final isAdmin = auth.isAdmin;

    // Filter by category and search
    final filteredNotices = _notices.where((n) {
      if (_selectedCategory != 'ALL' && (n.category ?? '').toUpperCase() != _selectedCategory) {
        return false;
      }
      if (_searchQuery.isNotEmpty) {
        final q = _searchQuery.toLowerCase();
        final matchTitle = (n.title ?? '').toLowerCase().contains(q);
        final matchContent = (n.content ?? '').toLowerCase().contains(q);
        final matchCat = (n.category ?? '').toLowerCase().contains(q);
        if (!matchTitle && !matchContent && !matchCat) return false;
      }
      // If student, only show active notices
      if (!isAdmin && n.active == false) return false;
      return true;
    }).toList();

    return MainLayout(
      currentRoute: '/notices',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header with Role Specific Controls
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Text(
                        'Notice Board',
                        style: TextStyle(color: AppColors.textPrimary, fontSize: 24, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(width: 10),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(
                          color: isAdmin ? AppColors.primaryGlow : AppColors.success.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(color: isAdmin ? AppColors.primary : AppColors.success),
                        ),
                        child: Text(
                          isAdmin ? 'Admin Console • Full Edit Access' : 'Student Bulletin • View Only',
                          style: TextStyle(
                            color: isAdmin ? AppColors.primary : AppColors.success,
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    isAdmin
                        ? 'Publish, edit, and manage department announcements visible to students'
                        : 'Official notices, tournament schedules, and circulars from Physical Education Dept',
                    style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                  ),
                ],
              ),
              // "Post Notice" is only shown for Administrator
              if (isAdmin)
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                  ),
                  onPressed: _showAddNoticeDialog,
                  icon: const Icon(Icons.add_alert, size: 18),
                  label: const Text('Post Notice'),
                ),
            ],
          ),
          const SizedBox(height: 16),

          // Search and Category Filters
          Row(
            children: [
              Expanded(
                child: TextField(
                  style: const TextStyle(color: AppColors.textPrimary),
                  decoration: AppStyles.inputDecoration(
                    hintText: 'Search notices by title, content or category...',
                    prefixIcon: const Icon(Icons.search, color: AppColors.textMuted),
                  ),
                  onChanged: (val) => setState(() => _searchQuery = val.trim()),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildCategoryChip('ALL', 'All Announcements'),
                const SizedBox(width: 8),
                _buildCategoryChip('GENERAL', 'General'),
                const SizedBox(width: 8),
                _buildCategoryChip('TOURNAMENTS', 'Tournaments'),
                const SizedBox(width: 8),
                _buildCategoryChip('SELECTION', 'Trials & Selection'),
                const SizedBox(width: 8),
                _buildCategoryChip('URGENT', 'Urgent Alerts'),
              ],
            ),
          ),
          const SizedBox(height: 16),

          Expanded(
            child: _loading
                ? const SpinnerWidget(message: 'Loading department announcements...')
                : filteredNotices.isEmpty
                    ? Center(
                        child: GlassCard(
                          padding: const EdgeInsets.all(32),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Text('📢', style: TextStyle(fontSize: 40)),
                              const SizedBox(height: 12),
                              const Text(
                                'No notices found on the board.',
                                style: TextStyle(color: AppColors.textMuted, fontSize: 15),
                              ),
                              if (isAdmin) ...[
                                const SizedBox(height: 12),
                                ElevatedButton.icon(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppColors.primary,
                                    foregroundColor: Colors.white,
                                  ),
                                  onPressed: _showAddNoticeDialog,
                                  icon: const Icon(Icons.add, size: 16),
                                  label: const Text('Post First Notice'),
                                ),
                              ],
                            ],
                          ),
                        ),
                      )
                    : ListView.builder(
                        itemCount: filteredNotices.length,
                        itemBuilder: (context, index) {
                          final n = filteredNotices[index];
                          final isInactive = n.active == false;

                          return Padding(
                            padding: const EdgeInsets.only(bottom: 16),
                            child: GlassCard(
                              padding: const EdgeInsets.all(20),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.all(10),
                                        decoration: BoxDecoration(
                                          color: AppColors.primaryGlow,
                                          borderRadius: BorderRadius.circular(10),
                                        ),
                                        child: const Text('📢', style: TextStyle(fontSize: 22)),
                                      ),
                                      const SizedBox(width: 14),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Row(
                                              children: [
                                                Expanded(
                                                  child: Text(
                                                    n.title ?? 'Department Notice',
                                                    style: const TextStyle(
                                                      color: AppColors.textPrimary,
                                                      fontSize: 18,
                                                      fontWeight: FontWeight.bold,
                                                    ),
                                                  ),
                                                ),
                                                Container(
                                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                                  decoration: BoxDecoration(
                                                    color: AppColors.primaryGlow,
                                                    borderRadius: BorderRadius.circular(6),
                                                    border: Border.all(color: AppColors.primary.withValues(alpha: 0.4)),
                                                  ),
                                                  child: Text(
                                                    n.category ?? 'ANNOUNCEMENT',
                                                    style: const TextStyle(
                                                      color: AppColors.primary,
                                                      fontWeight: FontWeight.bold,
                                                      fontSize: 11,
                                                    ),
                                                  ),
                                                ),
                                                if (isAdmin && isInactive) ...[
                                                  const SizedBox(width: 6),
                                                  Container(
                                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                                    decoration: BoxDecoration(
                                                      color: AppColors.error.withValues(alpha: 0.15),
                                                      borderRadius: BorderRadius.circular(6),
                                                    ),
                                                    child: const Text('INACTIVE',
                                                        style: TextStyle(color: AppColors.error, fontSize: 10, fontWeight: FontWeight.bold)),
                                                  ),
                                                ],
                                              ],
                                            ),
                                            const SizedBox(height: 4),
                                            Text(
                                              'Published: ${n.publishDate ?? 'Recent'} • Physical Education Department',
                                              style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 14),
                                  Text(
                                    n.content ?? '',
                                    style: const TextStyle(
                                      color: AppColors.textSecondary,
                                      fontSize: 14,
                                      height: 1.6,
                                    ),
                                  ),
                                  // Admin Action Buttons: Edit & Delete
                                  if (isAdmin) ...[
                                    const SizedBox(height: 14),
                                    const Divider(color: AppColors.glassBorder, height: 1),
                                    const SizedBox(height: 10),
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.end,
                                      children: [
                                        TextButton.icon(
                                          style: TextButton.styleFrom(foregroundColor: AppColors.primary),
                                          onPressed: () => _showEditNoticeDialog(n),
                                          icon: const Icon(Icons.edit_outlined, size: 16),
                                          label: const Text('Edit Notice', style: TextStyle(fontSize: 12)),
                                        ),
                                        const SizedBox(width: 8),
                                        TextButton.icon(
                                          style: TextButton.styleFrom(foregroundColor: AppColors.error),
                                          onPressed: () => _confirmDeleteNotice(n),
                                          icon: const Icon(Icons.delete_outline, size: 16),
                                          label: const Text('Delete Notice', style: TextStyle(fontSize: 12)),
                                        ),
                                      ],
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

  Widget _buildCategoryChip(String catKey, String label) {
    final isSelected = _selectedCategory == catKey;

    return InkWell(
      onTap: () => setState(() => _selectedCategory = catKey),
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primaryGlow : AppColors.cardSurface,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.glassBorder,
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? AppColors.primary : AppColors.textSecondary,
            fontSize: 12,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ),
    );
  }
}
