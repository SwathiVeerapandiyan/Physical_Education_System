package dev.dept.pe.repository;

import dev.dept.pe.model.SportsDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SportsDetailsRepository extends JpaRepository<SportsDetails, Long> {
    Optional<SportsDetails> findBySportName(String sportName);
}
