import '../core/network/api_client.dart';
import '../models/user.dart';
import '../models/dashboard_stats.dart';
import '../models/user_form.dart';
import '../models/family_details.dart';
import '../models/document_details.dart';
import '../models/sport.dart';
import '../models/tournament.dart';
import '../models/team.dart';
import '../models/team_member.dart';
import '../models/match_fixture.dart';
import '../models/gallery_item.dart';
import '../models/equipment_booking.dart';
import '../models/ground_booking.dart';
import '../models/notice_item.dart';
import '../models/feedback_item.dart';
import '../models/health_fitness.dart';
import '../models/emergency_contact.dart';
import '../models/live_score.dart';
import '../models/tournament_registration.dart';

class ApiService {
  // Auth
  static Future<User> register(Map<String, dynamic> userData) async {
    final res = await ApiClient.post('/auth/register', body: userData);
    return User.fromJson(res);
  }

  static Future<List<User>> getAllUsers() async {
    final res = await ApiClient.get('/auth/users');
    return (res as List).map((e) => User.fromJson(e)).toList();
  }

  // Dashboard
  static Future<DashboardStats> getDashboardStats() async {
    final res = await ApiClient.get('/dashboard/stats');
    return DashboardStats.fromJson(res);
  }

  // User Forms
  static Future<List<UserFormModel>> getAllUserForms() async {
    final res = await ApiClient.get('/users-form');
    return (res as List).map((e) => UserFormModel.fromJson(e)).toList();
  }

  static Future<UserFormModel> getUserFormById(int id) async {
    final res = await ApiClient.get('/users-form/$id');
    return UserFormModel.fromJson(res);
  }

  static Future<UserFormModel> createUserForm(UserFormModel form) async {
    final res = await ApiClient.post('/users-form', body: form.toJson());
    return UserFormModel.fromJson(res);
  }

  static Future<UserFormModel> updateUserForm(int id, UserFormModel form) async {
    final res = await ApiClient.put('/users-form/$id', body: form.toJson());
    return UserFormModel.fromJson(res);
  }

  static Future<void> deleteUserForm(int id) async {
    await ApiClient.delete('/users-form/$id');
  }

  // Family Details
  static Future<FamilyDetailsModel?> getFamilyByCandidateId(int candidateId) async {
    try {
      final res = await ApiClient.get('/family-details/candidate/$candidateId');
      if (res == null) return null;
      return FamilyDetailsModel.fromJson(res);
    } catch (_) {
      return null;
    }
  }

  static Future<FamilyDetailsModel> createFamilyDetails(FamilyDetailsModel family) async {
    final res = await ApiClient.post('/family-details', body: family.toJson());
    return FamilyDetailsModel.fromJson(res);
  }

  static Future<FamilyDetailsModel> updateFamilyDetails(int id, FamilyDetailsModel family) async {
    final res = await ApiClient.put('/family-details/$id', body: family.toJson());
    return FamilyDetailsModel.fromJson(res);
  }

  static Future<void> deleteFamilyDetails(int id) async {
    await ApiClient.delete('/family-details/$id');
  }

  // Document Details
  static Future<DocumentDetailsModel?> getDocumentByCandidateId(int candidateId) async {
    try {
      final res = await ApiClient.get('/document-details/candidate/$candidateId');
      if (res == null) return null;
      return DocumentDetailsModel.fromJson(res);
    } catch (_) {
      return null;
    }
  }

  static Future<DocumentDetailsModel> createDocumentDetails(DocumentDetailsModel doc) async {
    final res = await ApiClient.post('/document-details', body: doc.toJson());
    return DocumentDetailsModel.fromJson(res);
  }

  static Future<DocumentDetailsModel> updateDocumentDetails(int id, DocumentDetailsModel doc) async {
    final res = await ApiClient.put('/document-details/$id', body: doc.toJson());
    return DocumentDetailsModel.fromJson(res);
  }

  static Future<void> deleteDocumentDetails(int id) async {
    await ApiClient.delete('/document-details/$id');
  }

  // Sports
  static Future<List<SportModel>> getAllSports() async {
    final res = await ApiClient.get('/sports');
    return (res as List).map((e) => SportModel.fromJson(e)).toList();
  }

  static Future<SportModel> createSport(SportModel sport) async {
    final res = await ApiClient.post('/sports', body: sport.toJson());
    return SportModel.fromJson(res);
  }

  static Future<SportModel> updateSport(int id, SportModel sport) async {
    final res = await ApiClient.put('/sports/$id', body: sport.toJson());
    return SportModel.fromJson(res);
  }

  static Future<void> deleteSport(int id) async {
    await ApiClient.delete('/sports/$id');
  }

  // Tournaments
  static Future<List<TournamentModel>> getAllTournaments({String? status}) async {
    final res = await ApiClient.get('/tournaments', queryParameters: status != null ? {'status': status} : null);
    return (res as List).map((e) => TournamentModel.fromJson(e)).toList();
  }

  static Future<TournamentModel> createTournament(TournamentModel t) async {
    final res = await ApiClient.post('/tournaments', body: t.toJson());
    return TournamentModel.fromJson(res);
  }

  static Future<TournamentModel> updateTournament(int id, TournamentModel t) async {
    final res = await ApiClient.put('/tournaments/$id', body: t.toJson());
    return TournamentModel.fromJson(res);
  }

  static Future<void> deleteTournament(int id) async {
    await ApiClient.delete('/tournaments/$id');
  }

  // Tournament Registrations
  static Future<List<TournamentRegistrationModel>> getTournamentRegistrationsByTournamentId(int tournamentId) async {
    final res = await ApiClient.get('/tournament-registrations/tournament/$tournamentId');
    return (res as List).map((e) => TournamentRegistrationModel.fromJson(e)).toList();
  }

  static Future<List<TournamentRegistrationModel>> getTournamentRegistrationsByTeamId(int teamId) async {
    final res = await ApiClient.get('/tournament-registrations/team/$teamId');
    return (res as List).map((e) => TournamentRegistrationModel.fromJson(e)).toList();
  }

  static Future<TournamentRegistrationModel> getTournamentRegistrationById(int id) async {
    final res = await ApiClient.get('/tournament-registrations/$id');
    return TournamentRegistrationModel.fromJson(res);
  }

  static Future<TournamentRegistrationModel> createTournamentRegistration(TournamentRegistrationModel reg) async {
    final res = await ApiClient.post('/tournament-registrations', body: reg.toJson());
    return TournamentRegistrationModel.fromJson(res);
  }

  static Future<TournamentRegistrationModel> updateTournamentRegistration(int id, TournamentRegistrationModel reg) async {
    final res = await ApiClient.put('/tournament-registrations/$id', body: reg.toJson());
    return TournamentRegistrationModel.fromJson(res);
  }

  static Future<void> deleteTournamentRegistration(int id) async {
    await ApiClient.delete('/tournament-registrations/$id');
  }

  // Teams
  static Future<List<TeamModel>> getAllTeams({int? sportId}) async {
    final res = await ApiClient.get('/teams', queryParameters: sportId != null ? {'sportId': sportId} : null);
    return (res as List).map((e) => TeamModel.fromJson(e)).toList();
  }

  static Future<TeamModel> createTeam(TeamModel team) async {
    final res = await ApiClient.post('/teams', body: team.toJson());
    return TeamModel.fromJson(res);
  }

  static Future<TeamModel> updateTeam(int id, TeamModel team) async {
    final res = await ApiClient.put('/teams/$id', body: team.toJson());
    return TeamModel.fromJson(res);
  }

  static Future<void> deleteTeam(int id) async {
    await ApiClient.delete('/teams/$id');
  }

  // Team Members
  static Future<List<TeamMemberModel>> getTeamMembersByTeamId(int teamId) async {
    final res = await ApiClient.get('/team-members/team/$teamId');
    return (res as List).map((e) => TeamMemberModel.fromJson(e)).toList();
  }

  static Future<TeamMemberModel> createTeamMember(TeamMemberModel member) async {
    final res = await ApiClient.post('/team-members', body: member.toJson());
    return TeamMemberModel.fromJson(res);
  }

  static Future<List<TeamMemberModel>> getTeamMembersByStudentId(int studentId) async {
    final res = await ApiClient.get('/team-members/student/$studentId');
    return (res as List).map((e) => TeamMemberModel.fromJson(e)).toList();
  }

  static Future<void> deleteTeamMember(int id) async {
    await ApiClient.delete('/team-members/$id');
  }

  // Matches
  static Future<List<MatchFixtureModel>> getAllMatches({int? tournamentId}) async {
    final res = await ApiClient.get('/matches', queryParameters: tournamentId != null ? {'tournamentId': tournamentId} : null);
    return (res as List).map((e) => MatchFixtureModel.fromJson(e)).toList();
  }

  static Future<MatchFixtureModel> createMatch(MatchFixtureModel match) async {
    final res = await ApiClient.post('/matches', body: match.toJson());
    return MatchFixtureModel.fromJson(res);
  }

  static Future<MatchFixtureModel> updateMatch(int id, MatchFixtureModel match) async {
    final res = await ApiClient.put('/matches/$id', body: match.toJson());
    return MatchFixtureModel.fromJson(res);
  }

  static Future<void> deleteMatch(int id) async {
    await ApiClient.delete('/matches/$id');
  }

  // Gallery
  static Future<List<GalleryItemModel>> getGallery({String? eventName, bool? activeOnly}) async {
    final params = <String, dynamic>{};
    if (eventName != null) params['eventName'] = eventName;
    if (activeOnly != null) params['activeOnly'] = activeOnly;

    final res = await ApiClient.get('/gallery', queryParameters: params.isNotEmpty ? params : null);
    return (res as List).map((e) => GalleryItemModel.fromJson(e)).toList();
  }

  static Future<GalleryItemModel> createGalleryItem(GalleryItemModel item) async {
    final res = await ApiClient.post('/gallery', body: item.toJson());
    return GalleryItemModel.fromJson(res);
  }

  static Future<GalleryItemModel> updateGalleryItem(int id, GalleryItemModel item) async {
    final res = await ApiClient.put('/gallery/$id', body: item.toJson());
    return GalleryItemModel.fromJson(res);
  }

  static Future<void> deleteGalleryItem(int id) async {
    await ApiClient.delete('/gallery/$id');
  }

  // Equipment Bookings
  static Future<List<EquipmentBookingModel>> getEquipmentBookings({int? userId, String? status}) async {
    final params = <String, dynamic>{};
    if (userId != null) params['userId'] = userId;
    if (status != null) params['status'] = status;

    final res = await ApiClient.get('/equipment-bookings', queryParameters: params.isNotEmpty ? params : null);
    return (res as List).map((e) => EquipmentBookingModel.fromJson(e)).toList();
  }

  static Future<EquipmentBookingModel> createEquipmentBooking(EquipmentBookingModel booking) async {
    final res = await ApiClient.post('/equipment-bookings', body: booking.toJson());
    return EquipmentBookingModel.fromJson(res);
  }

  static Future<EquipmentBookingModel> updateEquipmentBooking(int id, EquipmentBookingModel booking) async {
    final res = await ApiClient.put('/equipment-bookings/$id', body: booking.toJson());
    return EquipmentBookingModel.fromJson(res);
  }

  static Future<void> deleteEquipmentBooking(int id) async {
    await ApiClient.delete('/equipment-bookings/$id');
  }

  // Ground Bookings
  static Future<List<GroundBookingModel>> getGroundBookings({int? userId, String? status}) async {
    final params = <String, dynamic>{};
    if (userId != null) params['userId'] = userId;
    if (status != null) params['status'] = status;

    final res = await ApiClient.get('/ground-bookings', queryParameters: params.isNotEmpty ? params : null);
    return (res as List).map((e) => GroundBookingModel.fromJson(e)).toList();
  }

  static Future<GroundBookingModel> createGroundBooking(GroundBookingModel booking) async {
    final res = await ApiClient.post('/ground-bookings', body: booking.toJson());
    return GroundBookingModel.fromJson(res);
  }

  static Future<GroundBookingModel> updateGroundBooking(int id, GroundBookingModel booking) async {
    final res = await ApiClient.put('/ground-bookings/$id', body: booking.toJson());
    return GroundBookingModel.fromJson(res);
  }

  static Future<void> deleteGroundBooking(int id) async {
    await ApiClient.delete('/ground-bookings/$id');
  }

  // Notice Board
  static Future<List<NoticeItemModel>> getNoticeBoard({String? category, bool? activeOnly}) async {
    final params = <String, dynamic>{};
    if (category != null) params['category'] = category;
    if (activeOnly != null) params['activeOnly'] = activeOnly;

    final res = await ApiClient.get('/notice-board', queryParameters: params.isNotEmpty ? params : null);
    return (res as List).map((e) => NoticeItemModel.fromJson(e)).toList();
  }

  static Future<NoticeItemModel> createNotice(NoticeItemModel notice) async {
    final res = await ApiClient.post('/notice-board', body: notice.toJson());
    return NoticeItemModel.fromJson(res);
  }

  static Future<NoticeItemModel> updateNotice(int id, NoticeItemModel notice) async {
    final res = await ApiClient.put('/notice-board/$id', body: notice.toJson());
    return NoticeItemModel.fromJson(res);
  }

  static Future<void> deleteNotice(int id) async {
    await ApiClient.delete('/notice-board/$id');
  }

  // Feedback
  static Future<List<FeedbackItemModel>> getFeedback({String? status, int? userId}) async {
    final params = <String, dynamic>{};
    if (status != null) params['status'] = status;
    if (userId != null) params['userId'] = userId;

    final res = await ApiClient.get('/feedback', queryParameters: params.isNotEmpty ? params : null);
    return (res as List).map((e) => FeedbackItemModel.fromJson(e)).toList();
  }

  static Future<FeedbackItemModel> createFeedback(FeedbackItemModel fb) async {
    final res = await ApiClient.post('/feedback', body: fb.toJson());
    return FeedbackItemModel.fromJson(res);
  }

  static Future<FeedbackItemModel> updateFeedback(int id, FeedbackItemModel fb) async {
    final res = await ApiClient.put('/feedback/$id', body: fb.toJson());
    return FeedbackItemModel.fromJson(res);
  }

  static Future<void> deleteFeedback(int id) async {
    await ApiClient.delete('/feedback/$id');
  }

  // Health Fitness
  static Future<List<HealthFitnessModel>> getHealthFitness({int? userId}) async {
    final res = await ApiClient.get('/health-fitness', queryParameters: userId != null ? {'userId': userId} : null);
    return (res as List).map((e) => HealthFitnessModel.fromJson(e)).toList();
  }

  static Future<HealthFitnessModel?> getHealthFitnessByUserId(int userId) async {
    try {
      final res = await ApiClient.get('/health-fitness/user/$userId');
      if (res == null) return null;
      return HealthFitnessModel.fromJson(res);
    } catch (_) {
      return null;
    }
  }

  static Future<HealthFitnessModel> createHealthFitness(HealthFitnessModel record) async {
    final res = await ApiClient.post('/health-fitness', body: record.toJson());
    return HealthFitnessModel.fromJson(res);
  }

  static Future<HealthFitnessModel> updateHealthFitness(int id, HealthFitnessModel record) async {
    final res = await ApiClient.put('/health-fitness/$id', body: record.toJson());
    return HealthFitnessModel.fromJson(res);
  }

  static Future<void> deleteHealthFitness(int id) async {
    await ApiClient.delete('/health-fitness/$id');
  }

  // Emergency Contacts
  static Future<List<EmergencyContactModel>> getEmergencyContacts({int? userId}) async {
    final res = await ApiClient.get('/emergency-contacts', queryParameters: userId != null ? {'userId': userId} : null);
    return (res as List).map((e) => EmergencyContactModel.fromJson(e)).toList();
  }

  static Future<EmergencyContactModel> createEmergencyContact(EmergencyContactModel contact) async {
    final res = await ApiClient.post('/emergency-contacts', body: contact.toJson());
    return EmergencyContactModel.fromJson(res);
  }

  static Future<EmergencyContactModel> updateEmergencyContact(int id, EmergencyContactModel contact) async {
    final res = await ApiClient.put('/emergency-contacts/$id', body: contact.toJson());
    return EmergencyContactModel.fromJson(res);
  }

  static Future<void> deleteEmergencyContact(int id) async {
    await ApiClient.delete('/emergency-contacts/$id');
  }

  // Live Scores
  static Future<List<LiveScoreModel>> getLiveScores({String? sportType, String? status}) async {
    final params = <String, dynamic>{};
    if (sportType != null) params['sportType'] = sportType;
    if (status != null) params['status'] = status;

    final res = await ApiClient.get('/live-scores', queryParameters: params.isNotEmpty ? params : null);
    return (res as List).map((e) => LiveScoreModel.fromJson(e)).toList();
  }

  static Future<LiveScoreModel> createLiveScore(LiveScoreModel score) async {
    final res = await ApiClient.post('/live-scores', body: score.toJson());
    return LiveScoreModel.fromJson(res);
  }

  static Future<LiveScoreModel> updateLiveScore(int id, LiveScoreModel score) async {
    final res = await ApiClient.put('/live-scores/$id', body: score.toJson());
    return LiveScoreModel.fromJson(res);
  }

  static Future<void> deleteLiveScore(int id) async {
    await ApiClient.delete('/live-scores/$id');
  }

  // Chatbot
  static Future<dynamic> getChatbotWelcome() async {
    return await ApiClient.get('/chatbot/welcome');
  }

  static Future<dynamic> getChatbotQuickOptions() async {
    return await ApiClient.get('/chatbot/options');
  }

  static Future<dynamic> getChatbotFaqs() async {
    return await ApiClient.get('/chatbot/faqs');
  }

  static Future<dynamic> sendChatbotMessage(Map<String, dynamic> data) async {
    return await ApiClient.post('/chatbot/message', body: data);
  }
}
