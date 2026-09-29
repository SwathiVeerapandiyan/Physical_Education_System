import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user.dart';
import '../core/network/api_client.dart';

class AuthProvider with ChangeNotifier {
  User? _user;
  bool _isAuthenticated = false;
  bool _loading = true;

  User? get user => _user;
  bool get isAuthenticated => _isAuthenticated;
  bool get loading => _loading;

  static const String _userKey = 'pe_user';

  AuthProvider() {
    _loadUserSession();
  }

  Future<void> _loadUserSession() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedUserJson = prefs.getString(_userKey);
      if (savedUserJson != null && savedUserJson.isNotEmpty) {
        final Map<String, dynamic> userMap = jsonDecode(savedUserJson);
        _user = User.fromJson(userMap);
        _isAuthenticated = true;
      }
    } catch (e) {
      debugPrint('Failed to load user session: $e');
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_userKey);
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  Future<Map<String, dynamic>> login(String username, String password) async {
    _loading = true;
    notifyListeners();

    try {
      final response = await ApiClient.post('/auth/login', body: {
        'username': username,
        'password': password,
      });

      final loginResp = LoginResponse.fromJson(response);
      if (loginResp.success && loginResp.userDetails != null) {
        _user = loginResp.userDetails;
        _isAuthenticated = true;

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(_userKey, jsonEncode(_user!.toJson()));

        _loading = false;
        notifyListeners();
        return {'success': true, 'message': loginResp.message.isNotEmpty ? loginResp.message : 'Login successful'};
      } else {
        _loading = false;
        notifyListeners();
        return {'success': false, 'message': loginResp.message.isNotEmpty ? loginResp.message : 'Login failed'};
      }
    } catch (e) {
      _loading = false;
      notifyListeners();
      return {
        'success': false,
        'message': e is ApiException ? e.message : 'Invalid credentials or server connection failed'
      };
    }
  }

  Future<void> logout() async {
    _user = null;
    _isAuthenticated = false;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_userKey);
    notifyListeners();
  }
}
