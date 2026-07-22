package dev.dept.pe.repository;

import dev.dept.pe.model.FamilyDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FamilyDetailsRepository extends JpaRepository<FamilyDetails, Long> {
    Optional<FamilyDetails> findByUserFormId(Long userFormId);
}
