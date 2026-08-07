import 'package:flutter/material.dart';
import 'screens/login_screen.dart';

void main() {
  runApp(const PhysicalManagementApp());
}

class PhysicalManagementApp extends StatelessWidget {
  const PhysicalManagementApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Physical Education Management System',
      home: const LoginScreen(),
    );
  }
}