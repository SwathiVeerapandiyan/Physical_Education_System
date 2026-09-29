import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../constants/api_constants.dart';

class ApiClient {
  // Configurable base URL for testing with physical Android devices or custom hosts
  static String? customBaseUrl;

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
