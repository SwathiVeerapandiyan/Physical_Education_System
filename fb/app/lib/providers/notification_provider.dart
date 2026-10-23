import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../core/network/api_client.dart';
import '../models/registration_notification.dart';

class NotificationProvider with ChangeNotifier {
  List<RegistrationNotification> _notifications = [];
  int _unreadCount = 0;
  bool _isLoading = false;
  RegistrationNotification? _latestPopupNotification;
  
  // SSE connection state
  http.Client? _streamClient;
  StreamSubscription? _streamSubscription;
  Timer? _fallbackTimer;
  bool _isStreaming = false;

  List<RegistrationNotification> get notifications => List.unmodifiable(_notifications);
  int get unreadCount => _unreadCount;
  bool get isLoading => _isLoading;
  RegistrationNotification? get latestPopupNotification => _latestPopupNotification;

  void dismissLatestPopup() {
    _latestPopupNotification = null;
    notifyListeners();
  }

  void startListening() {
    stopListening();
    fetchNotifications();
    _connectSseStream();
    // Fallback polling every 10 seconds to ensure 100% sync
    _fallbackTimer = Timer.periodic(const Duration(seconds: 10), (_) {
      fetchNotifications(silent: true);
    });
  }

  void stopListening() {
    _streamSubscription?.cancel();
    _streamSubscription = null;
    _streamClient?.close();
    _streamClient = null;
    _fallbackTimer?.cancel();
    _fallbackTimer = null;
    _isStreaming = false;
  }

  Future<void> fetchNotifications({bool silent = false}) async {
    if (!silent) {
      _isLoading = true;
      notifyListeners();
    }

    try {
      final response = await ApiClient.get('/notifications');
      if (response is List) {
        final List<RegistrationNotification> fetched = response
            .map((item) => RegistrationNotification.fromJson(item as Map<String, dynamic>))
            .toList();

        // Check if there are brand-new notifications we haven't seen
        if (_notifications.isNotEmpty && fetched.isNotEmpty) {
          final existingIds = _notifications.map((n) => n.notificationId).toSet();
          for (final n in fetched) {
            if (n.notificationId != null && !existingIds.contains(n.notificationId) && !n.isRead) {
              _latestPopupNotification = n;
              break;
            }
          }
        }

        _notifications = fetched;
        _unreadCount = _notifications.where((n) => !n.isRead).length;
      }
    } catch (e) {
      debugPrint('[NotificationProvider] Error fetching notifications: $e');
    } finally {
      if (!silent) {
        _isLoading = false;
      }
      notifyListeners();
    }
  }

  void _connectSseStream() {
    try {
      _streamClient = http.Client();
      final uri = Uri.parse('${ApiClient.currentHostUrl}/api/notifications/stream');
      final request = http.Request('GET', uri);
      request.headers.addAll({
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
        if (ApiClient.authToken != null)
          'Authorization': 'Bearer ${ApiClient.authToken}',
      });

      _streamClient!.send(request).then((streamedResponse) {
        _isStreaming = true;
        _streamSubscription = streamedResponse.stream
            .transform(utf8.decoder)
            .transform(const LineSplitter())
            .listen(
          (line) {
            _handleSseLine(line);
          },
          onError: (err) {
            debugPrint('[NotificationProvider] SSE stream error: $err');
            _isStreaming = false;
          },
          onDone: () {
            debugPrint('[NotificationProvider] SSE stream closed');
            _isStreaming = false;
          },
        );
      }).catchError((err) {
        debugPrint('[NotificationProvider] SSE stream connection failed: $err');
        _isStreaming = false;
      });
    } catch (e) {
      debugPrint('[NotificationProvider] Failed to initiate SSE: $e');
    }
  }

  void _handleSseLine(String line) {
    if (line.startsWith('data:')) {
      final dataStr = line.substring(5).trim();
      if (dataStr.isEmpty || dataStr == 'connected') return;

      try {
        final decoded = jsonDecode(dataStr);
        if (decoded is Map<String, dynamic>) {
          final notification = RegistrationNotification.fromJson(decoded);
          
          // Insert at the beginning of the list
          _notifications.removeWhere((n) => n.notificationId == notification.notificationId);
          _notifications.insert(0, notification);
          _unreadCount++;
          _latestPopupNotification = notification;
          notifyListeners();
        }
      } catch (e) {
        debugPrint('[NotificationProvider] Error parsing SSE payload: $e');
      }
    }
  }

  Future<void> markAsRead(int notificationId) async {
    try {
      await ApiClient.post('/notifications/$notificationId/mark-read');
      final index = _notifications.indexWhere((n) => n.notificationId == notificationId);
      if (index != -1) {
        _notifications[index].isRead = true;
        _unreadCount = _notifications.where((n) => !n.isRead).length;
        notifyListeners();
      }
    } catch (e) {
      debugPrint('[NotificationProvider] Failed to mark notification read: $e');
    }
  }

  Future<void> markAllAsRead() async {
    try {
      await ApiClient.post('/notifications/mark-all-read');
      for (final n in _notifications) {
        n.isRead = true;
      }
      _unreadCount = 0;
      notifyListeners();
    } catch (e) {
      debugPrint('[NotificationProvider] Failed to mark all notifications read: $e');
    }
  }

  @override
  void dispose() {
    stopListening();
    super.dispose();
  }
}
