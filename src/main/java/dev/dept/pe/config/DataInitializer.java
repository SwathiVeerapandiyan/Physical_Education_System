package dev.dept.pe.config;

import dev.dept.pe.model.*;
import dev.dept.pe.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final UserFormRepository userFormRepository;
    private final SportsDetailsRepository sportsDetailsRepository;
    private final TournamentRepository tournamentRepository;
    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final MatchRepository matchRepository;
    private final LiveScoreRepository liveScoreRepository;
    private final NoticeBoardRepository noticeBoardRepository;
    private final EquipmentBookingRepository equipmentBookingRepository;
    private final GroundBookingRepository groundBookingRepository;
    private final HealthFitnessRepository healthFitnessRepository;
    private final EmergencyContactRepository emergencyContactRepository;
    private final FeedbackRepository feedbackRepository;
    private final GalleryRepository galleryRepository;

    @Autowired
    public DataInitializer(
            UserRepository userRepository,
            UserFormRepository userFormRepository,
            SportsDetailsRepository sportsDetailsRepository,
            TournamentRepository tournamentRepository,
            TeamRepository teamRepository,
            TeamMemberRepository teamMemberRepository,
            MatchRepository matchRepository,
            LiveScoreRepository liveScoreRepository,
            NoticeBoardRepository noticeBoardRepository,
            EquipmentBookingRepository equipmentBookingRepository,
            GroundBookingRepository groundBookingRepository,
            HealthFitnessRepository healthFitnessRepository,
            EmergencyContactRepository emergencyContactRepository,
            FeedbackRepository feedbackRepository,
            GalleryRepository galleryRepository) {
        this.userRepository = userRepository;
        this.userFormRepository = userFormRepository;
        this.sportsDetailsRepository = sportsDetailsRepository;
        this.tournamentRepository = tournamentRepository;
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.matchRepository = matchRepository;
        this.liveScoreRepository = liveScoreRepository;
        this.noticeBoardRepository = noticeBoardRepository;
        this.equipmentBookingRepository = equipmentBookingRepository;
        this.groundBookingRepository = groundBookingRepository;
        this.healthFitnessRepository = healthFitnessRepository;
        this.emergencyContactRepository = emergencyContactRepository;
        this.feedbackRepository = feedbackRepository;
        this.galleryRepository = galleryRepository;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            seedUsers();
        }
        if (sportsDetailsRepository.count() == 0) {
            seedSports();
        }
        if (tournamentRepository.count() == 0) {
            seedTournaments();
        }
        if (teamRepository.count() == 0) {
            seedTeams();
        }
        if (matchRepository.count() == 0) {
            seedMatches();
        }
        if (liveScoreRepository.count() == 0) {
            seedLiveScores();
        }
        if (noticeBoardRepository.count() == 0) {
            seedNotices();
        }
        if (equipmentBookingRepository.count() == 0) {
            seedEquipmentBookings();
        }
        if (groundBookingRepository.count() == 0) {
            seedGroundBookings();
        }
        if (healthFitnessRepository.count() == 0) {
            seedHealthFitness();
        }
        if (emergencyContactRepository.count() == 0) {
            seedEmergencyContacts();
        }
        if (feedbackRepository.count() == 0) {
            seedFeedback();
        }
        if (galleryRepository.count() == 0) {
            seedGallery();
        }
    }

    private void seedUsers() {
        String hashedAdminPw = BCrypt.hashpw("admin123", BCrypt.gensalt());
        String hashedStudentPw = BCrypt.hashpw("student123", BCrypt.gensalt());
        String hashedFacultyPw = BCrypt.hashpw("faculty123", BCrypt.gensalt());

        // 1. Admin
        User admin = new User();
        admin.setName("Admin Officer");
        admin.setUsername("admin");
        admin.setEmail("admin@gmail.com");
        admin.setDept("Physical Education");
        admin.setRegisterNo("ADMIN001");
        admin.setMobileNo(9876543210L);
        admin.setPassword(hashedAdminPw);
        admin.setRole("ADMIN");
        userRepository.save(admin);

        // 2. Student (Male)
        User student = new User();
        student.setName("Rahul Sharma");
        student.setUsername("student");
        student.setEmail("student@gmail.com");
        student.setDept("MCA");
        student.setRegisterNo("2024MCA001");
        student.setMobileNo(9876543211L);
        student.setPassword(hashedStudentPw);
        student.setRole("STUDENT");
        userRepository.save(student);

        // 3. Student (Female)
        User priya = new User();
        priya.setName("Priya Patel");
        priya.setUsername("priya");
        priya.setEmail("priya@gmail.com");
        priya.setDept("Computer Science");
        priya.setRegisterNo("2024CSE015");
        priya.setMobileNo(9876543212L);
        priya.setPassword(hashedStudentPw);
        priya.setRole("STUDENT");
        userRepository.save(priya);

        // 4. Faculty
        User faculty = new User();
        faculty.setName("Coach David");
        faculty.setUsername("faculty");
        faculty.setEmail("faculty@gmail.com");
        faculty.setDept("Physical Education");
        faculty.setRegisterNo("FAC001");
        faculty.setMobileNo(9876543213L);
        faculty.setPassword(hashedFacultyPw);
        faculty.setRole("FACULTY");
        userRepository.save(faculty);

        // Seed Candidate UserForms for Dashboard Stats
        UserForm form1 = new UserForm();
        form1.setName("Rahul Sharma");
        form1.setEmail("student@gmail.com");
        form1.setPassword("student123");
        form1.setBatch("2024-2026");
        form1.setGender("Male");
        form1.setDob(LocalDate.of(2001, 5, 14));
        form1.setMobileNo(9876543211L);
        form1.setSpecialization("Athletics");
        form1.setPermanentAddress("MCC Campus Hostel, Chennai");
        form1.setNationality("Indian");
        form1.setBloodGroup("O+");
        userFormRepository.save(form1);

        UserForm form2 = new UserForm();
        form2.setName("Priya Patel");
        form2.setEmail("priya@gmail.com");
        form2.setPassword("student123");
        form2.setBatch("2024-2028");
        form2.setGender("Female");
        form2.setDob(LocalDate.of(2002, 9, 21));
        form2.setMobileNo(9876543212L);
        form2.setSpecialization("Badminton");
        form2.setPermanentAddress("Guindy, Chennai");
        form2.setNationality("Indian");
        form2.setBloodGroup("B+");
        userFormRepository.save(form2);
    }

    private void seedSports() {
        sportsDetailsRepository.save(new SportsDetails(null, "Football", "Outdoor", "Coach David", "11-a-side outdoor football tournament & training."));
        sportsDetailsRepository.save(new SportsDetails(null, "Basketball", "Outdoor", "Coach Sarah", "5-a-side full-court basketball league."));
        sportsDetailsRepository.save(new SportsDetails(null, "Cricket", "Outdoor", "Coach Murugan", "T20 & One-Day inter-collegiate cricket tournament."));
        sportsDetailsRepository.save(new SportsDetails(null, "Badminton", "Indoor", "Coach Preeti", "Singles and doubles indoor badminton championship."));
        sportsDetailsRepository.save(new SportsDetails(null, "Athletics", "Outdoor", "Coach David", "Track and field events including 100m, 400m, relay, long jump."));
        sportsDetailsRepository.save(new SportsDetails(null, "Volleyball", "Outdoor", "Coach Kumar", "6-a-side volleyball tournament on outdoor sand/court."));
        sportsDetailsRepository.save(new SportsDetails(null, "Table Tennis", "Indoor", "Coach Preeti", "Indoor fast-paced table tennis competition."));
    }

    private void seedTournaments() {
        Tournament t1 = new Tournament();
        t1.setTournamentName("Annual Inter-College Sports Meet 2026");
        t1.setOrganizer("Madras Christian College PE Dept");
        t1.setVenue("Main Athletic Stadium & Sports Complex");
        t1.setStartDate(LocalDate.now().plusDays(2));
        t1.setEndDate(LocalDate.now().plusDays(5));
        t1.setStatus("ONGOING");
        tournamentRepository.save(t1);

        Tournament t2 = new Tournament();
        t2.setTournamentName("State Level Badminton Championship");
        t2.setOrganizer("MCC Badminton Association");
        t2.setVenue("Indoor Sports Pavilion Court 1 & 2");
        t2.setStartDate(LocalDate.now().plusDays(10));
        t2.setEndDate(LocalDate.now().plusDays(13));
        t2.setStatus("UPCOMING");
        tournamentRepository.save(t2);

        Tournament t3 = new Tournament();
        t3.setTournamentName("University Cricket Super Cup");
        t3.setOrganizer("University Sports Board");
        t3.setVenue("MCC Cricket Oval");
        t3.setStartDate(LocalDate.now().plusDays(20));
        t3.setEndDate(LocalDate.now().plusDays(25));
        t3.setStatus("UPCOMING");
        tournamentRepository.save(t3);
    }

    private void seedTeams() {
        Long sportId = sportsDetailsRepository.findAll().stream().findFirst().map(SportsDetails::getSportId).orElse(1L);

        Team team1 = new Team();
        team1.setTeamName("MCC Warriors FC");
        team1.setSportId(sportId);
        teamRepository.save(team1);

        Team team2 = new Team();
        team2.setTeamName("Falcons Football Club");
        team2.setSportId(sportId);
        teamRepository.save(team2);

        Team team3 = new Team();
        team3.setTeamName("MCC Smashers Badminton");
        team3.setSportId(sportId);
        teamRepository.save(team3);
    }

    private void seedMatches() {
        Match m1 = new Match();
        m1.setTournamentId(1L);
        m1.setTeamA("MCC Warriors FC");
        m1.setTeamB("Falcons FC");
        m1.setVenue("Main Football Stadium");
        m1.setMatchDate(LocalDateTime.now().plusHours(3));
        m1.setStatus("SCHEDULED");
        m1.setScore("0 - 0");
        matchRepository.save(m1);

        Match m2 = new Match();
        m2.setTournamentId(1L);
        m2.setTeamA("MCC Smashers");
        m2.setTeamB("Loyola Titans");
        m2.setVenue("Indoor Badminton Court A");
        m2.setMatchDate(LocalDateTime.now().minusDays(1));
        m2.setStatus("COMPLETED");
        m2.setScore("21-18, 21-15");
        m2.setWinner("MCC Smashers");
        matchRepository.save(m2);
    }

    private void seedLiveScores() {
        LiveScore ls1 = new LiveScore();
        ls1.setMatchName("MCC Warriors FC vs Falcons FC");
        ls1.setSportType("Football");
        ls1.setTeamOne("MCC Warriors");
        ls1.setTeamTwo("Falcons FC");
        ls1.setTeamOneScore(2);
        ls1.setTeamTwoScore(1);
        ls1.setMatchStatus("LIVE");
        ls1.setVenue("Main Stadium");
        ls1.setMatchDate(LocalDate.now());
        ls1.setStartTime(LocalTime.of(16, 0));
        liveScoreRepository.save(ls1);

        LiveScore ls2 = new LiveScore();
        ls2.setMatchName("MCC Titans vs Loyola Cricket Club");
        ls2.setSportType("Cricket");
        ls2.setTeamOne("MCC Titans");
        ls2.setTeamTwo("Loyola CC");
        ls2.setTeamOneScore(164);
        ls2.setTeamTwoScore(142);
        ls2.setMatchStatus("FINAL");
        ls2.setVenue("Cricket Oval");
        ls2.setMatchDate(LocalDate.now().minusDays(1));
        ls2.setStartTime(LocalTime.of(10, 0));
        ls2.setWinner("MCC Titans");
        liveScoreRepository.save(ls2);
    }

    private void seedNotices() {
        NoticeBoard n1 = new NoticeBoard();
        n1.setTitle("Annual Athletic Meet 2026 - Registrations Open");
        n1.setDescription("Registration for Track and Field events is now officially open for all department students. Submit entry forms before Friday.");
        n1.setCategory("ANNOUNCEMENT");
        n1.setPriority("HIGH");
        n1.setPublishDate(LocalDate.now());
        n1.setCreatedBy("PE Director");
        n1.setIsActive(true);
        noticeBoardRepository.save(n1);

        NoticeBoard n2 = new NoticeBoard();
        n2.setTitle("Badminton Selection Trials on Friday");
        n2.setDescription("Selection trials for the University Badminton Team will take place at the Indoor Sports Complex this Friday at 4:00 PM.");
        n2.setCategory("TRIALS");
        n2.setPriority("MEDIUM");
        n2.setPublishDate(LocalDate.now());
        n2.setCreatedBy("Coach Preeti");
        n2.setIsActive(true);
        noticeBoardRepository.save(n2);
    }

    private void seedEquipmentBookings() {
        EquipmentBooking eb1 = new EquipmentBooking();
        eb1.setUserId(2);
        eb1.setEquipmentName("Spalding Basketball");
        eb1.setEquipmentCategory("Outdoor");
        eb1.setQuantity(2);
        eb1.setBookingDate(LocalDate.now());
        eb1.setBookingStatus("Approved");
        eb1.setRemarks("Practice session on Court 2");
        equipmentBookingRepository.save(eb1);

        EquipmentBooking eb2 = new EquipmentBooking();
        eb2.setUserId(2);
        eb2.setEquipmentName("Yonex Badminton Rackets (Set of 2)");
        eb2.setEquipmentCategory("Indoor");
        eb2.setQuantity(1);
        eb2.setBookingDate(LocalDate.now().plusDays(1));
        eb2.setBookingStatus("Pending");
        eb2.setRemarks("Tournament warm-up");
        equipmentBookingRepository.save(eb2);
    }

    private void seedGroundBookings() {
        GroundBooking gb1 = new GroundBooking();
        gb1.setUserId(2);
        gb1.setGroundName("Main Football Turf");
        gb1.setSportType("Football");
        gb1.setBookingDate(LocalDate.now());
        gb1.setStartTime(LocalTime.of(16, 0));
        gb1.setEndTime(LocalTime.of(18, 0));
        gb1.setDurationHours(new BigDecimal("2.00"));
        gb1.setBookingStatus("Approved");
        gb1.setRemarks("Department Inter-Class Match");
        groundBookingRepository.save(gb1);

        GroundBooking gb2 = new GroundBooking();
        gb2.setUserId(2);
        gb2.setGroundName("Indoor Badminton Court 1");
        gb2.setSportType("Badminton");
        gb2.setBookingDate(LocalDate.now().plusDays(1));
        gb2.setStartTime(LocalTime.of(8, 0));
        gb2.setEndTime(LocalTime.of(10, 0));
        gb2.setDurationHours(new BigDecimal("2.00"));
        gb2.setBookingStatus("Pending");
        gb2.setRemarks("Morning training session");
        groundBookingRepository.save(gb2);
    }

    private void seedHealthFitness() {
        HealthFitness hf = new HealthFitness();
        hf.setUserId(2);
        hf.setHeightCm(new BigDecimal("178.00"));
        hf.setWeightKg(new BigDecimal("72.50"));
        hf.setBmi(new BigDecimal("22.88"));
        hf.setBloodGroup("O+");
        hf.setHeartRate(68);
        hf.setFitnessLevel("EXCELLENT");
        hf.setMedicalConditions("None");
        hf.setLastCheckup(LocalDate.now().minusWeeks(2));
        healthFitnessRepository.save(hf);
    }

    private void seedEmergencyContacts() {
        EmergencyContact ec1 = new EmergencyContact();
        ec1.setUserId(2);
        ec1.setContactName("Campus Health Center");
        ec1.setRelationship("Medical Officer");
        ec1.setPhoneNumber("+91 44 2239 0100");
        emergencyContactRepository.save(ec1);

        EmergencyContact ec2 = new EmergencyContact();
        ec2.setUserId(2);
        ec2.setContactName("Coach David");
        ec2.setRelationship("Head Athletics Coach");
        ec2.setPhoneNumber("+91 94440 12345");
        emergencyContactRepository.save(ec2);
    }

    private void seedFeedback() {
        Feedback fb1 = new Feedback();
        fb1.setUserId(2);
        fb1.setUserName("Rahul Sharma");
        fb1.setEmail("student@gmail.com");
        fb1.setSubject("Great Maintenance of Football Ground");
        fb1.setMessage("The newly laid turf is in fantastic condition. Appreciation to the sports ground crew.");
        fb1.setRating(5);
        fb1.setFeedbackType("FACILITY");
        fb1.setStatus("RESOLVED");
        feedbackRepository.save(fb1);
    }

    private void seedGallery() {
        Gallery g1 = new Gallery();
        g1.setTitle("Annual Athletics Sprint");
        g1.setEventName("Annual Sports Day 2025");
        g1.setImageUrl("https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80");
        g1.setDescription("Athletes lining up for the 100m sprint finals.");
        g1.setEventDate(java.time.LocalDate.now().minusDays(10));
        g1.setUploadedBy("Sports Director");
        g1.setIsActive(true);
        galleryRepository.save(g1);

        Gallery g2 = new Gallery();
        g2.setTitle("Championship Victory");
        g2.setEventName("Inter-Collegiate Football Cup");
        g2.setImageUrl("https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80");
        g2.setDescription("MCC Football Team celebrating championship trophy victory.");
        g2.setEventDate(java.time.LocalDate.now().minusDays(3));
        g2.setUploadedBy("Coach");
        g2.setIsActive(true);
        galleryRepository.save(g2);
    }
}
