package dev.dept.pe.repository;

import dev.dept.pe.model.GroundBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroundBookingRepository extends JpaRepository<GroundBooking, Long> {
    List<GroundBooking> findByUserId(Integer userId);
    List<GroundBooking> findByBookingStatus(String bookingStatus);
}
