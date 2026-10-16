import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_styles.dart';
import '../providers/api_service.dart';
import '../providers/toast_provider.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  final _nameController = TextEditingController();
  final _registerNoController = TextEditingController();
  final _emailController = TextEditingController();
  final _deptController = TextEditingController();
  final _mobileNoController = TextEditingController();
  String _role = 'STUDENT';

  bool _isLoading = false;

  void _submitRegister() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    final toastProvider = Provider.of<ToastProvider>(context, listen: false);

    try {
      final mobileText = _mobileNoController.text.trim();
      final mobileVal = int.tryParse(mobileText) ?? (DateTime.now().millisecondsSinceEpoch % 10000000000);

      await ApiService.register({
        'name': _nameController.text.trim(),
        'username': _usernameController.text.trim().isNotEmpty ? _usernameController.text.trim() : _nameController.text.trim(),
        'registerNo': _registerNoController.text.trim(),
        'email': _emailController.text.trim(),
        'dept': _deptController.text.trim().isNotEmpty ? _deptController.text.trim() : 'General',
        'role': _role,
        'mobileNo': mobileVal,
        'password': _passwordController.text,
      });


      if (mounted) {
        setState(() => _isLoading = false);
      }
      toastProvider.showToast('Registration successful! Please login.', 'success');
      if (mounted) {
        Navigator.pushReplacementNamed(context, '/login');
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
      }
      toastProvider.showToast('Registration failed: ${e.toString()}', 'error');
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
            constraints: const BoxConstraints(maxWidth: 460),
            padding: const EdgeInsets.all(36),
            decoration: AppStyles.glassBoxDecoration(borderRadius: 20),
            child: Form(
              key: _formKey,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text(
                    'Create Account',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: AppColors.textPrimary,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Join Physical Education & Sports Portal',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: AppColors.textSecondary, fontSize: 14),
                  ),
                  const SizedBox(height: 28),

                  TextFormField(
                    controller: _nameController,
                    style: const TextStyle(color: AppColors.textPrimary),
                    decoration: AppStyles.inputDecoration(hintText: 'Full Name', labelText: 'Name'),
                    validator: (val) => val == null || val.isEmpty ? 'Name is required' : null,
                  ),
                  const SizedBox(height: 14),

                  TextFormField(
                    controller: _usernameController,
                    style: const TextStyle(color: AppColors.textPrimary),
                    decoration: AppStyles.inputDecoration(hintText: 'Username', labelText: 'Username'),
                    validator: (val) => val == null || val.isEmpty ? 'Username is required' : null,
                  ),
                  const SizedBox(height: 14),

                  TextFormField(
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    style: const TextStyle(color: AppColors.textPrimary),
                    decoration: AppStyles.inputDecoration(hintText: 'Email Address', labelText: 'Email'),
                    validator: (val) => val == null || val.isEmpty ? 'Email is required' : null,
                  ),
                  const SizedBox(height: 14),

                  TextFormField(
                    controller: _registerNoController,
                    style: const TextStyle(color: AppColors.textPrimary),
                    decoration: AppStyles.inputDecoration(hintText: 'Register Number', labelText: 'Register No'),
                    validator: (val) => val == null || val.trim().isEmpty ? 'Register number is required' : null,
                  ),

                  const SizedBox(height: 14),

                  TextFormField(
                    controller: _deptController,
                    style: const TextStyle(color: AppColors.textPrimary),
                    decoration: AppStyles.inputDecoration(hintText: 'Department (e.g. MCA, CSE)', labelText: 'Department'),
                  ),
                  const SizedBox(height: 14),

                  TextFormField(
                    controller: _mobileNoController,
                    keyboardType: TextInputType.phone,
                    style: const TextStyle(color: AppColors.textPrimary),
                    decoration: AppStyles.inputDecoration(hintText: 'Mobile Number (e.g. 9876543210)', labelText: 'Mobile No'),
                    validator: (val) {
                      if (val == null || val.trim().isEmpty) {
                        return 'Mobile number is required';
                      }
                      if (int.tryParse(val.trim()) == null) {
                        return 'Enter a valid numeric mobile number';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 14),

                  DropdownButtonFormField<String>(
                    initialValue: _role,
                    dropdownColor: AppColors.bgSecondary,
                    style: const TextStyle(color: AppColors.textPrimary),
                    decoration: AppStyles.inputDecoration(hintText: 'Select Role', labelText: 'Role'),
                    items: const [
                      DropdownMenuItem(value: 'STUDENT', child: Text('Student Athlete')),
                      DropdownMenuItem(value: 'FACULTY', child: Text('Faculty Member')),
                      DropdownMenuItem(value: 'ADMIN', child: Text('Department Admin')),
                    ],
                    onChanged: (val) => setState(() => _role = val!),
                  ),
                  const SizedBox(height: 14),

                  TextFormField(
                    controller: _passwordController,
                    obscureText: true,
                    style: const TextStyle(color: AppColors.textPrimary),
                    decoration: AppStyles.inputDecoration(hintText: 'Password', labelText: 'Password'),
                    validator: (val) => val == null || val.isEmpty ? 'Password is required' : null,
                  ),
                  const SizedBox(height: 28),

                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    ),
                    onPressed: _isLoading ? null : _submitRegister,
                    child: _isLoading
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : const Text('Register Account', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  ),
                  const SizedBox(height: 20),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Text("Already have an account? ", style: TextStyle(color: AppColors.textSecondary, fontSize: 14)),
                      GestureDetector(
                        onTap: () => Navigator.pushReplacementNamed(context, '/login'),
                        child: const Text(
                          'Sign In',
                          style: TextStyle(color: AppColors.secondary, fontWeight: FontWeight.bold, fontSize: 14),
                        ),
                      ),
                    ],
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
