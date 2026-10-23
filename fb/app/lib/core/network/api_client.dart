import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/api_constants.dart';

class ApiClient {
  static const String _prefKeyBaseUrl = 'pe_custom_base_url';

  // Configurable base URL for testing with physical Android devices or custom hosts
  static String? customBaseUrl;

  /// Initializes ApiClient by loading stored custom Base URL from SharedPreferences
  static Future<void> init() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedUrl = prefs.getString(_prefKeyBaseUrl);
      if (savedUrl != null && savedUrl.trim().isNotEmpty) {
        customBaseUrl = savedUrl.trim();
        debugPrint('[ApiClient] Loaded custom Base URL from storage: $customBaseUrl');
      }
    } catch (e) {
      debugPrint('[ApiClient] Failed to initialize storage for Base URL: $e');
    }
  }

  /// Sets and persists a custom Base URL (or resets to default if null/empty)
  static Future<void> setCustomBaseUrl(String? url) async {
    final prefs = await SharedPreferences.getInstance();
    if (url == null || url.trim().isEmpty) {
      customBaseUrl = null;
      await prefs.remove(_prefKeyBaseUrl);
      debugPrint('[ApiClient] Reset to default Host URL');
    } else {
      String clean = url.trim();
      while (clean.endsWith('/')) {
        clean = clean.substring(0, clean.length - 1);
      }
      customBaseUrl = clean;
      await prefs.setString(_prefKeyBaseUrl, clean);
      debugPrint('[ApiClient] Updated and saved custom Host URL: $clean');
    }
  }

  /// Returns current host URL based on platform and custom settings
  static String get currentHost => _hostUrl;

  static String get _hostUrl {
    if (customBaseUrl != null && customBaseUrl!.trim().isNotEmpty) {
      return customBaseUrl!.trim();
    }

    if (kIsWeb) {
      // On Web: When running flutter dev server (e.g. localhost:53703),
      // forward requests to the Spring Boot backend on port 8080.
      if (Uri.base.host == 'localhost' || Uri.base.host == '127.0.0.1') {
        return 'http://${Uri.base.host}:8080';
      }
      return Uri.base.origin;
    }

    // On Android: the emulator accesses host localhost via 10.0.2.2
    if (defaultTargetPlatform == TargetPlatform.android) {
      return 'http://10.0.2.2:8080';
    }

    // Default for iOS simulator, Windows, macOS, Linux
    return 'http://localhost:8080';
  }

  /// Tests connectivity to a given host or current host
  static Future<Map<String, dynamic>> testConnection([String? testUrl]) async {
    final host = testUrl?.trim().isNotEmpty == true ? testUrl!.trim() : _hostUrl;
    final cleanHost = host.endsWith('/') ? host.substring(0, host.length - 1) : host;
    final testUri = Uri.parse('$cleanHost${ApiConstants.baseUrl}/dashboard/stats');

    debugPrint('[ApiClient] Testing connectivity to: $testUri');
    final stopwatch = Stopwatch()..start();

    try {
      final response = await http.get(testUri, headers: _headers).timeout(
        const Duration(seconds: 5),
      );
      stopwatch.stop();

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return {
          'success': true,
          'message': 'Connected successfully (${response.statusCode} OK)',
          'latencyMs': stopwatch.elapsedMilliseconds,
          'host': cleanHost,
        };
      } else {
        return {
          'success': false,
          'message': 'Server responded with error ${response.statusCode}',
          'latencyMs': stopwatch.elapsedMilliseconds,
          'host': cleanHost,
        };
      }
    } on SocketException catch (e) {
      stopwatch.stop();
      return {
        'success': false,
        'message': 'Cannot reach server at $cleanHost. Check your Wi-Fi or backend status.',
        'error': e.toString(),
        'host': cleanHost,
      };
    } on TimeoutException {
      stopwatch.stop();
      return {
        'success': false,
        'message': 'Connection timed out after 5 seconds at $cleanHost.',
        'host': cleanHost,
      };
    } catch (e) {
      stopwatch.stop();
      return {
        'success': false,
        'message': 'Connection test failed: ${e.toString()}',
        'host': cleanHost,
      };
    }
  }

  static Uri _buildUri(String path, [Map<String, dynamic>? queryParameters]) {
    final String cleanPath = path.startsWith('/') ? path : '/$path';
    final String fullPath = cleanPath.startsWith('/api')
        ? cleanPath
        : '${ApiConstants.baseUrl}$cleanPath';

    final Map<String, String>? stringParams = queryParameters?.map(
      (key, value) => MapEntry(key, value.toString()),
    );

    final uri = Uri.parse('$_hostUrl$fullPath').replace(queryParameters: stringParams);
    if (kDebugMode) {
      debugPrint('[ApiClient] Requesting: $uri');
    }
    return uri;
  }

  static Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

  static dynamic _handleResponse(http.Response response) {
    dynamic body;
    try {
      body = jsonDecode(response.body);
    } catch (_) {
      body = response.body;
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return body;
    } else {
      String message = 'An unexpected error occurred';
      if (body is Map && body.containsKey('message')) {
        message = body['message'].toString();
      } else if (body is String && body.isNotEmpty) {
        message = body;
      }
      throw ApiException(message: message, statusCode: response.statusCode);
    }
  }

  static String _formatNetworkError(dynamic error) {
    final errStr = error.toString().toLowerCase();
    if (errStr.contains('socketexception') || errStr.contains('connection refused') || errStr.contains('failed host lookup')) {
      return 'Cannot connect to backend server at $_hostUrl. Check if Spring Boot is running or configure Server IP.';
    }
    if (errStr.contains('timeout')) {
      return 'Request timed out connecting to $_hostUrl. Check your network connection.';
    }
    return error.toString();
  }

  static Future<dynamic> get(String path, {Map<String, dynamic>? queryParameters}) async {
    try {
      final uri = _buildUri(path, queryParameters);
      final response = await http.get(uri, headers: _headers).timeout(const Duration(seconds: 12));
      return _handleResponse(response);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException(message: _formatNetworkError(e), statusCode: 500);
    }
  }

  static Future<dynamic> post(String path, {dynamic body}) async {
    try {
      final uri = _buildUri(path);
      final response = await http.post(
        uri,
        headers: _headers,
        body: body != null ? jsonEncode(body) : null,
      ).timeout(const Duration(seconds: 12));
      return _handleResponse(response);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException(message: _formatNetworkError(e), statusCode: 500);
    }
  }

  static Future<dynamic> put(String path, {dynamic body}) async {
    try {
      final uri = _buildUri(path);
      final response = await http.put(
        uri,
        headers: _headers,
        body: body != null ? jsonEncode(body) : null,
      ).timeout(const Duration(seconds: 12));
      return _handleResponse(response);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException(message: _formatNetworkError(e), statusCode: 500);
    }
  }

  static Future<dynamic> delete(String path) async {
    try {
      final uri = _buildUri(path);
      final response = await http.delete(uri, headers: _headers).timeout(const Duration(seconds: 12));
      return _handleResponse(response);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException(message: _formatNetworkError(e), statusCode: 500);
    }
  }
}

class ApiException implements Exception {
  final String message;
  final int statusCode;

  ApiException({required this.message, required this.statusCode});

  @override
  String toString() => message;
}
