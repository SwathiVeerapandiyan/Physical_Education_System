package dev.dept.pe.config;

import dev.dept.pe.model.*;
import dev.dept.pe.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final UserFormRepository userFormRepository;
    private final FamilyDetailsRepository familyDetailsRepository;
    private final DocumentDetailsRepository documentDetailsRepository;
    private final SportsDetailsRepository sportsDetailsRepository;
    private final LiveScoreRepository liveScoreRepository;
    private final MatchRepository matchRepository;
    private final TournamentRepository tournamentRepository;
    private final TeamRepository teamRepository;
    private final NoticeBoardRepository noticeBoardRepository;

    @Autowired
    public DataInitializer(UserRepository userRepository,
                           UserFormRepository userFormRepository,
                           FamilyDetailsRepository familyDetailsRepository,
                           DocumentDetailsRepository documentDetailsRepository,
                           SportsDetailsRepository sportsDetailsRepository,
                           LiveScoreRepository liveScoreRepository,
                           MatchRepository matchRepository,
                           TournamentRepository tournamentRepository,
                           TeamRepository teamRepository,
                           NoticeBoardRepository noticeBoardRepository) {
        this.userRepository = userRepository;
        this.userFormRepository = userFormRepository;
        this.familyDetailsRepository = familyDetailsRepository;
        this.documentDetailsRepository = documentDetailsRepository;
        this.sportsDetailsRepository = sportsDetailsRepository;
        this.liveScoreRepository = liveScoreRepository;
        this.matchRepository = matchRepository;
        this.tournamentRepository = tournamentRepository;
        this.teamRepository = teamRepository;
        this.noticeBoardRepository = noticeBoardRepository;
    }

    @Override
    public void run(String... args) {
        seedUsers();
        seedSports();
        seedTournamentsAndTeams();
        seedMatches();
        seedLiveScores();
        seedNotices();
    }

    private void seedUsers() {
        // Seed Administrator
        if (userRepository.findByEmail("admin@mcc.edu").isEmpty() && userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setName("Department Administrator");
            admin.setUsername("admin");
            admin.setEmail("admin@mcc.edu");
            admin.setRegisterNo("ADMIN001");
            admin.setDept("Physical Education");
            admin.setMobileNo(9876543210L);
            admin.setPassword(BCrypt.hashpw("admin123", BCrypt.gensalt()));
            admin.setRole("ADMIN");
            userRepository.save(admin);
        }

        // Seed Sample Student
        if (userRepository.findByEmail("student@mcc.edu").isEmpty() && userRepository.findByUsername("student").isEmpty()) {
            User student = new User();
            student.setName("Alex Johnson");
            student.setUsername("student");
            student.setEmail("student@mcc.edu");
            student.setRegisterNo("24PE101");
            student.setDept("Computer Applications");
            student.setMobileNo(9876543211L);
            student.setPassword(BCrypt.hashpw("student123", BCrypt.gensalt()));
            student.setRole("STUDENT");
            userRepository.save(student);

            // Seed student profile form
            if (userFormRepository.findByEmail("student@mcc.edu").isEmpty()) {
                UserForm form = new UserForm();
                form.setName("Alex Johnson");
                form.setEmail("student@mcc.edu");
                form.setPassword(BCrypt.hashpw("student123", BCrypt.gensalt()));
                form.setBatch("2024-2026");
                form.setGender("MALE");
                form.setDob(LocalDate.of(2003, 5, 14));
                form.setMobileNo(9876543211L);
                form.setRegion("Tamil Nadu");
                form.setCommunity("General");
                form.setBloodGroup("O+");
                form.setNationality("Indian");
                form.setSpecialization("Football & Track Sprinting");
                form.setPermanentAddress("No. 12, University Avenue, Tambaram, Chennai");
                form.setGuardianAddress("No. 12, University Avenue, Tambaram, Chennai");
                form.setPurposeOfStudyingCourse("To develop professional athletic career and represent college in national leagues.");
                form.setSportsAchievement("Inter-collegiate 100m gold medalist 2024");
                UserForm savedForm = userFormRepository.save(form);

                // Seed family details
                if (familyDetailsRepository.findByUserFormId(savedForm.getId()).isEmpty()) {
                    FamilyDetails family = new FamilyDetails();
                    family.setUserFormId(savedForm.getId());
                    family.setFatherName("Robert Johnson");
                    family.setFatherOccupation("Senior Engineer");
                    family.setMotherName("Elena Johnson");
                    family.setMotherOccupation("Lecturer");
                    family.setSiblings("1 Brother");
                    family.setSiblingOccupation("Student");
                    familyDetailsRepository.save(family);
                }

                // Seed document details
                if (documentDetailsRepository.findByUserFormId(savedForm.getId()).isEmpty()) {
                    DocumentDetails doc = new DocumentDetails();
                    doc.setUserFormId(savedForm.getId());
                    doc.setAadharCard("AADHAR-8742-9912-3401");
                    doc.setFitnessMedicalCertificate("CERT-MED-FIT-2024-APPROVED");
                    doc.setAdmissionCard("ADM-CARD-24PE101");
                    doc.setSportsCertificate("CERT-SPORTS-GOLD-2024");
                    documentDetailsRepository.save(doc);
                }
            }
        }
    }

    private void seedSports() {
        if (sportsDetailsRepository.count() == 0) {
            saveSport("Football", "Outdoor", "Mr. David Miller", "11-a-side regulation field football with international standard turf.");
            saveSport("Basketball", "Indoor", "Ms. Sarah Jenkins", "Full-court indoor hardwood basketball with electronic score display.");
            saveSport("Badminton", "Indoor", "Mr. Prakash Kumar", "Four international grade synthetic badminton courts with LED floodlights.");
            saveSport("Cricket", "Outdoor", "Mr. Ravi Shastri", "Standard turf pitch and practice nets for collegiate championship.");
            saveSport("Volleyball", "Outdoor", "Mr. Ken Tanaka", "Clay and sand volleyball courts for department tournaments.");
            saveSport("Athletics", "Outdoor", "Dr. Robert Lewis", "400m 8-lane synthetic track with long jump pit and hurdles equipment.");
        }
    }

    private void saveSport(String name, String category, String coach, String desc) {
        SportsDetails sport = new SportsDetails();
        sport.setSportName(name);
        sport.setCategory(category);
        sport.setCoachName(coach);
        sport.setDescription(desc);
        sportsDetailsRepository.save(sport);
    }

    private void seedTournamentsAndTeams() {
        if (tournamentRepository.count() == 0) {
            Tournament t = new Tournament();
            t.setTournamentName("Inter-Collegiate Champions Trophy 2026");
            t.setOrganizer("Department of Physical Education");
            t.setVenue("MCC Sports Complex Stadium");
            t.setStartDate(LocalDate.now().plusDays(2));
            t.setEndDate(LocalDate.now().plusDays(7));
            t.setStatus("ONGOING");
            tournamentRepository.save(t);
        }

        if (teamRepository.count() == 0) {
            Team t1 = new Team();
            t1.setTeamName("MCC Tigers (MCA)");
            t1.setCaptainName("Alex Johnson");
            t1.setDepartment("MCA");
            t1.setSportId(1L);
            teamRepository.save(t1);

            Team t2 = new Team();
            t2.setTeamName("MCC Warriors (CSE)");
            t2.setCaptainName("David Raj");
            t2.setDepartment("CSE");
            t2.setSportId(1L);
            teamRepository.save(t2);
        }
    }

    private void seedMatches() {
        if (matchRepository.count() == 0) {
            Match m1 = new Match();
            m1.setTournamentId(1L);
            m1.setTeamOne(1L);
            m1.setTeamTwo(2L);
            m1.setVenue("Main University Stadium");
            m1.setMatchDate(LocalDateTime.now().plusHours(4));
            m1.setStatus("SCHEDULED");
            matchRepository.save(m1);

            Match m2 = new Match();
            m2.setTournamentId(1L);
            m2.setTeamOne(1L);
            m2.setTeamTwo(2L);
            m2.setVenue("Indoor Sports Arena");
            m2.setMatchDate(LocalDateTime.now().plusDays(1).plusHours(2));
            m2.setStatus("UPCOMING");
            matchRepository.save(m2);
        }
    }

    private void seedLiveScores() {
        if (liveScoreRepository.count() == 0) {
            LiveScore s1 = new LiveScore();
            s1.setMatchName("MCC Tigers vs MCC Warriors");
            s1.setSportType("Football");
            s1.setTeamOne("MCC Tigers");
            s1.setTeamTwo("MCC Warriors");
            s1.setTeamOneScore(2);
            s1.setTeamTwoScore(1);
            s1.setMatchStatus("LIVE");
            s1.setVenue("Main Football Stadium");
            s1.setMatchDate(LocalDate.now());
            s1.setWinner("In Progress");
            liveScoreRepository.save(s1);

            LiveScore s2 = new LiveScore();
            s2.setMatchName("MCC Basketball Final 2026");
            s2.setSportType("Basketball");
            s2.setTeamOne("MCC Raptors");
            s2.setTeamTwo("Loyola Knights");
            s2.setTeamOneScore(68);
            s2.setTeamTwoScore(64);
            s2.setMatchStatus("LIVE");
            s2.setVenue("Indoor Arena Court 1");
            s2.setMatchDate(LocalDate.now());
            s2.setWinner("In Progress");
            liveScoreRepository.save(s2);
        }
    }

    private void seedNotices() {
        if (noticeBoardRepository.count() == 0) {
            NoticeBoard n1 = new NoticeBoard();
            n1.setTitle("Annual Inter-Collegiate Athletics Meet 2026");
            n1.setCategory("TOURNAMENTS");
            n1.setDescription("Registrations are officially open for the Annual Athletics Championship across Track and Field events. Interested student athletes must complete registration before end of this week.");
            n1.setPublishDate(LocalDate.now());
            n1.setIsActive(true);
            n1.setCreatedBy("Department Administrator");
            noticeBoardRepository.save(n1);

            NoticeBoard n2 = new NoticeBoard();
            n2.setTitle("Sports Ground & Equipment Maintenance Notice");
            n2.setCategory("GENERAL");
            n2.setDescription("Main Football Turf and Track Courts will undergo maintenance every Monday 6:00 AM - 9:00 AM. Ground reservations and equipment checkout are paused during this window.");
            n2.setPublishDate(LocalDate.now());
            n2.setIsActive(true);
            n2.setCreatedBy("Department Administrator");
            noticeBoardRepository.save(n2);
        }
    }
}
