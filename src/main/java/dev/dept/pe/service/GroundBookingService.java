package dev.dept.pe.service;

import dev.dept.pe.dto.GroundBookingDto;

import java.util.List;

public interface GroundBookingService {
    GroundBookingDto create(GroundBookingDto dto);
    List<GroundBookingDto> getAll(Integer userId, String status);
    GroundBookingDto getById(Long id);
    GroundBookingDto update(Long id, GroundBookingDto dto);
    void delete(Long id);
}
