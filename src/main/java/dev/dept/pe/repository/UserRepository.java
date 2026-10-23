package dev.dept.pe.repository;

import dev.dept.pe.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailIgnoreCase(String email);
    Optional<User> findByRegisterNo(String registerNo);
    Optional<User> findByRegisterNoIgnoreCase(String registerNo);
    Optional<User> findByMobileNo(Long mobileNo);
    Optional<User> findByName(String name);
    Optional<User> findByNameIgnoreCase(String name);
    Optional<User> findByUsername(String username);
    Optional<User> findByUsernameIgnoreCase(String username);
}

