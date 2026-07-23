package dev.dept.pe.service;

import dev.dept.pe.dto.EquipmentBookingDto;

import java.util.List;

public interface EquipmentBookingService {
    EquipmentBookingDto create(EquipmentBookingDto dto);
    List<EquipmentBookingDto> getAll(Integer userId, String status);
    EquipmentBookingDto getById(Long id);
    EquipmentBookingDto update(Long id, EquipmentBookingDto dto);
    void delete(Long id);
}
