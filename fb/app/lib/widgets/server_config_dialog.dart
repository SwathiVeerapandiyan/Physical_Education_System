import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/network/api_client.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_styles.dart';
import '../providers/toast_provider.dart';

class ServerConfigDialog extends StatefulWidget {
  const ServerConfigDialog({super.key});

  static Future<void> show(BuildContext context) {
    return showDialog(
      context: context,
      barrierDismissible: true,
      builder: (ctx) => const ServerConfigDialog(),
    );
  }

  @override
  State<ServerConfigDialog> createState() => _ServerConfigDialogState();
}

class _ServerConfigDialogState extends State<ServerConfigDialog> {
  late final TextEditingController _urlController;
  bool _testing = false;
  Map<String, dynamic>? _testResult;

  static const String _emulatorUrl = 'http://10.0.2.2:8080';
  static const String _wifiHostUrl = 'http://192.168.137.136:8080';
  static const String _localhostUrl = 'http://localhost:8080';

  @override
  void initState() {
    super.initState();
    _urlController = TextEditingController(text: ApiClient.currentHost);
  }

  @override
  void dispose() {
    _urlController.dispose();
    super.dispose();
  }

  void _testCurrent() async {
    setState(() {
      _testing = true;
      _testResult = null;
    });

    final res = await ApiClient.testConnection(_urlController.text.trim());

    if (mounted) {
      setState(() {
        _testing = false;
        _testResult = res;
      });
    }
  }

  void _applyUrl() async {
    final text = _urlController.text.trim();
    await ApiClient.setCustomBaseUrl(text.isEmpty ? null : text);
    if (mounted) {
      Provider.of<ToastProvider>(context, listen: false).showToast(
        'Server host set to: ${ApiClient.currentHost}',
        'success',
      );
      Navigator.pop(context);
    }
  }

  void _resetDefault() async {
    await ApiClient.setCustomBaseUrl(null);
    _urlController.text = ApiClient.currentHost;
    setState(() => _testResult = null);
    if (mounted) {
      Provider.of<ToastProvider>(context, listen: false).showToast(
        'Reset to platform default: ${ApiClient.currentHost}',
        'info',
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: AppColors.bgSecondary,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 480),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppColors.primaryGlow,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.dns, color: AppColors.primary, size: 24),
                  ),
                  const SizedBox(width: 14),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Backend Server Settings',
                          style: TextStyle(
                            color: AppColors.textPrimary,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'Configure Spring Boot host URL & port',
                          style: TextStyle(color: AppColors.textMuted, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, color: AppColors.textMuted),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Server URL Input
              TextField(
                controller: _urlController,
                style: const TextStyle(color: AppColors.textPrimary, fontFamily: 'monospace'),
                decoration: AppStyles.inputDecoration(
                  hintText: 'e.g. http://10.0.2.2:8080 or http://192.168.1.x:8080',
                  labelText: 'Server Base URL',
                  prefixIcon: const Icon(Icons.link, color: AppColors.textMuted),
                ),
              ),
              const SizedBox(height: 16),

              // Presets
              const Text(
                'Quick Connection Presets:',
                style: TextStyle(color: AppColors.textSecondary, fontSize: 12, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  ActionChip(
                    avatar: const Text('🤖', style: TextStyle(fontSize: 13)),
                    label: const Text('Android Emulator (10.0.2.2:8080)'),
                    backgroundColor: AppColors.bgTertiary,
                    labelStyle: const TextStyle(color: AppColors.textPrimary, fontSize: 11),
                    onPressed: () {
                      _urlController.text = _emulatorUrl;
                      _testCurrent();
                    },
                  ),
                  ActionChip(
                    avatar: const Text('📱', style: TextStyle(fontSize: 13)),
                    label: const Text('Wi-Fi LAN (192.168.137.136:8080)'),
                    backgroundColor: AppColors.bgTertiary,
                    labelStyle: const TextStyle(color: AppColors.textPrimary, fontSize: 11),
                    onPressed: () {
                      _urlController.text = _wifiHostUrl;
                      _testCurrent();
                    },
                  ),
                  ActionChip(
                    avatar: const Text('💻', style: TextStyle(fontSize: 13)),
                    label: const Text('Localhost (localhost:8080)'),
                    backgroundColor: AppColors.bgTertiary,
                    labelStyle: const TextStyle(color: AppColors.textPrimary, fontSize: 11),
                    onPressed: () {
                      _urlController.text = _localhostUrl;
                      _testCurrent();
                    },
                  ),
                ],
              ),
              const SizedBox(height: 18),

              // Test Result Card
              if (_testing)
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.bgTertiary,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.primary),
                      ),
                      SizedBox(width: 12),
                      Text('Testing backend connection...', style: TextStyle(color: AppColors.textPrimary, fontSize: 13)),
                    ],
                  ),
                )
              else if (_testResult != null)
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: _testResult!['success'] == true
                        ? AppColors.success.withValues(alpha: 0.12)
                        : AppColors.error.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: _testResult!['success'] == true ? AppColors.success : AppColors.error,
                      width: 1,
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        _testResult!['success'] == true ? Icons.check_circle : Icons.error_outline,
                        color: _testResult!['success'] == true ? AppColors.success : AppColors.error,
                        size: 20,
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          _testResult!['message'] ?? '',
                          style: TextStyle(
                            color: _testResult!['success'] == true ? AppColors.success : AppColors.error,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                      if (_testResult!['latencyMs'] != null)
                        Text(
                          '${_testResult!['latencyMs']} ms',
                          style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                        ),
                    ],
                  ),
                ),
              const SizedBox(height: 22),

              // Actions
              Row(
                children: [
                  OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppColors.textSecondary,
                      side: const BorderSide(color: AppColors.borderColor),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    ),
                    onPressed: _testing ? null : _testCurrent,
                    icon: const Icon(Icons.network_check, size: 18),
                    label: const Text('Test Ping'),
                  ),
                  const SizedBox(width: 8),
                  TextButton(
                    onPressed: _resetDefault,
                    child: const Text('Reset', style: TextStyle(color: AppColors.textMuted, fontSize: 12)),
                  ),
                  const Spacer(),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    onPressed: _applyUrl,
                    child: const Text('Save & Apply', style: TextStyle(fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
