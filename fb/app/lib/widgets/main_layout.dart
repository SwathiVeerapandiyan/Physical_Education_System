import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/theme/app_colors.dart';
import '../core/theme/app_styles.dart';
import '../providers/auth_provider.dart';
import '../providers/toast_provider.dart';
import 'chatbot_widget.dart';
import 'server_config_dialog.dart';

class NavItemData {
  final String route;
  final String label;
  final String icon;

  const NavItemData({
    required this.route,
    required this.label,
    required this.icon,
  });
}

const List<NavItemData> navItems = [
  NavItemData(route: '/dashboard', label: 'Dashboard', icon: '📊'),
  NavItemData(route: '/users', label: 'User Directory', icon: '👥'),
  NavItemData(route: '/profile', label: 'User Form', icon: '📝'),
  NavItemData(route: '/family', label: 'Family Details', icon: '👨‍👩‍👧‍👦'),
  NavItemData(route: '/documents', label: 'Document Details', icon: '📁'),
  NavItemData(route: '/sports', label: 'Sports Directory', icon: '🏀'),
  NavItemData(route: '/tournaments', label: 'Tournaments', icon: '🏆'),
  NavItemData(route: '/teams', label: 'Teams & Squads', icon: '🛡️'),
  NavItemData(route: '/matches', label: 'Match Fixtures', icon: '⚽'),
  NavItemData(route: '/gallery', label: 'Gallery & Media', icon: '🖼️'),
  NavItemData(route: '/equipment-bookings', label: 'Equipment Bookings', icon: '🏀'),
  NavItemData(route: '/ground-bookings', label: 'Ground Bookings', icon: '🏟️'),
  NavItemData(route: '/notices', label: 'Notice Board', icon: '📢'),
  NavItemData(route: '/feedback', label: 'Feedback & Reviews', icon: '💬'),
  NavItemData(route: '/health-fitness', label: 'Health & Fitness', icon: '🩺'),
  NavItemData(route: '/emergency-contacts', label: 'Emergency Contacts', icon: '🚨'),
  NavItemData(route: '/live-scores', label: 'Live Scoreboard', icon: '⚡'),
];

class MainLayout extends StatelessWidget {
  final Widget child;
  final String currentRoute;

  const MainLayout({
    super.key,
    required this.child,
    required this.currentRoute,
  });

  String _getPageTitle() {
    final current = navItems.firstWhere(
      (item) => item.route == currentRoute,
      orElse: () => const NavItemData(route: '', label: 'Management System', icon: ''),
    );
    return current.label;
  }

  void _handleLogout(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final toastProvider = Provider.of<ToastProvider>(context, listen: false);

    authProvider.logout();
    toastProvider.showToast('Logged out successfully', 'success');
    Navigator.of(context).pushReplacementNamed('/login');
  }

  Widget _buildSidebarContent(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.user;

    return Container(
      width: 260,
      decoration: AppStyles.glassPanelDecoration(),
      child: Column(
        children: [
          // Logo Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppColors.primaryGlow,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Text('🏅', style: TextStyle(fontSize: 22)),
                ),
                const SizedBox(width: 12),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'PE Portal',
                        style: TextStyle(
                          color: AppColors.textPrimary,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        'Madras Christian College',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          color: AppColors.primary,
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1, color: AppColors.borderColor),

          // Nav Items
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 12),
              itemCount: navItems.length,
              itemBuilder: (context, index) {
                final item = navItems[index];
                final isActive = currentRoute == item.route;

                return Container(
                  margin: const EdgeInsets.only(bottom: 4),
                  decoration: BoxDecoration(
                    color: isActive ? AppColors.primary : Colors.transparent,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: ListTile(
                    dense: true,
                    leading: Text(item.icon, style: const TextStyle(fontSize: 18)),
                    title: Text(
                      item.label,
                      style: TextStyle(
                        color: isActive ? Colors.white : AppColors.textSecondary,
                        fontWeight: isActive ? FontWeight.w600 : FontWeight.w500,
                        fontSize: 14,
                      ),
                    ),
                    onTap: () {
                      if (!isActive) {
                        Navigator.of(context).pushReplacementNamed(item.route);
                      }
                    },
                  ),
                );
              },
            ),
          ),

          // User Profile Badge Footer
          const Divider(height: 1, color: AppColors.borderColor),
          Container(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                CircleAvatar(
                  backgroundColor: AppColors.primary,
                  radius: 18,
                  child: Text(
                    user?.name != null && user!.name!.isNotEmpty
                        ? user.name![0].toUpperCase()
                        : 'U',
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        user?.name ?? 'Guest User',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: AppColors.textPrimary,
                          fontWeight: FontWeight.w600,
                          fontSize: 13,
                        ),
                      ),
                      Text(
                        user?.dept ?? 'Department',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: AppColors.textMuted,
                          fontSize: 11,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final isDesktop = screenWidth >= 992;
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.user;

    final topHeader = Container(
      height: 70,
      padding: EdgeInsets.symmetric(horizontal: screenWidth < 600 ? 12 : 24),
      decoration: AppStyles.glassPanelDecoration(),
      child: Row(
        children: [
          if (!isDesktop)
            Builder(
              builder: (ctx) => IconButton(
                icon: const Icon(Icons.menu, color: AppColors.textPrimary),
                onPressed: () => Scaffold.of(ctx).openDrawer(),
              ),
            ),
          Flexible(
            child: Text(
              _getPageTitle(),
              overflow: TextOverflow.ellipsis,
              maxLines: 1,
              style: TextStyle(
                color: AppColors.textPrimary,
                fontSize: screenWidth < 600 ? 18 : 20,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const Spacer(),
          if (screenWidth >= 768) ...[
            Text(
              'Welcome, ${user?.name ?? 'User'}',
              style: const TextStyle(color: AppColors.textSecondary, fontSize: 14),
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(width: 16),
          ],
          IconButton(
            tooltip: 'Server Connection Settings',
            icon: const Icon(Icons.settings_ethernet, color: AppColors.textSecondary, size: 20),
            onPressed: () => ServerConfigDialog.show(context),
          ),
          const SizedBox(width: 8),
          if (screenWidth < 600)
            IconButton(
              tooltip: 'Logout',
              style: IconButton.styleFrom(
                backgroundColor: AppColors.error,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                padding: const EdgeInsets.all(10),
              ),
              icon: const Icon(Icons.logout, size: 18),
              onPressed: () => _handleLogout(context),
            )
          else
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.error,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              ),
              onPressed: () => _handleLogout(context),
              icon: const Icon(Icons.logout, size: 16),
              label: const Text('Logout', style: TextStyle(fontWeight: FontWeight.w600)),
            ),
        ],
      ),
    );

    return Scaffold(
      drawer: !isDesktop ? Drawer(backgroundColor: AppColors.bgSecondary, child: _buildSidebarContent(context)) : null,
      body: Stack(
        children: [
          Row(
            children: [
              if (isDesktop) _buildSidebarContent(context),
              Expanded(
                child: Column(
                  children: [
                    topHeader,
                    Expanded(
                      child: Container(
                        color: AppColors.bgPrimary,
                        padding: EdgeInsets.all(screenWidth < 600 ? 12 : 24),
                        child: child,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const ChatbotWidget(),
        ],
      ),
    );
  }
}
