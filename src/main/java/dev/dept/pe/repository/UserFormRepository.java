package dev.dept.pe.repository;

import dev.dept.pe.model.UserForm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserFormRepository extends JpaRepository<UserForm, Long> {
    Optional<UserForm> findByEmail(String email);
    Optional<UserForm> findByMobileNo(Long mobileNo);
    long countByGenderIgnoreCase(String gender);
}
