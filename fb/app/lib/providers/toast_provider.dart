import 'dart:async';
import 'package:flutter/material.dart';

class ToastMessage {
  final String id;
  final String message;
  final String type; // 'success', 'error', 'info', 'warning'

  ToastMessage({
    required this.id,
    required this.message,
    required this.type,
  });
}

class ToastProvider with ChangeNotifier {
  final List<ToastMessage> _toasts = [];

  List<ToastMessage> get toasts => List.unmodifiable(_toasts);

  void showToast(String message, [String type = 'info']) {
    final id = DateTime.now().millisecondsSinceEpoch.toString();
    final toast = ToastMessage(id: id, message: message, type: type);
    _toasts.add(toast);
    notifyListeners();

    Timer(const Duration(seconds: 4), () {
      removeToast(id);
    });
  }

  void removeToast(String id) {
    _toasts.removeWhere((t) => t.id == id);
    notifyListeners();
  }
}
