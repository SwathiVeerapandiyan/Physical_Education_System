import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/theme/app_colors.dart';
import '../models/dashboard_stats.dart';
import '../models/sport.dart';
import '../models/live_score.dart';
import '../models/match_fixture.dart';
import '../providers/auth_provider.dart';
import '../providers/api_service.dart';
import '../providers/toast_provider.dart';
import '../widgets/glass_card.dart';
import '../widgets/main_layout.dart';
import '../widgets/spinner_widget.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  DashboardStats _stats = DashboardStats();
  List<SportModel> _sports = [];
  List<LiveScoreModel> _liveScores = [];
  List<MatchFixtureModel> _matches = [];
  Map<int, String> _teamNames = {};
  bool _loading = true;

  bool _profileCreated = false;
  bool _familyAdded = false;
  bool _documentsUploaded = false;

  @override
  void initState() {
    super.initState();
    _fetchDashboardData();
  }

  Future<void> _fetchDashboardData() async {
    setState(() => _loading = true);

    try {
      final stats = await ApiService.getDashboardStats();
      if (mounted) setState(() => _stats = stats);
    } catch (_) {}

    try {
      final sports = await ApiService.getAllSports();
      if (mounted) setState(() => _sports = sports);
    } catch (_) {}

    try {
      final scores = await ApiService.getLiveScores();
      if (mounted) setState(() => _liveScores = scores);
    } catch (_) {}

    try {
      final matches = await ApiService.getAllMatches();
      if (mounted) setState(() => _matches = matches);
    } catch (_) {}

    try {
      final teams = await ApiService.getAllTeams();
      if (mounted) {
        setState(() {
          _teamNames = {
            for (final t in teams)
              if (t.teamId != null) t.teamId!: t.teamName,
          };
        });
      }
    } catch (_) {}

    try {
      final myForm = await ApiService.getMyProfile();
      if (myForm != null && myForm.id != null) {
        _profileCreated = true;
        final family = await ApiService.getMyFamily();
        if (family?.familyId != null) _familyAdded = true;
        final doc = await ApiService.getMyDocuments();
        if (doc?.documentId != null) _documentsUploaded = true;
      }
    } catch (_) {}

    if (mounted) setState(() => _loading = false);
  }

  int get _completionPercent {
    int count = 0;
    if (_profileCreated) count += 34;
    if (_familyAdded) count += 33;
    if (_documentsUploaded) count += 33;
    return count;
  }

  String _getTeamName(int? teamId) {
    if (teamId == null) return 'TBD';
    return _teamNames[teamId] ?? 'Team #$teamId';
  }

  @override
  Widget build(BuildContext context) {
    final user = Provider.of<AuthProvider>(context).user;

    if (_loading) {
      return const MainLayout(
        currentRoute: '/dashboard',
        child: SpinnerWidget(message: 'Loading your athletics dashboard...'),
      );
    }

    return MainLayout(
      currentRoute: '/dashboard',
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Welcome Banner
            GlassCard(
              padding: const EdgeInsets.all(24),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Welcome, ${user?.name ?? 'Student Athlete'}!',
                          style: const TextStyle(
                            color: AppColors.textPrimary,
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Madras Christian College • Student Physical Education Portal',
                          style: TextStyle(color: AppColors.textSecondary, fontSize: 13),
                        ),
                        const SizedBox(height: 14),
                        Wrap(
                          spacing: 10,
                          runSpacing: 8,
                          children: [
                            _InfoBadge(label: 'Reg No', value: user?.registerNo ?? 'N/A'),
                            _InfoBadge(label: 'Department', value: user?.dept ?? 'N/A'),
                            _InfoBadge(label: 'Role', value: user?.role ?? 'STUDENT'),
                            _InfoBadge(label: 'Email', value: user?.email ?? 'N/A'),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  const Text('🏃‍♂️', style: TextStyle(fontSize: 44)),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Profile Completion Progress Bar & Quick Links
            GlassCard(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'My Profile Completion',
                        style: TextStyle(color: AppColors.textPrimary, fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      Text('$_completionPercent%', style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 16)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(6),
                    child: LinearProgressIndicator(
                      value: _completionPercent / 100,
                      minHeight: 8,
                      backgroundColor: AppColors.bgTertiary,
                      valueColor: const AlwaysStoppedAnimation<Color>(AppColors.primary),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Wrap(
                    spacing: 12,
                    runSpacing: 8,
                    children: [
                      OutlinedButton.icon(
                        style: OutlinedButton.styleFrom(
                          foregroundColor: _profileCreated ? AppColors.success : AppColors.primary,
                          side: BorderSide(color: _profileCreated ? AppColors.success : AppColors.primary),
                        ),
                        onPressed: () => Navigator.pushReplacementNamed(context, '/profile'),
                        icon: Icon(_profileCreated ? Icons.check_circle : Icons.edit, size: 16),
                        label: Text(_profileCreated ? 'Personal Details (Done)' : 'Fill Personal Details'),
                      ),
                      OutlinedButton.icon(
                        style: OutlinedButton.styleFrom(
                          foregroundColor: _familyAdded ? AppColors.success : AppColors.secondary,
                          side: BorderSide(color: _familyAdded ? AppColors.success : AppColors.secondary),
                        ),
                        onPressed: () => Navigator.pushReplacementNamed(context, '/family'),
                        icon: Icon(_familyAdded ? Icons.check_circle : Icons.family_restroom, size: 16),
                        label: Text(_familyAdded ? 'Family Details (Done)' : 'Add Family Details'),
                      ),
                      OutlinedButton.icon(
                        style: OutlinedButton.styleFrom(
                          foregroundColor: _documentsUploaded ? AppColors.success : AppColors.accent,
                          side: BorderSide(color: _documentsUploaded ? AppColors.success : AppColors.accent),
                        ),
                        onPressed: () => Navigator.pushReplacementNamed(context, '/documents'),
                        icon: Icon(_documentsUploaded ? Icons.check_circle : Icons.upload_file, size: 16),
                        label: Text(_documentsUploaded ? 'Documents (Done)' : 'Upload Documents'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // ==========================================
            // 1. SPORTS SECTION (Directly on Dashboard)
            // ==========================================
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  children: [
                    Text('🏀 ', style: TextStyle(fontSize: 20)),
                    Text(
                      'Available Sports',
                      style: TextStyle(color: AppColors.textPrimary, fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                TextButton(
                  onPressed: () => Navigator.pushReplacementNamed(context, '/sports'),
                  child: const Text('View All Sports →', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600)),
                ),
              ],
            ),
            const SizedBox(height: 10),
            _sports.isEmpty
                ? GlassCard(
                    padding: const EdgeInsets.all(20),
                    child: const Center(
                      child: Text('No sports listed yet.', style: TextStyle(color: AppColors.textMuted)),
                    ),
                  )
                : LayoutBuilder(
                    builder: (context, constraints) {
                      return GridView.builder(
                        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: constraints.maxWidth > 900 ? 3 : (constraints.maxWidth > 600 ? 2 : 1),
                          crossAxisSpacing: 16,
                          mainAxisSpacing: 16,
                          childAspectRatio: constraints.maxWidth > 600 ? 1.4 : 1.7,
                        ),
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: _sports.length > 6 ? 6 : _sports.length,
                        itemBuilder: (context, index) {
                          final sport = _sports[index];
                          return GlassCard(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Expanded(
                                      child: Text(
                                        sport.sportName,
                                        style: const TextStyle(
                                          color: AppColors.textPrimary,
                                          fontSize: 16,
                                          fontWeight: FontWeight.bold,
                                        ),
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: AppColors.primaryGlow,
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        sport.category ?? 'Outdoor',
                                        style: const TextStyle(color: AppColors.primary, fontSize: 10, fontWeight: FontWeight.bold),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Expanded(
                                  child: Text(
                                    sport.description ?? 'Official department sport discipline.',
                                    maxLines: 3,
                                    overflow: TextOverflow.ellipsis,
                                    style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'Team size: ${sport.minPlayers ?? 1} - ${sport.maxPlayers ?? 11} athletes',
                                  style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                                ),
                              ],
                            ),
                          );
                        },
                      );
                    },
                  ),
            const SizedBox(height: 28),

            // ==========================================
            // 2. LIVE SCORES SECTION (Directly on Dashboard)
            // ==========================================
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  children: [
                    Text('⚡ ', style: TextStyle(fontSize: 20)),
                    Text(
                      'Live Scores',
                      style: TextStyle(color: AppColors.textPrimary, fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                TextButton(
                  onPressed: () => Navigator.pushReplacementNamed(context, '/live-scores'),
                  child: const Text('Live Scoreboard →', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600)),
                ),
              ],
            ),
            const SizedBox(height: 10),
            _liveScores.isEmpty
                ? GlassCard(
                    padding: const EdgeInsets.all(24),
                    child: const Center(
                      child: Column(
                        children: [
                          Icon(Icons.sports_score, size: 36, color: AppColors.textMuted),
                          SizedBox(height: 8),
                          Text('No live matches in progress right now.', style: TextStyle(color: AppColors.textSecondary, fontSize: 14)),
                          SizedBox(height: 4),
                          Text('Check the upcoming match fixtures below for scheduled tournament games.', style: TextStyle(color: AppColors.textMuted, fontSize: 12)),
                        ],
                      ),
                    ),
                  )
                : LayoutBuilder(
                    builder: (context, constraints) {
                      return GridView.builder(
                        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: constraints.maxWidth > 768 ? 2 : 1,
                          crossAxisSpacing: 16,
                          mainAxisSpacing: 16,
                          childAspectRatio: constraints.maxWidth > 768 ? 1.8 : 2.0,
                        ),
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: _liveScores.length > 4 ? 4 : _liveScores.length,
                        itemBuilder: (context, index) {
                          final score = _liveScores[index];
                          final isLive = score.status?.toUpperCase() == 'LIVE';
                          return GlassCard(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(
                                      score.sportType ?? 'Match Score',
                                      style: const TextStyle(color: AppColors.textMuted, fontSize: 11, fontWeight: FontWeight.bold),
                                    ),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                      decoration: BoxDecoration(
                                        color: isLive ? Colors.red.withOpacity(0.2) : AppColors.bgTertiary,
                                        borderRadius: BorderRadius.circular(4),
                                        border: Border.all(color: isLive ? Colors.red : AppColors.borderColor),
                                      ),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          if (isLive)
                                            Container(
                                              width: 6,
                                              height: 6,
                                              margin: const EdgeInsets.only(right: 4),
                                              decoration: const BoxDecoration(shape: BoxShape.circle, color: Colors.red),
                                            ),
                                          Text(
                                            score.status ?? 'IN_PROGRESS',
                                            style: TextStyle(
                                              color: isLive ? Colors.red : AppColors.textSecondary,
                                              fontWeight: FontWeight.bold,
                                              fontSize: 10,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                                const Spacer(),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                                  children: [
                                    Expanded(
                                      child: Column(
                                        children: [
                                          Text(
                                            score.teamA ?? 'Team A',
                                            textAlign: TextAlign.center,
                                            style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 15),
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            '${score.scoreA ?? 0}',
                                            style: const TextStyle(color: AppColors.primary, fontSize: 28, fontWeight: FontWeight.w900),
                                          ),
                                        ],
                                      ),
                                    ),
                                    const Padding(
                                      padding: EdgeInsets.symmetric(horizontal: 8),
                                      child: Text('VS', style: TextStyle(color: AppColors.textMuted, fontWeight: FontWeight.bold, fontSize: 12)),
                                    ),
                                    Expanded(
                                      child: Column(
                                        children: [
                                          Text(
                                            score.teamB ?? 'Team B',
                                            textAlign: TextAlign.center,
                                            style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 15),
                                            overflow: TextOverflow.ellipsis,
                                          ),
                                          const SizedBox(height: 4),
                                          Text(
                                            '${score.scoreB ?? 0}',
                                            style: const TextStyle(color: AppColors.secondary, fontSize: 28, fontWeight: FontWeight.w900),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                                const Spacer(),
                                if (score.currentSetHalf != null && score.currentSetHalf!.isNotEmpty)
                                  Center(
                                    child: Text(
                                      'Period / Set: ${score.currentSetHalf}',
                                      style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                                    ),
                                  ),
                              ],
                            ),
                          );
                        },
                      );
                    },
                  ),
            const SizedBox(height: 28),

            // ==========================================
            // 3. MATCH FIXTURES SECTION (Directly on Dashboard)
            // ==========================================
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  children: [
                    Text('⚽ ', style: TextStyle(fontSize: 20)),
                    Text(
                      'Upcoming Match Fixtures',
                      style: TextStyle(color: AppColors.textPrimary, fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                  ],
                ),
                TextButton(
                  onPressed: () => Navigator.pushReplacementNamed(context, '/matches'),
                  child: const Text('All Fixtures →', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.w600)),
                ),
              ],
            ),
            const SizedBox(height: 10),
            _matches.isEmpty
                ? GlassCard(
                    padding: const EdgeInsets.all(24),
                    child: const Center(
                      child: Text('No match fixtures scheduled yet.', style: TextStyle(color: AppColors.textMuted)),
                    ),
                  )
                : LayoutBuilder(
                    builder: (context, constraints) {
                      return GridView.builder(
                        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: constraints.maxWidth > 850 ? 3 : (constraints.maxWidth > 550 ? 2 : 1),
                          crossAxisSpacing: 16,
                          mainAxisSpacing: 16,
                          childAspectRatio: constraints.maxWidth > 550 ? 1.5 : 1.8,
                        ),
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: _matches.length > 6 ? 6 : _matches.length,
                        itemBuilder: (context, index) {
                          final match = _matches[index];
                          final team1 = (match.teamA != null && match.teamA!.isNotEmpty)
                              ? match.teamA!
                              : _getTeamName(match.teamOne ?? match.team1Id);
                          final team2 = (match.teamB != null && match.teamB!.isNotEmpty)
                              ? match.teamB!
                              : _getTeamName(match.teamTwo ?? match.team2Id);

                          return GlassCard(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                      decoration: BoxDecoration(
                                        color: AppColors.primaryGlow,
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      child: Text(
                                        match.status ?? 'SCHEDULED',
                                        style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 10),
                                      ),
                                    ),
                                    Text(
                                      match.matchDate ?? 'Date TBD',
                                      style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                Text(
                                  '$team1  vs  $team2',
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(color: AppColors.textPrimary, fontSize: 15, fontWeight: FontWeight.bold),
                                ),
                                if (match.score != null && match.score!.isNotEmpty) ...[
                                  const SizedBox(height: 4),
                                  Text(
                                    'Score: ${match.score}',
                                    style: const TextStyle(color: AppColors.accent, fontSize: 12, fontWeight: FontWeight.bold),
                                  ),
                                ],
                                const Spacer(),
                                Row(
                                  children: [
                                    const Icon(Icons.location_on_outlined, size: 14, color: AppColors.textMuted),
                                    const SizedBox(width: 4),
                                    Expanded(
                                      child: Text(
                                        match.venue ?? 'College Ground',
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: const TextStyle(color: AppColors.textSecondary, fontSize: 11),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          );
                        },
                      );
                    },
                  ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}

class _InfoBadge extends StatelessWidget {
  final String label;
  final String value;

  const _InfoBadge({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.bgTertiary,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: AppColors.borderColor),
      ),
      child: Text.rich(
        TextSpan(
          children: [
            TextSpan(text: '$label: ', style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
            TextSpan(text: value, style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.bold, fontSize: 11)),
          ],
        ),
      ),
    );
  }
}
