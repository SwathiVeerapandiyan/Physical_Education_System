import 'package:flutter/material.dart';

/// App color palette inspired by Madras Christian College (MCC)
/// Featuring MCC Crimson / Maroon, Deep Navy, Trophy Gold, and clean light surfaces.
class AppColors {
  // Backgrounds - Clean, light collegiate aesthetic
  static const Color bgPrimary = Color(0xFFF6F8FB);    // Soft cool-light collegiate off-white
  static const Color bgSecondary = Color(0xFFFFFFFF);  // Pure crisp white for cards, sidebars, panels
  static const Color bgTertiary = Color(0xFFEFF3F8);   // Soft subtle fill for badges, chips, table headers

  // Primary: Madras Christian College Crimson / Maroon
  static const Color primary = Color(0xFF8B1527);       // MCC Crimson
  static const Color primaryHover = Color(0xFF6E0F1E);  // Deep Maroon
  static const Color primaryGlow = Color(0x1A8B1527);   // 10% opacity soft crimson tint

  // Secondary: MCC Deep Navy (from MCC header bar)
  static const Color secondary = Color(0xFF1B2A4A);     // Deep collegiate navy
  static const Color secondaryHover = Color(0xFF121D34);

  // Accent: MCC Trophy Gold (from honours and laurel awards)
  static const Color accent = Color(0xFFD97706);        // Warm collegiate gold / amber
  static const Color error = Color(0xFFDC2626);         // Clean crimson-red error
  static const Color success = Color(0xFF16A34A);       // Emerald green success

  // Typography - High-contrast readable typography for light theme
  static const Color textPrimary = Color(0xFF0F172A);   // Deep slate / charcoal (crystal sharp)
  static const Color textSecondary = Color(0xFF475569); // Slate secondary text
  static const Color textMuted = Color(0xFF94A3B8);     // Muted grey placeholder/hints

  // Borders & Dividers
  static const Color borderColor = Color(0xFFE2E8F0);   // Crisp light border
  static const Color borderFocus = Color(0xFF8B1527);   // MCC Crimson focus border

  // Surfaces & Glassmorphism
  static const Color glassBackground = Color(0xFFFFFFFF); // Clean white appbar/sidebar
  static const Color glassCardBg = Color(0xFFFFFFFF);     // Clean white card background
  static const Color inputFill = Color(0xFFF8FAFC);       // Soft light input fill
}
