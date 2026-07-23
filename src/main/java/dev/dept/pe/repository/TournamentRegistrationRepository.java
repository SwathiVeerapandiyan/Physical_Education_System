package dev.dept.pe.repository;

import dev.dept.pe.model.TournamentRegistration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TournamentRegistrationRepository extends JpaRepository<TournamentRegistration, Long> {
    List<TournamentRegistration> findByTournamentId(Long tournamentId);
    List<TournamentRegistration> findByTeamId(Long teamId);
    List<TournamentRegistration> findByStatus(String status);
}
