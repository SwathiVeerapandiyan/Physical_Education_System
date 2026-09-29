import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_styles.dart';
import '../models/gallery_item.dart';
import '../providers/api_service.dart';
import '../providers/toast_provider.dart';
import '../widgets/glass_card.dart';
import '../widgets/main_layout.dart';
import '../widgets/spinner_widget.dart';

class GalleryManagementScreen extends StatefulWidget {
  const GalleryManagementScreen({super.key});

  @override
  State<GalleryManagementScreen> createState() => _GalleryManagementScreenState();
}

class _GalleryManagementScreenState extends State<GalleryManagementScreen> {
  List<GalleryItemModel> _items = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadGallery();
  }

  Future<void> _loadGallery() async {
    setState(() => _loading = true);
    try {
      final list = await ApiService.getGallery();
      if (mounted) setState(() => _items = list);
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  void _showAddDialog() {
    final eventCtrl = TextEditingController();
    final urlCtrl = TextEditingController();
    final captionCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Add Media Item', style: TextStyle(color: AppColors.textPrimary)),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: eventCtrl,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(hintText: 'Event Name (e.g. Annual Sports Meet)', labelText: 'Event Name'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: urlCtrl,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(hintText: 'Image / Video URL', labelText: 'Media URL'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: captionCtrl,
                style: const TextStyle(color: AppColors.textPrimary),
                decoration: AppStyles.inputDecoration(hintText: 'Caption / Photo Title', labelText: 'Caption'),
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
            child: const Text('Add'),
            onPressed: () async {
              if (urlCtrl.text.isEmpty) return;
              final toast = Provider.of<ToastProvider>(context, listen: false);
              try {
                await ApiService.createGalleryItem(GalleryItemModel(
                  eventName: eventCtrl.text.trim(),
                  mediaUrl: urlCtrl.text.trim(),
                  caption: captionCtrl.text.trim(),
                  mediaType: 'IMAGE',
                  active: true,
                ));
                toast.showToast('Media added to gallery', 'success');
                Navigator.pop(ctx);
                _loadGallery();
              } catch (_) {
                toast.showToast('Failed to add media', 'error');
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
      currentRoute: '/gallery',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Gallery & Media',
                style: TextStyle(color: AppColors.textPrimary, fontSize: 24, fontWeight: FontWeight.bold),
              ),
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
                onPressed: _showAddDialog,
                icon: const Icon(Icons.add_photo_alternate, size: 18),
                label: const Text('Add Media'),
              ),
            ],
          ),
          const SizedBox(height: 20),

          Expanded(
            child: _loading
                ? const SpinnerWidget(message: 'Loading media gallery...')
                : _items.isEmpty
                    ? const Center(child: Text('No gallery images uploaded yet', style: TextStyle(color: AppColors.textMuted)))
                    : GridView.builder(
                        gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                          maxCrossAxisExtent: 280,
                          crossAxisSpacing: 16,
                          mainAxisSpacing: 16,
                          childAspectRatio: 1.1,
                        ),
                        itemCount: _items.length,
                        itemBuilder: (context, index) {
                          final item = _items[index];
                          return GlassCard(
                            padding: const EdgeInsets.all(12),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Expanded(
                                  child: Container(
                                    width: double.infinity,
                                    decoration: BoxDecoration(
                                      color: AppColors.bgTertiary,
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Center(
                                      child: item.mediaUrl != null && item.mediaUrl!.startsWith('http')
                                          ? Image.network(item.mediaUrl!, fit: BoxFit.cover, errorBuilder: (_, __, ___) => const Icon(Icons.image, size: 40, color: AppColors.textMuted))
                                          : const Icon(Icons.photo_library, size: 40, color: AppColors.primary),
                                    ),
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  item.eventName ?? 'Event Photo',
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 14),
                                ),
                                if (item.caption != null)
                                  Text(
                                    item.caption!,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
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
