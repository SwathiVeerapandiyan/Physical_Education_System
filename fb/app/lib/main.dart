import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

// Core & Theme
import 'core/theme/app_theme.dart';
import 'providers/auth_provider.dart';
import 'providers/toast_provider.dart';
import 'widgets/toast_overlay.dart';
import 'widgets/spinner_widget.dart';

// Screens
import 'screens/landing_screen.dart';
import 'screens/login_screen.dart';
import 'screens/register_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/user_management_screen.dart';
import 'screens/user_form_screen.dart';
import 'screens/family_details_screen.dart';
import 'screens/document_details_screen.dart';
import 'screens/sports_management_screen.dart';
import 'screens/tournaments_management_screen.dart';
import 'screens/teams_management_screen.dart';
import 'screens/matches_management_screen.dart';
import 'screens/gallery_management_screen.dart';
import 'screens/equipment_booking_screen.dart';
import 'screens/ground_booking_screen.dart';
import 'screens/notice_board_screen.dart';
import 'screens/feedback_management_screen.dart';
import 'screens/health_fitness_screen.dart';
import 'screens/emergency_contact_screen.dart';
import 'screens/live_score_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => ToastProvider()),
      ],
      child: const PePortalApp(),
    ),
  );
}

class PePortalApp extends StatelessWidget {
  const PePortalApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Physical Education & Sports Portal',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      builder: (context, child) {
        return ToastOverlay(child: child ?? const SizedBox.shrink());
      },
      initialRoute: '/',
      onGenerateRoute: (settings) {
        final routeName = settings.name;

        // Unauthenticated Public Routes
        if (routeName == '/') {
          return MaterialPageRoute(
            builder: (_) => const AuthGuardPublic(child: LandingScreen()),
            settings: settings,
          );
        } else if (routeName == '/login') {
          return MaterialPageRoute(
            builder: (_) => const AuthGuardPublic(child: LoginScreen()),
            settings: settings,
          );
        } else if (routeName == '/register') {
          return MaterialPageRoute(
            builder: (_) => const AuthGuardPublic(child: RegisterScreen()),
            settings: settings,
          );
        }

        // Protected Authenticated Routes
        Widget screen;
        switch (routeName) {
          case '/dashboard':
            screen = const DashboardScreen();
            break;
          case '/users':
            screen = const UserManagementScreen();
            break;
          case '/profile':
            screen = const UserFormScreen();
            break;
          case '/family':
            screen = const FamilyDetailsScreen();
            break;
          case '/documents':
            screen = const DocumentDetailsScreen();
            break;
          case '/sports':
            screen = const SportsManagementScreen();
            break;
          case '/tournaments':
            screen = const TournamentsManagementScreen();
            break;
          case '/teams':
            screen = const TeamsManagementScreen();
            break;
          case '/matches':
            screen = const MatchesManagementScreen();
            break;
          case '/gallery':
            screen = const GalleryManagementScreen();
            break;
          case '/equipment-bookings':
            screen = const EquipmentBookingScreen();
            break;
          case '/ground-bookings':
            screen = const GroundBookingScreen();
            break;
          case '/notices':
            screen = const NoticeBoardScreen();
            break;
          case '/feedback':
            screen = const FeedbackManagementScreen();
            break;
          case '/health-fitness':
            screen = const HealthFitnessScreen();
            break;
          case '/emergency-contacts':
            screen = const EmergencyContactScreen();
            break;
          case '/live-scores':
            screen = const LiveScoreScreen();
            break;
          default:
            screen = const AuthGuardPublic(child: LandingScreen());
        }

        return MaterialPageRoute(
          builder: (_) => AuthGuardProtected(child: screen),
          settings: settings,
        );
      },
    );
  }
}

class AuthGuardPublic extends StatelessWidget {
  final Widget child;

  const AuthGuardPublic({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    if (authProvider.loading) {
      return const SpinnerWidget(fullPage: true, message: 'Verifying session...');
    }
    if (authProvider.isAuthenticated) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        Navigator.of(context).pushReplacementNamed('/dashboard');
      });
      return const SpinnerWidget(fullPage: true, message: 'Redirecting to Dashboard...');
    }
    return child;
  }
}

class AuthGuardProtected extends StatelessWidget {
  final Widget child;

  const AuthGuardProtected({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    if (authProvider.loading) {
      return const SpinnerWidget(fullPage: true, message: 'Authenticating session...');
    }
    if (!authProvider.isAuthenticated) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        Navigator.of(context).pushReplacementNamed('/login');
      });
      return const SpinnerWidget(fullPage: true, message: 'Redirecting to Login...');
    }
    return child;
  }
}
