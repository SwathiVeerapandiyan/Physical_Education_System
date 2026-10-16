import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/api_constants.dart';

class ApiClient {
  static const String environment = String.fromEnvironment(
    'ENVIRONMENT',
    defaultValue: 'development',
  );

  static const String envApiUrl = String.fromEnvironment(
    'API_URL',
    defaultValue: String.fromEnvironment('BACKEND_URL', defaultValue: ''),
  );

  static const String _serverPrefKey = 'pe_custom_server_url';
  static String? customBaseUrl;

  static Future<void> init() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      customBaseUrl = prefs.getString(_serverPrefKey);
    } catch (_) {}
  }

  static Future<void> setCustomBaseUrl(String? url) async {
    customBaseUrl = url?.trim();
    try {
      final prefs = await SharedPreferences.getInstance();
      if (customBaseUrl != null && customBaseUrl!.isNotEmpty) {
        await prefs.setString(_serverPrefKey, customBaseUrl!);
      } else {
        await prefs.remove(_serverPrefKey);
      }
    } catch (_) {}
  }

  static String get defaultHostUrl {
    // 1. Explicit dart-define URL
    if (envApiUrl.trim().isNotEmpty) {
      return envApiUrl.trim();
    }

    // 2. Web browser
    if (kIsWeb) {
      if (Uri.base.host == 'localhost' || Uri.base.host == '127.0.0.1') {
        return 'http://${Uri.base.host}:8080';
      }
      return Uri.base.origin;
    }

    // 3. Android
    if (defaultTargetPlatform == TargetPlatform.android) {
      return 'http://192.168.29.140:8080';
    }

    // Default for iOS / desktop
    return 'http://localhost:8080';
  }

  static String get _hostUrl {
    if (customBaseUrl != null && customBaseUrl!.trim().isNotEmpty) {
      return customBaseUrl!.trim();
    }
    return defaultHostUrl;
  }

  static String get currentHostUrl => _hostUrl;

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

  static Future<dynamic> get(String path, {Map<String, dynamic>? queryParameters}) async {
    try {
      final uri = _buildUri(path, queryParameters);
      final response = await http.get(uri, headers: _headers);
      return _handleResponse(response);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException(message: e.toString(), statusCode: 500);
    }
  }

  static Future<dynamic> post(String path, {dynamic body}) async {
    try {
      final uri = _buildUri(path);
      final response = await http.post(
        uri,
        headers: _headers,
        body: body != null ? jsonEncode(body) : null,
      );
      return _handleResponse(response);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException(message: e.toString(), statusCode: 500);
    }
  }

  static Future<dynamic> put(String path, {dynamic body}) async {
    try {
      final uri = _buildUri(path);
      final response = await http.put(
        uri,
        headers: _headers,
        body: body != null ? jsonEncode(body) : null,
      );
      return _handleResponse(response);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException(message: e.toString(), statusCode: 500);
    }
  }

  static Future<dynamic> delete(String path) async {
    try {
      final uri = _buildUri(path);
      final response = await http.delete(uri, headers: _headers);
      return _handleResponse(response);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException(message: e.toString(), statusCode: 500);
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
