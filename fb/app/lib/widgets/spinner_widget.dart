import 'package:flutter/material.dart';
import '../core/theme/app_colors.dart';

class SpinnerWidget extends StatelessWidget {
  final String message;
  final bool fullPage;

  const SpinnerWidget({
    super.key,
    this.message = 'Loading...',
    this.fullPage = false,
  });

  @override
  Widget build(BuildContext context) {
    final body = Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        mainAxisSize: MainAxisSize.min,
        children: [
          const SizedBox(
            width: 48,
            height: 48,
            child: CircularProgressIndicator(
              strokeWidth: 3,
              valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
            ),
          ),
          if (message.isNotEmpty) ...[
            const SizedBox(height: 16),
            Text(
              message,
              style: const TextStyle(
                color: AppColors.textSecondary,
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ],
      ),
    );

    if (fullPage) {
      return Scaffold(
        backgroundColor: AppColors.bgPrimary,
        body: body,
      );
    }

    return body;
  }
}
