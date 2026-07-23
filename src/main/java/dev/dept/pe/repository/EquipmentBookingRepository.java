package dev.dept.pe.repository;

import dev.dept.pe.model.EquipmentBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EquipmentBookingRepository extends JpaRepository<EquipmentBooking, Long> {
    List<EquipmentBooking> findByUserId(Integer userId);
    List<EquipmentBooking> findByBookingStatus(String bookingStatus);
}
