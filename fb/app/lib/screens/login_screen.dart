import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_styles.dart';
import '../core/network/api_client.dart';
import '../providers/auth_provider.dart';
import '../providers/toast_provider.dart';

class LoginScreen extends StatefulWidget {
  final bool initialAdminMode;
  const LoginScreen({super.key, this.initialAdminMode = false});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  late bool _isAdminPortal;

  @override
  void initState() {
    super.initState();
    _isAdminPortal = widget.initialAdminMode;
  }

  void _showServerConfigDialog() {
    final controller = TextEditingController(text: ApiClient.currentHostUrl);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.bgSecondary,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.dns_outlined, color: AppColors.primary),
            SizedBox(width: 8),
            Text('Backend Server URL', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Enter the backend URL (e.g. http://192.168.29.140:8080 or your production domain):',
              style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: controller,
              style: const TextStyle(fontSize: 14, color: AppColors.textPrimary),
              decoration: AppStyles.inputDecoration(
                hintText: 'http://192.168.29.140:8080',
                labelText: 'Server Host URL',
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () async {
              await ApiClient.setCustomBaseUrl(null);
              if (mounted) setState(() {});
              Navigator.pop(ctx);
            },
            child: const Text('Reset Default', style: TextStyle(color: AppColors.textMuted)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
            onPressed: () async {
              await ApiClient.setCustomBaseUrl(controller.text);
              if (mounted) setState(() {});
              Navigator.pop(ctx);
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  void _submitLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final toastProvider = Provider.of<ToastProvider>(context, listen: false);

    final result = await authProvider.login(
      _usernameController.text.trim(),
      _passwordController.text,
      requiredRole: _isAdminPortal ? 'ADMIN' : null,
    );

    if (mounted) {
      setState(() => _isLoading = false);
    }

    if (result['success'] == true) {
      toastProvider.showToast(
        _isAdminPortal ? 'Admin authenticated successfully!' : 'Login successful!',
        'success',
      );
      if (mounted) {
        if (authProvider.isAdmin) {
          Navigator.pushReplacementNamed(context, '/admin/dashboard');
        } else {
          Navigator.pushReplacementNamed(context, '/dashboard');
        }
      }
    } else {
      toastProvider.showToast(result['message'] ?? 'Login failed', 'error');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Container(
            constraints: const BoxConstraints(maxWidth: 440),
            padding: const EdgeInsets.all(32),
            decoration: AppStyles.glassBoxDecoration(borderRadius: 20),
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const SizedBox(width: 40),
                      Expanded(
                        child: Text(
                          _isAdminPortal ? '🛡️ Admin Portal' : '🏅 PE Student Portal',
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            color: AppColors.textPrimary,
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      SizedBox(
                        width: 40,
                        child: IconButton(
                          icon: const Icon(Icons.settings_outlined, size: 20, color: AppColors.textMuted),
                          tooltip: 'Backend Server Configuration',
                          onPressed: _showServerConfigDialog,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    _isAdminPortal
                        ? 'Administrative Command Access (Role: ADMIN)'
                        : 'Sign in to access student athletics portal',
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                  ),
                  const SizedBox(height: 24),

                  // Role Tab Selector
                  Container(
                    decoration: BoxDecoration(
                      color: AppColors.bgTertiary,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppColors.borderColor),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          child: InkWell(
                            onTap: () => setState(() => _isAdminPortal = false),
                            borderRadius: BorderRadius.circular(9),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 10),
                              decoration: BoxDecoration(
                                color: !_isAdminPortal ? AppColors.primary : Colors.transparent,
                                borderRadius: BorderRadius.circular(9),
                              ),
                              child: Text(
                                '🎓 Student Login',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  color: !_isAdminPortal ? Colors.white : AppColors.textSecondary,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 13,
                                ),
                              ),
                            ),
                          ),
                        ),
                        Expanded(
                          child: InkWell(
                            onTap: () => setState(() => _isAdminPortal = true),
                            borderRadius: BorderRadius.circular(9),
                            child: Container(
                              padding: const EdgeInsets.symmetric(vertical: 10),
                              decoration: BoxDecoration(
                                color: _isAdminPortal ? AppColors.primary : Colors.transparent,
                                borderRadius: BorderRadius.circular(9),
                              ),
                              child: Text(
                                '🛡️ Admin Login',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  color: _isAdminPortal ? Colors.white : AppColors.textSecondary,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 13,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Username / Email / Register No / Name
                  TextFormField(
                    controller: _usernameController,
                    style: const TextStyle(color: AppColors.textPrimary),
                    decoration: AppStyles.inputDecoration(
                      hintText: _isAdminPortal ? 'admin or admin@mcc.edu' : 'Email, Register No, or Name',
                      labelText: _isAdminPortal ? 'Admin Username / Email' : 'Email / Register No / Name',
                      prefixIcon: const Icon(Icons.person_outline, color: AppColors.textMuted),
                    ),
                    validator: (val) => val == null || val.trim().isEmpty
                        ? (_isAdminPortal ? 'Enter admin username or email' : 'Please enter your email, register no, or name')
                        : null,
                  ),
                  const SizedBox(height: 18),

                  // Password
                  TextFormField(
                    controller: _passwordController,
                    obscureText: true,
                    style: const TextStyle(color: AppColors.textPrimary),
                    decoration: AppStyles.inputDecoration(
                      hintText: 'Enter password',
                      labelText: 'Password',
                      prefixIcon: const Icon(Icons.lock_outline, color: AppColors.textMuted),
                    ),
                    validator: (val) => val == null || val.isEmpty ? 'Password is required' : null,
                  ),
                  const SizedBox(height: 26),

                  // Submit Button
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    onPressed: _isLoading ? null : _submitLogin,
                    child: _isLoading
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : Text(
                            _isAdminPortal ? 'Enter Admin Command Center' : 'Sign In to Student Portal',
                            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                          ),
                  ),
                  const SizedBox(height: 20),

                  if (!_isAdminPortal)
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Text("Don't have an account? ", style: TextStyle(color: AppColors.textSecondary, fontSize: 14)),
                        GestureDetector(
                          onTap: () => Navigator.pushReplacementNamed(context, '/register'),
                          child: const Text(
                            'Register as Student',
                            style: TextStyle(color: AppColors.secondary, fontWeight: FontWeight.bold, fontSize: 14),
                          ),
                        ),
                      ],
                    )
                  else
                    const Center(
                      child: Text(
                        'Secure administrator authentication required. Non-admin logins will be denied.',
                        textAlign: TextAlign.center,
                        style: TextStyle(color: AppColors.textMuted, fontSize: 12),
                      ),
                    ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
