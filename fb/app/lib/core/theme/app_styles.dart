import 'package:flutter/material.dart';
import 'app_colors.dart';

class AppStyles {
  static BoxDecoration glassBoxDecoration({
    double borderRadius = 14.0,
    Color? border,
  }) {
    return BoxDecoration(
      color: AppColors.glassCardBg,
      borderRadius: BorderRadius.circular(borderRadius),
      border: Border.all(
        color: border ?? AppColors.borderColor,
        width: 1.0,
      ),
      boxShadow: const [
        BoxShadow(
          color: Colors.black38,
          blurRadius: 16,
          offset: Offset(0, 8),
        ),
      ],
    );
  }

  static BoxDecoration glassPanelDecoration({double borderRadius = 0}) {
    return BoxDecoration(
      color: AppColors.glassBackground,
      borderRadius: BorderRadius.circular(borderRadius),
      border: Border.all(
        color: AppColors.borderColor,
        width: 1.0,
      ),
    );
  }

  static InputDecoration inputDecoration({
    required String hintText,
    String? labelText,
    Widget? prefixIcon,
    Widget? suffixIcon,
  }) {
    return InputDecoration(
      hintText: hintText,
      labelText: labelText,
      prefixIcon: prefixIcon,
      suffixIcon: suffixIcon,
      filled: true,
      fillColor: const Color(0x990F172A),
      hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 14),
      labelStyle: const TextStyle(color: AppColors.textSecondary, fontSize: 14),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: AppColors.borderColor),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: AppColors.borderColor),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: AppColors.error),
      ),
    );
  }
}
