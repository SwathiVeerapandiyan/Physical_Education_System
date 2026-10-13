import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/toast_provider.dart';
import '../core/theme/app_colors.dart';

class ToastOverlay extends StatelessWidget {
  final Widget child;

  const ToastOverlay({super.key, required this.child});

  Color _getBgColor(String type) {
    switch (type) {
      case 'success':
        return AppColors.success;
      case 'error':
        return AppColors.error;
      case 'warning':
        return AppColors.accent;
      case 'info':
      default:
        return AppColors.primary;
    }
  }

  IconData _getIcon(String type) {
    switch (type) {
      case 'success':
        return Icons.check_circle_outline;
      case 'error':
        return Icons.error_outline;
      case 'warning':
        return Icons.warning_amber_outlined;
      case 'info':
      default:
        return Icons.info_outline;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        child,
        Consumer<ToastProvider>(
          builder: (context, toastProvider, _) {
            if (toastProvider.toasts.isEmpty) return const SizedBox.shrink();

            return Positioned(
              top: 24,
              right: 24,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                mainAxisSize: MainAxisSize.min,
                children: toastProvider.toasts.map((toast) {
                  return Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(
                      color: AppColors.bgSecondary,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: _getBgColor(toast.type), width: 1.5),
                      boxShadow: const [
                        BoxShadow(
                          color: Color(0x1A0F172A),
                          blurRadius: 12,
                          offset: Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(_getIcon(toast.type), color: _getBgColor(toast.type), size: 20),
                        const SizedBox(width: 10),
                        Text(
                          toast.message,
                          style: const TextStyle(
                            color: AppColors.textPrimary,
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(width: 12),
                        InkWell(
                          onTap: () => toastProvider.removeToast(toast.id),
                          child: const Icon(Icons.close, size: 16, color: AppColors.textMuted),
                        ),
                      ],
                    ),
                  );
                }).toList(),
              ),
            );
          },
        ),
      ],
    );
  }
}
